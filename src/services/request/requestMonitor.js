import { log } from "../../api/axios";

const activeRequests = new Map();
let requestCounter = 0;

/**
 * Production request monitoring for debugging API orchestration.
 */
export const requestMonitor = {
  started(key, { priority = 50, queuePosition = 0 } = {}) {
    const id = ++requestCounter;
    const entry = {
      id,
      key,
      priority,
      queuePosition,
      startedAt: performance.now(),
      retryCount: 0,
      status: "started",
    };
    activeRequests.set(id, entry);
    log(
      "info",
      `[RequestMonitor] STARTED #${id} "${key}" | priority=${priority} | queue=${queuePosition}`,
    );
    return id;
  },

  queued(key, position) {
    log("debug", `[RequestMonitor] QUEUED "${key}" | position=${position}`);
  },

  cached(key) {
    log("info", `[RequestMonitor] CACHE_HIT "${key}"`);
  },

  retry(id, attempt, delayMs) {
    const entry = activeRequests.get(id);
    if (entry) {
      entry.retryCount = attempt;
      entry.status = "retrying";
    }
    log(
      "warn",
      `[RequestMonitor] RETRY #${id} "${entry?.key ?? "unknown"}" | attempt=${attempt} | wait=${delayMs}ms`,
    );
  },

  completed(id, durationMs) {
    const entry = activeRequests.get(id);
    if (entry) {
      entry.status = "completed";
      entry.durationMs = durationMs;
      log(
        "info",
        `[RequestMonitor] COMPLETED #${id} "${entry.key}" | ${durationMs}ms | retries=${entry.retryCount}`,
      );
      activeRequests.delete(id);
    }
  },

  failed(id, error) {
    const entry = activeRequests.get(id);
    if (entry) {
      entry.status = "failed";
      log(
        "error",
        `[RequestMonitor] FAILED #${id} "${entry.key}" | retries=${entry.retryCount}`,
        error?.message ?? error,
      );
      activeRequests.delete(id);
    }
  },

  getActive() {
    return [...activeRequests.values()];
  },

  getStats() {
    return {
      active: activeRequests.size,
      requests: [...activeRequests.values()],
    };
  },
};

export default requestMonitor;
