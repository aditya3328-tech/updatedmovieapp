import { cacheManager } from "./cacheManager";
import { deduplicationManager } from "./requestDeduplication";
import { requestMonitor } from "./requestMonitor";
import { RequestQueue } from "./requestQueue";
import { withRetry } from "./retry";

export const PRIORITY = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
};

const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Production API scheduler — orchestrates queue, cache, dedup, retry, and monitoring.
 */
class ApiScheduler {
  constructor() {
    this.queue = new RequestQueue({
      maxConcurrent: 3,
      staggerMinMs: 500,
      staggerMaxMs: 1000,
    });
    this.pageAbortSignal = null;
  }

  setPageAbortSignal(signal) {
    this.pageAbortSignal = signal ?? null;
  }

  resolvePriority(priority) {
    if (typeof priority === "number") return priority;
    return PRIORITY[priority] ?? PRIORITY.medium;
  }

  /**
   * Schedule an API request through the full orchestration pipeline.
   */
  async execute({
    key,
    fetcher,
    priority = "medium",
    cacheTTL = DEFAULT_CACHE_TTL,
    useCache = true,
    signal,
    maxRetries = 3,
  }) {
    const priorityValue = this.resolvePriority(priority);
    const effectiveSignal = signal ?? this.pageAbortSignal ?? undefined;

    if (useCache) {
      const cached = cacheManager.get(key);
      if (cached !== null && cached !== undefined) {
        requestMonitor.cached(key);
        return cached;
      }
    }

    return deduplicationManager.getOrCreate(key, () =>
      this.queue.enqueue(
        async () => {
          const queueStats = this.queue.getStats();
          const monitorId = requestMonitor.started(key, {
            priority: priorityValue,
            queuePosition: queueStats.pending + queueStats.running,
          });
          const startTime = performance.now();

          try {
            const result = await withRetry(
              () => fetcher({ signal: effectiveSignal }),
              {
                maxRetries,
                signal: effectiveSignal,
                onRetry: (attempt, delayMs) =>
                  requestMonitor.retry(monitorId, attempt, delayMs),
              },
            );

            const durationMs = Math.round(performance.now() - startTime);
            requestMonitor.completed(monitorId, durationMs);

            if (useCache && cacheTTL > 0) {
              cacheManager.set(key, result, cacheTTL);
            }

            return result;
          } catch (error) {
            requestMonitor.failed(monitorId, error);
            throw error;
          }
        },
        { priority: priorityValue, key },
      ),
    );
  }

  getStats() {
    return {
      queue: this.queue.getStats(),
      activeRequests: requestMonitor.getStats(),
    };
  }
}

export const apiScheduler = new ApiScheduler();
export default apiScheduler;
