/**
 * Exact Cache
 *
 * SHA-256 hash-based exact match cache for LLM responses.
 */

import { createHash } from 'node:crypto';
import type {
  Cache,
  CacheEntry,
  ExactCacheEntry,
  CachedResponse,
  CacheStats,
  CachePolicyConfig,
} from '../types.js';

/**
 * Generate SHA-256 hash for cache key
 */
export function generateCacheKey(prompt: string, model: string): string {
  const hash = createHash('sha256');
  hash.update(`${model}:${prompt}`);
  return hash.digest('hex');
}

/**
 * Create an exact match cache
 */
export function createExactCache(config: CachePolicyConfig['exactMatch']): Cache {
  const entries = new Map<string, ExactCacheEntry>();
  let hits = 0;
  let misses = 0;

  /**
   * Check if entry is expired
   */
  function isExpired(entry: ExactCacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Evict oldest entries when cache is full
   */
  function evictIfNeeded(): void {
    if (entries.size < config.maxEntries) return;

    // Find oldest entry by lastAccessedAt
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of entries) {
      if (entry.lastAccessedAt < oldestTime) {
        oldestTime = entry.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      entries.delete(oldestKey);
    }
  }

  return {
    get(key: string): CacheEntry | undefined {
      const entry = entries.get(key);

      if (!entry) {
        misses++;
        return undefined;
      }

      if (isExpired(entry)) {
        entries.delete(key);
        misses++;
        return undefined;
      }

      // Update access stats
      entry.hitCount++;
      entry.lastAccessedAt = Date.now();
      hits++;

      return entry;
    },

    set(key: string, entry: CacheEntry): void {
      if (entry.type !== 'exact') {
        throw new Error('ExactCache only accepts exact cache entries');
      }

      evictIfNeeded();

      entries.set(key, entry as ExactCacheEntry);
    },

    delete(key: string): boolean {
      return entries.delete(key);
    },

    clear(): void {
      entries.clear();
      hits = 0;
      misses = 0;
    },

    getStats(): CacheStats {
      let memoryEstimate = 0;
      for (const entry of entries.values()) {
        // Rough estimate: key + response content + metadata
        memoryEstimate += entry.key.length * 2;
        memoryEstimate += entry.response.content.length * 2;
        memoryEstimate += 200; // overhead
      }

      return {
        exactHits: hits,
        exactMisses: misses,
        semanticHits: 0,
        semanticMisses: 0,
        totalEntries: entries.size,
        memoryUsageBytes: memoryEstimate,
      };
    },

    prune(): number {
      const now = Date.now();
      let pruned = 0;

      for (const [key, entry] of entries) {
        if (now > entry.expiresAt) {
          entries.delete(key);
          pruned++;
        }
      }

      return pruned;
    },
  };
}

/**
 * Create an exact cache entry
 */
export function createExactCacheEntry(
  prompt: string,
  model: string,
  response: CachedResponse,
  ttlSeconds: number
): ExactCacheEntry {
  const now = Date.now();
  const hash = generateCacheKey(prompt, model);

  return {
    type: 'exact',
    key: hash,
    hash,
    response,
    createdAt: now,
    expiresAt: now + ttlSeconds * 1000,
    hitCount: 0,
    lastAccessedAt: now,
  };
}

/**
 * Check if a prompt should bypass the cache
 */
export function shouldBypassCache(
  prompt: string,
  taskType: string | undefined,
  headers: Record<string, string> | undefined,
  bypassConditions: CachePolicyConfig['bypassConditions']
): boolean {
  for (const condition of bypassConditions) {
    switch (condition.type) {
      case 'task_type':
        if (taskType === condition.value) return true;
        break;
      case 'header':
        if (headers?.[condition.value]) return true;
        break;
      case 'prompt_pattern': {
        const regex = new RegExp(condition.value, 'i');
        if (regex.test(prompt)) return true;
        break;
      }
    }
  }
  return false;
}
