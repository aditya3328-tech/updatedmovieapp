import { requestMonitor } from "./requestMonitor";

const randomStagger = (min, max) =>
  min + Math.floor(Math.random() * (max - min + 1));

/**
 * Centralized request queue with concurrency limits and priority ordering.
 */
export class RequestQueue {
  constructor({
    maxConcurrent = 3,
    staggerMinMs = 500,
    staggerMaxMs = 1000,
  } = {}) {
    this.maxConcurrent = maxConcurrent;
    this.staggerMinMs = staggerMinMs;
    this.staggerMaxMs = staggerMaxMs;
    this.running = 0;
    this.pending = [];
    this.lastStartTime = 0;
  }

  enqueue(taskFn, { priority = 50, key = "anonymous" } = {}) {
    const queuePosition = this.pending.length + this.running;

    requestMonitor.queued(key, queuePosition);

    return new Promise((resolve, reject) => {
      this.pending.push({
        taskFn,
        priority,
        key,
        resolve,
        reject,
      });

      this.pending.sort((a, b) => b.priority - a.priority);
      this.drain();
    });
  }

  async drain() {
    if (this.running >= this.maxConcurrent || this.pending.length === 0) {
      return;
    }

    const item = this.pending.shift();
    this.running++;

    const elapsed = Date.now() - this.lastStartTime;
    const stagger = randomStagger(this.staggerMinMs, this.staggerMaxMs);
    if (this.lastStartTime > 0 && elapsed < stagger) {
      await new Promise((r) => setTimeout(r, stagger - elapsed));
    }
    this.lastStartTime = Date.now();

    try {
      const result = await item.taskFn();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.running--;
      this.drain();
    }
  }

  getStats() {
    return {
      running: this.running,
      pending: this.pending.length,
      maxConcurrent: this.maxConcurrent,
    };
  }

  clear() {
    this.pending = [];
  }
}

export default RequestQueue;
