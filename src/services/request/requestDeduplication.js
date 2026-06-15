const inflightRequests = new Map();

/**
 * Prevents duplicate in-flight API calls — reuses existing promises.
 */
export const deduplicationManager = {
  getOrCreate(key, factory) {
    if (inflightRequests.has(key)) {
      return inflightRequests.get(key);
    }

    const promise = Promise.resolve()
      .then(factory)
      .finally(() => {
        inflightRequests.delete(key);
      });

    inflightRequests.set(key, promise);
    return promise;
  },

  has(key) {
    return inflightRequests.has(key);
  },

  clear() {
    inflightRequests.clear();
  },
};

export default deduplicationManager;
