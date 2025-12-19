import { Result } from '@hummbl/core';
import type { Env } from '../env';
import { logCacheError } from './api';
import type { ApiError } from './api';

interface CacheEntry {
  value: string;
  expiresAt: number;
}

interface CacheConfig {
  kvTtlSeconds?: number;
  cfTtlSeconds?: number;
  memoryTtlSeconds?: number;
}

const memoryCache = new Map<string, CacheEntry>();

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

  if (!entry) {
    return null;
  }

  if (entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  try {
    return JSON.parse(entry.value) as T;
  } catch (error) {
    memoryCache.delete(key);
    return null;
  }
};

const writeMemoryCache = (key: string, payload: string, ttlSeconds: number) => {
  memoryCache.set(key, {
    value: payload,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
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
        const parsed = JSON.parse(kvPayload) as T;
        writeMemoryCache(cacheKey, kvPayload, memoryTtl);
        return Result.ok(parsed);
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
        const parsed = JSON.parse(payload) as T;
        writeMemoryCache(cacheKey, payload, memoryTtl);
        await env.CACHE.put(cacheKey, payload, { expirationTtl: kvTtl });
        return Result.ok(parsed);
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
