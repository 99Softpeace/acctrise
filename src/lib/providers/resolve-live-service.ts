import { connectMongo } from "@/lib/mongodb";
import { getUsdToNgnRate } from "@/lib/pricing/exchange-rate";
import { applyTikTokLikesNgnPriceRange, applyUsaWhatsappPrice } from "@/lib/pricing/profit-margin";
import { Category } from "@/models/category";
import { Provider } from "@/models/provider";
import { ProviderService } from "@/models/provider-service";
import { Service } from "@/models/service";
import { fetchLiveServices, type LiveServiceKind } from "./live-services";

import { GrizzlySMSAdapter } from './adapters/grizzly-sms-adapter';
import { SMSBowerAdapter } from './adapters/sms-bower-adapter';
import type { SmsActivateAdapter } from './adapters/sms-activate-adapter';

const numberProviders: Array<{
  name: string;
  slug: string;
  envKey: string;
  adapterKey: string;
  Adapter: new (id: string, config: { apiKey: string; timeout?: number }) => SmsActivateAdapter;
}> = [
  { name: 'GrizzlySMS', slug: 'grizzly-sms', envKey: 'GRIZZLY_SMS_API_KEY', adapterKey: 'grizzly-sms', Adapter: GrizzlySMSAdapter },
  { name: 'SMSBower', slug: 'smsbower', envKey: 'SMSBOWER_API_KEY', adapterKey: 'smsbower', Adapter: SMSBowerAdapter }
];

const providerByKind: Record<Exclude<LiveServiceKind, "foreign-numbers" | "uk-premium">, { name: string; slug: string; type: string; envKey: string }> = {
  boosting: { name: "JustAnotherPanel", slug: "justanotherpanel", type: "smm", envKey: "JUSTANOTHERPANEL_API_KEY" },
  logs: { name: "Bulkacc", slug: "bulkacc", type: "logs", envKey: "BULKACC_API_KEY" },
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

export async function resolveLiveService(kind: LiveServiceKind, externalId: string, countryId?: string, countryName?: string, serviceName?: string) {
  if (kind === "foreign-numbers" || kind === "uk-premium") {
    return resolveNumberService(kind, externalId, countryId, countryName, serviceName);
  }
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
  const customerPriceUsd = applyTikTokLikesNgnPriceRange(
    live.price,
    exchange.rate,
    `${live.name} ${live.description || ""}`
  );
  const customerNgnCents = Math.max(Math.round(customerPriceUsd * exchange.rate * 100), 0);
  const existingMapping = await ProviderService.findOne({ providerId: provider._id, externalId });
  const service = await Service.findOneAndUpdate(
    existingMapping?.serviceId
      ? { _id: existingMapping.serviceId }
      : { slug: slugify(`${definition.slug}-${externalId}`) },
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

async function resolveNumberService(kind: Extract<LiveServiceKind, "foreign-numbers" | "uk-premium">, externalId: string, countryId?: string, countryName?: string, serviceName?: string) {
  const enabled = numberProviders.filter((provider) => process.env[provider.envKey]?.trim());
  if (!enabled.length) throw new Error("No number provider is configured.");
  const resolvedCountryName = kind === "uk-premium" ? "United States" : countryName || "";
  if (!resolvedCountryName) throw new Error("Select a valid country.");

  const result = await fetchLiveServices(kind, { countryId, countryName: resolvedCountryName, query: serviceName, limit: 60 });
  const live = result.services.find((service) => service.externalId === externalId);
  if (!live) throw new Error("The selected service is no longer available. Refresh and try again.");

  await connectMongo();
  const categorySlug = slugify(`live-${kind}`);
  const category = await Category.findOneAndUpdate(
    { slug: categorySlug },
    { $setOnInsert: { name: `Live ${kind}`, slug: categorySlug, description: "GrizzlySMS and SMSBower live services" } },
    { upsert: true, returnDocument: "after" }
  );
  const exchange = await getUsdToNgnRate();
  const customerPriceUsd = applyUsaWhatsappPrice(
    live.price,
    exchange.rate,
    kind,
    resolvedCountryName,
    `${live.name} ${live.description || ""}`
  );
  const customerNgnCents = Math.max(Math.round(customerPriceUsd * exchange.rate * 100), 0);
  const service = await Service.findOneAndUpdate(
    { slug: slugify(`numbers-${externalId}`) },
    { $set: { name: live.name, description: live.description, categoryId: category._id, priceCents: customerNgnCents, minOrder: 1, maxOrder: 1, stock: live.stock, isActive: true } },
    { upsert: true, returnDocument: "after" }
  );

  let mappings = 0;
  await Promise.all(enabled.map(async (definition) => {
    const apiKey = process.env[definition.envKey]!.trim();
    try {
      const adapter = new definition.Adapter(definition.slug, { apiKey, timeout: 20000 });
      const mapping = await adapter.resolveService(resolvedCountryName, live.name);
      if (!mapping) return;
      const provider = await Provider.findOneAndUpdate(
        { slug: definition.slug },
        { $set: { name: definition.name, slug: definition.slug, type: "virtual-numbers", status: "ACTIVE", isHealthy: true, config: { apiKey, adapter: definition.adapterKey } } },
        { upsert: true, returnDocument: "after" }
      );
      const priceCents = Math.max(Math.round(mapping.price * 100), 0);
      await ProviderService.findOneAndUpdate(
        { providerId: provider._id, externalId: mapping.externalId },
        { $set: { providerId: provider._id, serviceId: service._id, externalId: mapping.externalId, externalName: mapping.externalName, providerPriceCents: priceCents, costPriceCents: priceCents, stock: mapping.stock, isActive: true, lastSyncedAt: new Date() } },
        { upsert: true, returnDocument: "after" }
      );
      mappings += 1;
    } catch (error) {
      console.warn("[number-provider-mapping]", { provider: definition.slug, error: error instanceof Error ? error.message : "Mapping failed" });
    }
  }));
  if (!mappings) throw new Error("Neither GrizzlySMS nor SMSBower currently has this number available.");
  return { serviceId: service._id.toString(), additionalInfo: { kind, countryId, countryName: resolvedCountryName } };
}
