import { Result } from '@hummbl/core';
import type { Env } from '../env';
import type { ApiError } from './api';
import { logCacheError } from './api';

interface CacheEntry {
  value: string;
  expiresAt: number;
}

interface CacheConfig {
  kvTtlSeconds?: number;
  cfTtlSeconds?: number;
  memoryTtlSeconds?: number;
}

export const memoryCache = new Map<string, CacheEntry>();

export const clearMemoryCache = () => {
  // Using DE3 (Decomposition) to keep test hooks separate from runtime logic
  memoryCache.clear();
};

const WORKERS_CACHE_NAME = 'hummbl-workers';

const buildCacheRequest = (key: string) => {
  return new Request(`https://cache.internal/${key}`);
};

const getWorkersCache = async () => {
  return caches.open(WORKERS_CACHE_NAME);
};

const readMemoryCache = <T>(key: string): T | null => {
  const entry = memoryCache.get(key);
  // DEBUG: Log memory cache read
  console.log('[MEMORY CACHE] read', {
    key,
    has: !!entry,
    expiresAt: entry?.expiresAt,
    now: Date.now(),
  });

  if (!entry) {
    return null;
  }

  if (entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    console.log('[MEMORY CACHE] expired', { key });
    return null;
  }

  try {
    const parsed = JSON.parse(entry.value);
    if (
      parsed &&
      typeof parsed === 'object' &&
      (Object.prototype.hasOwnProperty.call(parsed, '__proto__') ||
        Object.prototype.hasOwnProperty.call(parsed, 'constructor'))
    ) {
      memoryCache.delete(key);
      console.log('[MEMORY CACHE] prototype pollution detected', { key });
      return null;
    }
    return parsed as T;
  } catch {
    memoryCache.delete(key);
    console.log('[MEMORY CACHE] parse error', { key });
    return null;
  }
};

const writeMemoryCache = (key: string, payload: string, ttlSeconds: number) => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryCache.set(key, {
    value: payload,
    expiresAt,
  });
  // DEBUG: Log memory cache write
  console.log('[MEMORY CACHE] write', { key, expiresAt });
};

export const getCachedResult = async <T>(
  env: Env,
  cacheKey: string,
  fetcher: () => Promise<Result<T, ApiError>>,
  config: CacheConfig = {}
): Promise<Result<T, ApiError>> => {
  const memoryTtl = config.memoryTtlSeconds ?? 60;
  const kvTtl = config.kvTtlSeconds ?? 3600;
  const cfTtl = config.cfTtlSeconds ?? 300;

  const memoryHit = readMemoryCache<T>(cacheKey);
  if (memoryHit) {
    return Result.ok(memoryHit);
  }

  try {
    const kvPayload = await env.CACHE.get(cacheKey);
    if (kvPayload) {
      try {
        const parsed = JSON.parse(kvPayload);
        if (
          parsed &&
          typeof parsed === 'object' &&
          (Object.prototype.hasOwnProperty.call(parsed, '__proto__') ||
            Object.prototype.hasOwnProperty.call(parsed, 'constructor'))
        ) {
          await env.CACHE.delete(cacheKey);
          logCacheError(
            `KV prototype pollution attempt for key ${cacheKey}`,
            new Error('Prototype pollution detected')
          );
          return Result.err({
            code: 'PROTOTYPE_POLLUTION',
            message: 'Prototype pollution detected in KV cache',
            status: 400,
          });
        } else {
          writeMemoryCache(cacheKey, kvPayload, memoryTtl);
          return Result.ok(parsed as T);
        }
      } catch (parseError) {
        await env.CACHE.delete(cacheKey);
        logCacheError(`KV parse failed for key ${cacheKey}`, parseError);
      }
    }
  } catch (error) {
    logCacheError(`KV read failed for key ${cacheKey}`, error);
  }

  try {
    const cacheRequest = buildCacheRequest(cacheKey);
    const cfCache = await getWorkersCache();
    const cacheResponse = await cfCache.match(cacheRequest);
    if (cacheResponse) {
      const payload = await cacheResponse.text();
      try {
        const parsed = JSON.parse(payload);
        if (
          parsed &&
          typeof parsed === 'object' &&
          (Object.prototype.hasOwnProperty.call(parsed, '__proto__') ||
            Object.prototype.hasOwnProperty.call(parsed, 'constructor'))
        ) {
          await cfCache.delete(cacheRequest);
          logCacheError(
            `Workers cache prototype pollution attempt for key ${cacheKey}`,
            new Error('Prototype pollution detected')
          );
          return Result.err({
            code: 'PROTOTYPE_POLLUTION',
            message: 'Prototype pollution detected in Workers cache',
            status: 400,
          });
        } else {
          writeMemoryCache(cacheKey, payload, memoryTtl);
          await env.CACHE.put(cacheKey, payload, { expirationTtl: kvTtl });
          return Result.ok(parsed as T);
        }
      } catch (parseError) {
        await cfCache.delete(cacheRequest);
        logCacheError(`Workers cache parse failed for key ${cacheKey}`, parseError);
      }
    }
  } catch (error) {
    logCacheError(`Workers cache read failed for key ${cacheKey}`, error);
  }

  const freshResult = await fetcher();
  if (!freshResult.ok) {
    return freshResult;
  }

  const serialized = JSON.stringify(freshResult.value);

  try {
    writeMemoryCache(cacheKey, serialized, memoryTtl);
  } catch (error) {
    logCacheError(`Memory cache write failed for key ${cacheKey}`, error);
  }

  try {
    await env.CACHE.put(cacheKey, serialized, { expirationTtl: kvTtl });
  } catch (error) {
    logCacheError(`KV write failed for key ${cacheKey}`, error);
  }

  try {
    const cacheRequest = buildCacheRequest(cacheKey);
    const cfCache = await getWorkersCache();
    await cfCache.put(
      cacheRequest,
      new Response(serialized, {
        headers: {
          'Cache-Control': `public, max-age=${cfTtl}`,
          'Content-Type': 'application/json',
        },
      })
    );
  } catch (error) {
    logCacheError(`Workers cache write failed for key ${cacheKey}`, error);
  }

  return Result.ok(freshResult.value);
};

export const invalidateCacheKey = async (env: Env, cacheKey: string) => {
  memoryCache.delete(cacheKey);
  try {
    await env.CACHE.delete(cacheKey);
  } catch (error) {
    logCacheError(`KV delete failed for key ${cacheKey}`, error);
  }

  try {
    const cacheRequest = buildCacheRequest(cacheKey);
    const cfCache = await getWorkersCache();
    await cfCache.delete(cacheRequest);
  } catch (error) {
    logCacheError(`Workers cache delete failed for key ${cacheKey}`, error);
  }
};
