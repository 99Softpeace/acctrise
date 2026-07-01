/**
 * Background Jobs Configuration
 * BullMQ queues keep external API traffic out of dashboard/page loads.
 */

import { Queue, Worker } from "bullmq";
import { getRedisClient } from "@/lib/cache/redis";
import { connectMongo } from "@/lib/mongodb";
import { getServices } from "@/lib/services";
import { Category } from "@/models/category";
import { Order } from "@/models/order";
import { Provider } from "@/models/provider";
import { ProviderOrder } from "@/models/provider-order";
import { ProviderService } from "@/models/provider-service";
import { Service } from "@/models/service";

const connection = getRedisClient() as any;

export const syncServicesQueue = new Queue("sync-services", { connection });
export const checkOrderStatusQueue = new Queue("check-order-status", { connection });
export const providerHealthCheckQueue = new Queue("provider-health-check", { connection });
export const syncPricingQueue = new Queue("sync-pricing", { connection });
export const notificationQueue = new Queue("notifications", { connection });

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function syncCron(): string {
  const minutes = Number(process.env.SERVICE_SYNC_INTERVAL_MINUTES || 5);
  const safeMinutes = [5, 15, 30, 60].includes(minutes) ? minutes : 5;
  return safeMinutes === 60 ? "0 * * * *" : `*/${safeMinutes} * * * *`;
}

function cents(value: number): number {
  return Math.max(Math.round(Number(value || 0) * 100), 0);
}

async function syncProviderServices(providerId: string) {
  await connectMongo();
  const { providers } = getServices();
  const provider = await Provider.findById(providerId);

  if (!provider || provider.status !== "ACTIVE") return { providerId, skipped: true };

  const adapter = await providers.getProvider(provider._id.toString());
  if (!adapter) return { providerId, skipped: true };

  const externalServices = await adapter.fetchServices();
  const cacheKey = `provider:${provider._id.toString()}:services`;
  await connection.set(cacheKey, JSON.stringify(externalServices), "EX", provider.syncInterval || 300);

  let synced = 0;
  for (const externalService of externalServices) {
    const categoryName = externalService.description?.split(" - ")[0] || provider.name;
    const categorySlug = slugify(`${provider.type}-${categoryName || "services"}`);
    const category = await Category.findOneAndUpdate(
      { slug: categorySlug },
      {
        $setOnInsert: {
          name: categoryName,
          slug: categorySlug,
          description: `Synchronized ${provider.name} category`
        }
      },
      { new: true, upsert: true }
    );

    const serviceSlug = slugify(`${provider.slug}-${externalService.externalId}-${externalService.name}`);
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
      { new: true, upsert: true }
    );

    await ProviderService.findOneAndUpdate(
      { providerId: provider._id, externalId: externalService.externalId },
      {
        $set: {
          providerId: provider._id,
          serviceId: service._id,
          externalId: externalService.externalId,
          externalName: externalService.name,
          providerPriceCents: cents(externalService.price),
          costPriceCents: cents(externalService.price),
          isActive: true,
          lastSyncedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    synced++;
  }

  await Provider.updateOne({ _id: provider._id }, { $set: { lastSyncAt: new Date(), isHealthy: true } });
  return { providerId, synced };
}

export const syncServicesWorker = new Worker(
  "sync-services",
  async (job) => {
    await connectMongo();
    const requestedProviderId = job.data?.providerId as string | undefined;
    const activeProviders = requestedProviderId
      ? await Provider.find({ _id: requestedProviderId, status: "ACTIVE" })
      : await Provider.find({ status: "ACTIVE" });

    const results = [];
    for (const provider of activeProviders) {
      results.push(await syncProviderServices(provider._id.toString()));
    }

    return { success: true, providersProcessed: activeProviders.length, results };
  },
  { connection }
);

export const checkOrderStatusWorker = new Worker(
  "check-order-status",
  async () => {
    await connectMongo();
    const { order: orderService, providers } = getServices();
    const providerOrders = await ProviderOrder.find().sort({ updatedAt: -1 });

    let processed = 0;
    let updated = 0;

    for (const providerOrder of providerOrders) {
      const order = await Order.findOne({
        _id: providerOrder.orderId,
        status: { $in: ["PENDING", "PROCESSING"] }
      });
      if (!order) continue;
      processed++;

      const cacheKey = `provider-order:${providerOrder.providerId.toString()}:${providerOrder.externalOrderId}`;
      const cached = await connection.get(cacheKey);
      const status = cached
        ? JSON.parse(cached)
        : await (async () => {
            const provider = await providers.getProvider(providerOrder.providerId.toString());
            if (!provider) return null;
            const liveStatus = await provider.checkOrderStatus(providerOrder.externalOrderId);
            await connection.set(cacheKey, JSON.stringify(liveStatus), "EX", 60);
            return liveStatus;
          })();

      if (!status) continue;
      await orderService.updateOrderStatus({
        orderId: order._id.toString(),
        externalOrderId: providerOrder.externalOrderId,
        status: status.status,
        progress: status.progress,
        message: status.message
      });
      updated++;
    }

    return { success: true, ordersProcessed: processed, updated };
  },
  { connection }
);

export const healthCheckWorker = new Worker(
  "provider-health-check",
  async () => {
    await connectMongo();
    const { providers } = getServices();
    const allProviders = await Provider.find();
    let healthy = 0;

    for (const provider of allProviders) {
      const adapter = await providers.getProvider(provider._id.toString());
      const health = adapter ? await adapter.checkHealth() : null;
      await Provider.updateOne(
        { _id: provider._id },
        {
          $set: {
            isHealthy: Boolean(health?.isHealthy),
            status: health?.status === "active" ? "ACTIVE" : health?.status === "maintenance" ? "MAINTENANCE" : "ERROR"
          }
        }
      );
      if (health?.isHealthy) healthy++;
    }

    return { success: true, total: allProviders.length, healthy };
  },
  { connection }
);

export async function initializeBackgroundJobs() {
  await syncServicesQueue.add("sync", {}, { repeat: { pattern: syncCron() }, removeOnComplete: true, removeOnFail: 100 });
  await checkOrderStatusQueue.add("check", {}, { repeat: { pattern: "*/1 * * * *" }, removeOnComplete: true, removeOnFail: 100 });
  await providerHealthCheckQueue.add("health", {}, { repeat: { pattern: "*/15 * * * *" }, removeOnComplete: true, removeOnFail: 100 });
}

export async function queueProviderSync(providerId?: string) {
  return syncServicesQueue.add("manual-sync", { providerId }, { attempts: 3, backoff: { type: "exponential", delay: 2000 } });
}

export async function closeBackgroundJobs() {
  await Promise.all([
    syncServicesWorker.close(),
    checkOrderStatusWorker.close(),
    healthCheckWorker.close(),
    syncServicesQueue.close(),
    checkOrderStatusQueue.close(),
    providerHealthCheckQueue.close(),
    syncPricingQueue.close(),
    notificationQueue.close(),
    getRedisClient().quit()
  ]);
}
