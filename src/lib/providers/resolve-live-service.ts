import { connectMongo } from "@/lib/mongodb";
import { getUsdToNgnRate } from "@/lib/pricing/exchange-rate";
import { Category } from "@/models/category";
import { Provider } from "@/models/provider";
import { ProviderService } from "@/models/provider-service";
import { Service } from "@/models/service";
import { fetchLiveServices, type LiveServiceKind } from "./live-services";

const providerByKind: Record<LiveServiceKind, { name: string; slug: string; type: string; envKey: string }> = {
  boosting: { name: "JustAnotherPanel", slug: "justanotherpanel", type: "smm", envKey: "JUSTANOTHERPANEL_API_KEY" },
  logs: { name: "Bulkacc", slug: "bulkacc", type: "logs", envKey: "BULKACC_API_KEY" },
  "foreign-numbers": { name: "SMSPool", slug: "smspool", type: "virtual-numbers", envKey: "SMSPOOL_API_KEY" },
  "uk-premium": { name: "SMSPool", slug: "smspool", type: "virtual-numbers", envKey: "SMSPOOL_API_KEY" },
  esim: { name: "SMSPool", slug: "smspool", type: "virtual-numbers", envKey: "SMSPOOL_API_KEY" }
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

export async function resolveLiveService(kind: LiveServiceKind, externalId: string, countryId?: string, countryName?: string, serviceName?: string) {
  const definition = providerByKind[kind];
  const apiKey = process.env[definition.envKey]?.trim();
  if (!apiKey) throw new Error(`${definition.name} is not configured.`);

  const result = await fetchLiveServices(kind, { countryId, countryName, query: serviceName, limit: 60 });
  const live = result.services.find((service) => service.externalId === externalId);
  if (!live) throw new Error("The selected service is no longer available. Refresh and try again.");
  if (kind === "logs" && live.stock !== undefined && live.stock <= 0) throw new Error("This product is currently out of stock.");

  await connectMongo();
  const provider = await Provider.findOneAndUpdate(
    { slug: definition.slug },
    { $set: { name: definition.name, slug: definition.slug, type: definition.type, status: "ACTIVE", isHealthy: true, config: { apiKey } } },
    { upsert: true, returnDocument: "after" }
  );
  const categorySlug = kind === "boosting" ? "smm-boosting" : slugify(`live-${kind}`);
  const category = await Category.findOneAndUpdate(
    { slug: categorySlug },
    { $setOnInsert: { name: `Live ${kind}`, slug: categorySlug, description: `${definition.name} live services` } },
    { upsert: true, returnDocument: "after" }
  );
  const exchange = await getUsdToNgnRate();
  const providerUsdCents = Math.max(Math.round(live.price * 100), 0);
  const customerNgnCents = Math.max(Math.round(live.price * exchange.rate * 100), 0);
  const service = await Service.findOneAndUpdate(
    { slug: slugify(`${definition.slug}-${kind}-${externalId}`) },
    { $set: { name: live.name, description: live.description, categoryId: category._id, priceCents: customerNgnCents, minOrder: live.minOrder, maxOrder: live.maxOrder, stock: live.maxOrder, isActive: true } },
    { upsert: true, returnDocument: "after" }
  );
  await ProviderService.findOneAndUpdate(
    { providerId: provider._id, externalId },
    { $set: { providerId: provider._id, serviceId: service._id, externalId, externalName: live.name, providerPriceCents: providerUsdCents, costPriceCents: providerUsdCents, isActive: true, lastSyncedAt: new Date() } },
    { upsert: true, returnDocument: "after" }
  );

  return { serviceId: service._id.toString(), additionalInfo: { kind, countryId, providerServiceId: live.serviceId } };
}
