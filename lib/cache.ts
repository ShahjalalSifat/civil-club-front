// High-Performance In-Memory Cache with TTL and SWR (Stale-While-Revalidate)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightPromises = new Map<string, Promise<any>>();

const DEFAULT_TTL_MS = 3 * 60 * 1000; // 3 minutes fresh cache

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key);

  // Return cached version immediately if fresh
  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  // Deduplicate in-flight promises (prevents sending 10 identical requests simultaneously)
  if (inFlightPromises.has(key)) {
    return inFlightPromises.get(key) as Promise<T>;
  }

  const promise = (async () => {
    try {
      const freshData = await fetcher();
      memoryCache.set(key, { data: freshData, timestamp: Date.now() });
      return freshData;
    } catch (err) {
      // If error occurs but we have stale cache, gracefully return stale cache
      if (cached) {
        console.warn(`[Cache] Fallback to stale data for ${key}:`, err);
        return cached.data as T;
      }
      throw err;
    } finally {
      inFlightPromises.delete(key);
    }
  })();

  inFlightPromises.set(key, promise);
  return promise;
}

export function invalidateCache(keyPrefix?: string) {
  if (!keyPrefix) {
    memoryCache.clear();
    return;
  }
  for (const k of memoryCache.keys()) {
    if (k.startsWith(keyPrefix)) {
      memoryCache.delete(k);
    }
  }
}
