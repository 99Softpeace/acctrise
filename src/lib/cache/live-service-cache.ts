type CacheEntry<T> = { value?: T; expiresAt: number; pending?: Promise<T> };

const entries = new Map<string, CacheEntry<unknown>>();

export async function getCachedLiveValue<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const current = entries.get(key) as CacheEntry<T> | undefined;
  if (current?.value !== undefined && current.expiresAt > now) return current.value;
  if (current?.pending) return current.pending;

  const pending = load()
    .then((value) => {
      entries.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .catch((error) => {
      entries.delete(key);
      throw error;
    });

  entries.set(key, { expiresAt: now + ttlMs, pending });
  return pending;
}
