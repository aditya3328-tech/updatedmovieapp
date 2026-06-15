const memoryCache = new Map();
const STORAGE_PREFIX = "sw_cache:";

/**
 * Two-tier cache: in-memory (fast) + sessionStorage (survives refresh).
 */
export const cacheManager = {
  get(key) {
    const memEntry = memoryCache.get(key);
    if (memEntry && Date.now() < memEntry.expiresAt) {
      return memEntry.data;
    }
    if (memEntry) {
      memoryCache.delete(key);
    }

    try {
      const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!raw) return null;

      const entry = JSON.parse(raw);
      if (Date.now() >= entry.expiresAt) {
        sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
        return null;
      }

      memoryCache.set(key, entry);
      return entry.data;
    } catch {
      return null;
    }
  },

  set(key, data, ttlMs, { persist = true } = {}) {
    const entry = {
      data,
      expiresAt: Date.now() + ttlMs,
      cachedAt: Date.now(),
    };
    memoryCache.set(key, entry);

    if (persist) {
      try {
        sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
      } catch {
        // sessionStorage full or unavailable — memory cache still works
      }
    }
  },

  has(key) {
    return this.get(key) !== null;
  },

  invalidate(key) {
    memoryCache.delete(key);
    try {
      sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch {
      // ignore
    }
  },

  clear() {
    memoryCache.clear();
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k?.startsWith(STORAGE_PREFIX)) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {
      // ignore
    }
  },
};

export default cacheManager;
