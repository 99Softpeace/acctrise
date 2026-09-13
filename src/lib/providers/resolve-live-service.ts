import { connectMongo } from "@/lib/mongodb";
import { getUsdToNgnRate } from "@/lib/pricing/exchange-rate";
import { applyNumberServiceProfitMargin, applyTikTokLikesNgnPriceRange, applyUsaWhatsappPrice } from "@/lib/pricing/profit-margin";
import { Category } from "@/models/category";
import { Provider } from "@/models/provider";
import { ProviderService } from "@/models/provider-service";
import { Service } from "@/models/service";
import { fetchLiveServices, normalizeLiveServiceName, type LiveServiceKind } from "./live-services";

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
  if (!serviceName?.trim()) throw new Error("Select a valid verification service.");

  const expectedExternalId = `${normalizeLiveServiceName(resolvedCountryName)}:${normalizeLiveServiceName(serviceName)}`;
  if (externalId !== expectedExternalId) {
    throw new Error("The selected service is no longer available. Refresh and try again.");
  }

  // Resolve only the selected service. Fetching the full catalog again made
  // checkout both slow and vulnerable to a transient provider timeout after
  // the service had already been shown as available.
  const resolvedMappings = (await Promise.all(enabled.map(async (definition) => {
    const apiKey = process.env[definition.envKey]!.trim();
    try {
      const adapter = new definition.Adapter(definition.slug, { apiKey, timeout: 20000 });
      const mapping = await adapter.resolveService(resolvedCountryName, serviceName);
      return mapping ? { definition, apiKey, mapping } : null;
    } catch (error) {
      console.warn("[number-provider-resolution]", { provider: definition.slug, error: error instanceof Error ? error.message : "Resolution failed" });
      return null;
    }
  }))).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  if (!resolvedMappings.length) {
    throw new Error("This number is no longer available from the provider. Refresh and choose another service.");
  }

  await connectMongo();
  const serviceSlug = slugify(`numbers-${externalId}`);
  const existingService = await Service.findOne({ slug: serviceSlug });
  const knownProviders = existingService
    ? await Provider.find({ slug: { $in: enabled.map(({ slug }) => slug) } }).select("_id")
    : [];
  const knownMappings = existingService && knownProviders.length
    ? await ProviderService.find({
      serviceId: existingService._id,
      providerId: { $in: knownProviders.map(({ _id }) => _id) },
      isActive: true
    }).lean()
    : [];

  // Match catalog pricing and keep known backup costs as a floor when one
  // provider temporarily times out during checkout resolution.
  const providerPriceUsd = Math.max(
    ...resolvedMappings.map(({ mapping }) => mapping.price),
    ...knownMappings.map((mapping) => Number(mapping.providerPriceCents) / 100)
  );
  const livePriceUsd = applyNumberServiceProfitMargin(providerPriceUsd);
  const stock = Math.max(
    ...resolvedMappings.map(({ mapping }) => mapping.stock),
    ...knownMappings.map((mapping) => Number(mapping.stock || 0))
  );

  const categorySlug = slugify(`live-${kind}`);
  const category = await Category.findOneAndUpdate(
    { slug: categorySlug },
    { $setOnInsert: { name: `Live ${kind}`, slug: categorySlug, description: "GrizzlySMS and SMSBower live services" } },
    { upsert: true, returnDocument: "after" }
  );
  const exchange = await getUsdToNgnRate();
  const customerPriceUsd = applyUsaWhatsappPrice(
    livePriceUsd,
    exchange.rate,
    kind,
    resolvedCountryName,
    serviceName
  );
  const customerNgnCents = Math.max(Math.round(customerPriceUsd * exchange.rate * 100), 0);
  const service = await Service.findOneAndUpdate(
    { slug: serviceSlug },
    { $set: { name: serviceName, description: "SMS verification service", categoryId: category._id, priceCents: customerNgnCents, minOrder: 1, maxOrder: 1, stock, isActive: true } },
    { upsert: true, returnDocument: "after" }
  );

  await Promise.all(resolvedMappings.map(async ({ definition, apiKey, mapping }) => {
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
  }));
  return { serviceId: service._id.toString(), additionalInfo: { kind, countryId, countryName: resolvedCountryName } };
}
