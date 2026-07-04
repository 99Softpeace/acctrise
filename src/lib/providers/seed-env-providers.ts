import pino from "pino";
import { connectMongo } from "@/lib/mongodb";
import { BulkAccAdapter } from "@/lib/providers/adapters/bulkacc-adapter";
import type { BaseProviderAdapter, ProviderConfig, ServiceMapping } from "@/lib/providers/base-adapter";
import { ResellingSMMAdapter } from "@/lib/providers/adapters/smm-adapter";
import { SMSPoolAdapter } from "@/lib/providers/adapters/sms-pool-adapter";
import { Category } from "@/models/category";
import { Provider } from "@/models/provider";
import { ProviderService } from "@/models/provider-service";
import { Service } from "@/models/service";

type AdapterClass = new (id: string, config: ProviderConfig, logger?: any) => BaseProviderAdapter;

const envProviders: Array<{
  name: string;
  slug: string;
  type: "logs" | "virtual-numbers" | "smm";
  envKey: "BULKACC_API_KEY" | "SMSPOOL_API_KEY" | "RESELLER_SMM_API_KEY";
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
    name: "SMSPool",
    slug: "smspool",
    type: "virtual-numbers",
    envKey: "SMSPOOL_API_KEY",
    description: "Virtual numbers, USA premium numbers, and SMS verification provider",
    adapter: SMSPoolAdapter
  },
  {
    name: "Reseller SMM",
    slug: "reseller-smm",
    type: "smm",
    envKey: "RESELLER_SMM_API_KEY",
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
  let synced = 0;

  for (const externalService of services) {
    const categoryName = externalService.description?.split(" - ")[0] || providerName;
    const categorySlug = slugify(`${providerType}-${categoryName || "services"}`);
    const category = await Category.findOneAndUpdate(
      { slug: categorySlug },
      {
        $setOnInsert: {
          name: categoryName,
          slug: categorySlug,
          description: `Synchronized ${providerName} category`
        }
      },
      { returnDocument: "after", upsert: true }
    );

    const serviceSlug = slugify(`${providerSlug}-${externalService.externalId}-${externalService.name}`);
    const service = await Service.findOneAndUpdate(
      { slug: serviceSlug },
      {
        $set: {
          name: externalService.name,
          description: externalService.description,
          categoryId: category._id,
          priceCents: cents(externalService.price),
          minOrder: externalService.minOrder,
          maxOrder: externalService.maxOrder,
          isActive: true
        }
      },
      { returnDocument: "after", upsert: true }
    );

    await ProviderService.findOneAndUpdate(
      { providerId, externalId: externalService.externalId },
      {
        $set: {
          providerId,
          serviceId: service._id,
          externalId: externalService.externalId,
          externalName: externalService.name,
          providerPriceCents: cents(externalService.price),
          costPriceCents: cents(externalService.price),
          isActive: true,
          lastSyncedAt: new Date()
        }
      },
      { returnDocument: "after", upsert: true }
    );

    synced++;
  }

  return synced;
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
