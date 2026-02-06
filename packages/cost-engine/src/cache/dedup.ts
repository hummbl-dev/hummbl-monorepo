/**
 * Request Deduplication
 *
 * Prevents duplicate concurrent requests within a time window.
 */

import { createHash } from 'node:crypto';

interface PendingRequest {
  hash: string;
  promise: Promise<unknown>;
  timestamp: number;
}

/**
 * Create a request deduplicator
 */
export function createDeduplicator(windowMs: number) {
  const pending = new Map<string, PendingRequest>();

  /**
   * Generate hash for deduplication
   */
  function hashRequest(prompt: string, model: string): string {
    const hash = createHash('md5');
    hash.update(`${model}:${prompt}`);
    return hash.digest('hex');
  }

  /**
   * Clean up expired pending requests
   */
  function cleanup(): void {
    const now = Date.now();
    for (const [key, request] of pending) {
      if (now - request.timestamp > windowMs) {
        pending.delete(key);
      }
    }
  }

  return {
    /**
     * Check if request is duplicate and get pending promise
     */
    isDuplicate(prompt: string, model: string): Promise<unknown> | null {
      cleanup();

      const hash = hashRequest(prompt, model);
      const existing = pending.get(hash);

      if (existing && Date.now() - existing.timestamp < windowMs) {
        return existing.promise;
      }

      return null;
    },

    /**
     * Register a new request
     */
    register<T>(prompt: string, model: string, promise: Promise<T>): Promise<T> {
      const hash = hashRequest(prompt, model);

      pending.set(hash, {
        hash,
        promise: promise as Promise<unknown>,
        timestamp: Date.now(),
      });

      // Clean up when promise completes
      promise.finally(() => {
        setTimeout(() => {
          pending.delete(hash);
        }, windowMs);
      });

      return promise;
    },

    /**
     * Get count of pending requests
     */
    getPendingCount(): number {
      cleanup();
      return pending.size;
    },

    /**
     * Clear all pending requests
     */
    clear(): void {
      pending.clear();
    },
  };
}

export type Deduplicator = ReturnType<typeof createDeduplicator>;
