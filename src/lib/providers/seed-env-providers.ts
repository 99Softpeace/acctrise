import pino from "pino";
import { connectMongo } from "@/lib/mongodb";
import { BulkAccAdapter } from "@/lib/providers/adapters/bulkacc-adapter";
import { applyProfitMarginCents } from "@/lib/pricing/profit-margin";
import type { BaseProviderAdapter, ProviderConfig, ServiceMapping } from "@/lib/providers/base-adapter";
import { ResellingSMMAdapter } from "@/lib/providers/adapters/smm-adapter";
import { Category } from "@/models/category";
import { Provider } from "@/models/provider";
import { ProviderService } from "@/models/provider-service";
import { Service } from "@/models/service";
import { fetchJustAnotherPanelUpdates } from "@/lib/providers/justanotherpanel-updates";

type AdapterClass = new (id: string, config: ProviderConfig, logger?: any) => BaseProviderAdapter;

const envProviders: Array<{
  name: string;
  slug: string;
  type: "logs" | "smm";
  envKey: "BULKACC_API_KEY" | "JUSTANOTHERPANEL_API_KEY";
  description: string;
  adapter: AdapterClass;
}> = [
  {
    name: "Bulkacc",
    slug: "bulkacc",
    type: "logs",
    envKey: "BULKACC_API_KEY",
    description: "Account logs and account product provider",
    adapter: BulkAccAdapter
  },
  {
    name: "JustAnotherPanel",
    slug: "justanotherpanel",
    type: "smm",
    envKey: "JUSTANOTHERPANEL_API_KEY",
    description: "Social media boosting provider",
    adapter: ResellingSMMAdapter
  }
];

function getRequiredEnv(key: string) {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`${key} is not configured.`);
  return value;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function cents(value: number): number {
  return Math.max(Math.round(Number(value || 0) * 100), 0);
}

function providerSeedLimit() {
  const value = Number(process.env.PROVIDER_SEED_LIMIT ?? 300);
  if (!Number.isFinite(value) || value < 0) return 300;
  return Math.floor(value);
}
async function syncProviderServices({
  providerId,
  providerName,
  providerSlug,
  providerType,
  services
}: {
  providerId: any;
  providerName: string;
  providerSlug: string;
  providerType: string;
  services: ServiceMapping[];
}) {
  const categoryDefinitions = new Map<string, { name: string; slug: string }>();
  for (const externalService of services) {
    const categoryName = externalService.description?.split(" - ")[0] || providerName;
    const categorySlug = slugify(`${providerType}-${categoryName || "services"}`);
    categoryDefinitions.set(categorySlug, { name: categoryName, slug: categorySlug });
  }

  await Category.bulkWrite(
    [...categoryDefinitions.values()].map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: {
          $setOnInsert: {
            name: category.name,
            slug: category.slug,
            description: `Synchronized ${providerName} category`
          }
        },
        upsert: true
      }
    })),
    { ordered: false }
  );
  const categoryDocuments = await Category.find({
    slug: { $in: [...categoryDefinitions.keys()] }
  }).select("_id slug");
  const categories = new Map(categoryDocuments.map((category) => [category.slug, category._id]));

  await Service.bulkWrite(
    services.map((externalService) => {
      const categoryName = externalService.description?.split(" - ")[0] || providerName;
      const categorySlug = slugify(`${providerType}-${categoryName || "services"}`);
      const categoryId = categories.get(categorySlug);
      if (!categoryId) throw new Error(`Category resolution failed for ${categorySlug}.`);
      const serviceSlug = slugify(`${providerSlug}-${externalService.externalId}-${externalService.name}`);
      return {
        updateOne: {
          filter: { slug: serviceSlug },
          update: {
            $set: {
              name: externalService.name,
              description: externalService.description,
              categoryId,
              priceCents: applyProfitMarginCents(cents(externalService.price)),
              minOrder: externalService.minOrder,
              maxOrder: externalService.maxOrder,
              isActive: true
            }
          },
          upsert: true
        }
      };
    }),
    { ordered: false }
  );

  const serviceSlugs = services.map((externalService) =>
    slugify(`${providerSlug}-${externalService.externalId}-${externalService.name}`)
  );
  const serviceDocuments = await Service.find({ slug: { $in: serviceSlugs } }).select("_id slug");
  const serviceIds = new Map(serviceDocuments.map((service) => [service.slug, service._id]));
  const syncedAt = new Date();

  await ProviderService.bulkWrite(
    services.map((externalService) => {
      const serviceSlug = slugify(`${providerSlug}-${externalService.externalId}-${externalService.name}`);
      const serviceId = serviceIds.get(serviceSlug);
      if (!serviceId) throw new Error(`Service resolution failed for ${serviceSlug}.`);
      return {
        updateOne: {
          filter: { providerId, externalId: externalService.externalId },
          update: {
            $set: {
              providerId,
              serviceId,
              externalId: externalService.externalId,
              externalName: externalService.name,
              providerPriceCents: cents(externalService.price),
              costPriceCents: cents(externalService.price),
              isActive: true,
              lastSyncedAt: syncedAt
            }
          },
          upsert: true
        }
      };
    }),
    { ordered: false }
  );

  return services.length;
}

export async function seedEnvProviders({ syncServices = true } = {}) {
  await connectMongo();
  const logger = pino({ level: process.env.LOG_LEVEL || "info" });

  const results = [];
  for (const provider of envProviders) {
    const apiKey = getRequiredEnv(provider.envKey);
    const document = await Provider.findOneAndUpdate(
      { slug: provider.slug },
      {
        $set: {
          name: provider.name,
          slug: provider.slug,
          type: provider.type,
          description: provider.description,
          status: "ACTIVE",
          isHealthy: true,
          syncInterval: 300,
          config: { apiKey }
        }
      },
      { returnDocument: "after", upsert: true }
    );

    let serviceCount = 0;
    let totalAvailable = 0;
    let syncError: string | null = null;
    if (syncServices) {
      try {
        const adapter = new provider.adapter(document._id.toString(), { apiKey, timeout: 20000 }, logger);
        const fetchedServices = await adapter.fetchServices();
        totalAvailable = fetchedServices.length;
        const limit = providerSeedLimit();
        const services = limit === 0 ? fetchedServices : fetchedServices.slice(0, limit);
        serviceCount = await syncProviderServices({
          providerId: document._id,
          providerName: document.name,
          providerSlug: document.slug,
          providerType: document.type,
          services
        });
        await Provider.updateOne({ _id: document._id }, { $set: { lastSyncAt: new Date(), isHealthy: true } });
      } catch (error) {
        syncError = error instanceof Error ? error.message : "Provider service sync failed";
        await Provider.updateOne({ _id: document._id }, { $set: { isHealthy: false, status: "ERROR" } });
      }
    }

    results.push({
      id: document._id.toString(),
      slug: document.slug,
      type: document.type,
      status: syncError ? "ERROR" : document.status,
      serviceCount,
      totalAvailable,
      syncError
    });
  }

  return results;
}

export async function syncJustAnotherPanelServices() {
  await connectMongo();
  const definition = envProviders.find((provider) => provider.slug === "justanotherpanel");
  if (!definition) throw new Error("JustAnotherPanel provider definition is missing.");

  const apiKey = getRequiredEnv(definition.envKey);
  const logger = pino({ level: process.env.LOG_LEVEL || "info" });
  const provider = await Provider.findOneAndUpdate(
    { slug: definition.slug },
    {
      $set: {
        name: definition.name,
        slug: definition.slug,
        type: definition.type,
        description: definition.description,
        status: "ACTIVE",
        isHealthy: true,
        syncInterval: 3600,
        config: { apiKey }
      }
    },
    { returnDocument: "after", upsert: true }
  );

  try {
    const updates = await fetchJustAnotherPanelUpdates();
    const updateServiceIds = new Set(updates.serviceIds);
    const adapter = new definition.adapter(
      provider._id.toString(),
      { apiKey, timeout: 20000 },
      logger
    );
    const fetchedServices = await adapter.fetchServices();
    const services = fetchedServices.filter((service) => updateServiceIds.has(service.externalId));
    if (!services.length) {
      throw new Error("None of the services listed in JustAnotherPanel updates exist in the API catalogue.");
    }
    const synced = await syncProviderServices({
      providerId: provider._id,
      providerName: provider.name,
      providerSlug: provider.slug,
      providerType: provider.type,
      services
    });

    const syncedAt = new Date();
    await Provider.updateOne(
      { _id: provider._id },
      { $set: { lastSyncAt: syncedAt, isHealthy: true, status: "ACTIVE" } }
    );

    return {
      provider: definition.name,
      synced,
      totalAvailable: fetchedServices.length,
      updatePostsScanned: updates.postsScanned,
      listedServiceIds: updates.serviceIds.length,
      unmatchedServiceIds: updates.serviceIds.length - services.length,
      updatesFetchedAt: updates.fetchedAt,
      syncedAt: syncedAt.toISOString()
    };
  } catch (error) {
    await Provider.updateOne(
      { _id: provider._id },
      { $set: { isHealthy: false, status: "ERROR" } }
    );
    throw error;
  }
}
