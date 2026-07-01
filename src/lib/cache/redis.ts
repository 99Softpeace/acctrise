import Redis from "ioredis";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    });
  }

  return redisClient;
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  const cached = await getRedisClient().get(key);
  return cached ? (JSON.parse(cached) as T) : null;
}

export async function setCachedJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  await getRedisClient().set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function rememberJson<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const cached = await getCachedJson<T>(key);
  if (cached) return cached;

  const value = await loader();
  await setCachedJson(key, value, ttlSeconds);
  return value;
}
