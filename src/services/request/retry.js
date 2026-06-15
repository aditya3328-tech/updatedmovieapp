const isAbortError = (error) =>
  error?.name === "AbortError" || error?.code === "ERR_CANCELED";

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = setTimeout(resolve, ms);

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    }
  });

/**
 * Exponential backoff retry: 1s → 2s → 4s (3 retries max).
 */
export async function withRetry(fn, { maxRetries = 3, signal, onRetry } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) {
      throw signal.reason ?? new DOMException("Aborted", "AbortError");
    }

    try {
      return await fn(attempt);
    } catch (error) {
      if (isAbortError(error)) throw error;

      lastError = error;

      if (attempt < maxRetries) {
        const delayMs = 1000 * 2 ** attempt;
        onRetry?.(attempt + 1, delayMs);
        await sleep(delayMs, signal);
      }
    }
  }

  throw lastError;
}

export default withRetry;
