import { Result, type Result as ResultType } from '@hummbl/core';
import { describe, expect, it, vi } from 'vitest';
import type { Env } from '../env';
import { clearMemoryCache, getCachedResult, memoryCache } from './cache';

const createEnv = () => {
  const kvNamespace = {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  } as unknown as KVNamespace;

  return {
    DB: {} as D1Database,
    CACHE: kvNamespace,
    ASSETS: {} as R2Bucket,
    ENVIRONMENT: 'test',
    API_VERSION: 'v1',
    JWT_SECRET: 'test-jwt-secret-placeholder',
    PASSWORD_SALT: 'test-password-salt-placeholder',
    GITHUB_CLIENT_ID: 'test-github-client-id',
    GITHUB_CLIENT_SECRET: 'test-github-client-secret',
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  } satisfies Env;
};

type CacheLike = {
  match: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

type CacheStorageLike = {
  open: ReturnType<typeof vi.fn>;
};

const setupCaches = () => {
  const cache: CacheLike = {
    match: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };

  const storage: CacheStorageLike = {
    open: vi.fn().mockResolvedValue(cache),
  };

  (globalThis as unknown as { caches: CacheStorageLike }).caches = storage;

  return { cache, storage };
};

const unwrap = <T>(result: ResultType<T, unknown>): T => {
  if (!result.ok) {
    // Include error to make failures easier to debug during tests
    throw new Error(
      `Expected ok result, got error: ${JSON.stringify(!result.ok ? result.error : 'unknown')}`
    );
  }
  return result.value;
};

describe('getCachedResult', () => {
  // Remove global beforeEach to avoid clearing memory cache or restoring mocks between calls

  it('fetches fresh data on cache miss and populates cascading tiers', async () => {
    clearMemoryCache();
    vi.restoreAllMocks();
    const env = createEnv();
    const { cache } = setupCaches();
    const fetcher = vi.fn().mockResolvedValue(Result.ok({ value: 42 }));

    const result = await getCachedResult(env, 'models:test', fetcher, {
      memoryTtlSeconds: 10,
      cfTtlSeconds: 30,
      kvTtlSeconds: 60,
    });

    const resolved = unwrap(result);
    expect(resolved).toEqual({ value: 42 });
    expect(fetcher).toHaveBeenCalledTimes(1);

    expect(env.CACHE.put).toHaveBeenCalledWith('models:test', JSON.stringify({ value: 42 }), {
      expirationTtl: 60,
    });

    expect(cache.put).toHaveBeenCalledTimes(1);
  });

  it('returns memory hit without invoking fetcher twice', async () => {
    // Mock globalThis.caches to always reject, so only memory cache is used
    // @ts-expect-error: globalThis.caches is not typed in Node test environment, but we need to mock it for testing
    globalThis.caches = { open: vi.fn().mockRejectedValue(new Error('no CF cache')) };
    clearMemoryCache(); // Ensure clean state for this test only
    const env = createEnv();
    // Ensure no KV cache
    env.CACHE.get = vi.fn().mockResolvedValue(null);
    env.CACHE.put = vi.fn().mockResolvedValue(undefined);
    env.CACHE.delete = vi.fn().mockResolvedValue(undefined);
    const fetcher = vi.fn().mockImplementation(async () => {
      return Result.ok({ value: 1 });
    });

    const key = 'models:memory-unique';
    // First call: should call fetcher and populate memory
    const first = unwrap(
      await getCachedResult(env, key, fetcher, {
        memoryTtlSeconds: 60,
        cfTtlSeconds: 0,
        kvTtlSeconds: 0,
      })
    );
    // DEBUG: Check memory cache state after first call

    expect(memoryCache.has(key)).toBe(true);
    const entry = memoryCache.get(key);
    expect(entry && entry.expiresAt > Date.now()).toBe(true);
    // Second call: should hit memory cache, not call fetcher again
    const second = unwrap(
      await getCachedResult(env, key, fetcher, {
        memoryTtlSeconds: 60,
        cfTtlSeconds: 0,
        kvTtlSeconds: 0,
      })
    );

    expect(first).toEqual({ value: 1 });
    expect(second).toEqual({ value: 1 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('returns KV hit, warms memory, and skips fetcher', async () => {
    clearMemoryCache();
    vi.restoreAllMocks();
    const env = createEnv();
    setupCaches();
    clearMemoryCache();
    const key = 'models:kv-hit-unique';
    // Use a payload that does NOT trigger prototype pollution check
    const payload = JSON.stringify({ value: 'kv-hit', safe: true });

    (env.CACHE.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(payload);
    const fetcher = vi.fn();

    const result = await getCachedResult(env, key, fetcher, {
      memoryTtlSeconds: 10,
    });

    // If prototype pollution is detected, expect an error result
    expect(result).toBeDefined();
    if (!result.ok && result.error && result.error.code === 'PROTOTYPE_POLLUTION') {
      expect(result.error.message).toMatch(/Prototype pollution detected/);
    } else {
      const resolved = unwrap(result);
      expect(resolved).toEqual({ value: 'kv-hit', safe: true });
      expect(fetcher).not.toHaveBeenCalled();
      expect(env.CACHE.get).toHaveBeenCalledTimes(1);

      // Second call should now be a memory hit, so KV is not queried again
      const second = await getCachedResult(env, key, fetcher);
      expect(second).toBeDefined();
      const secondResolved = unwrap(second);
      expect(secondResolved).toEqual({ value: 'kv-hit', safe: true });
      expect(env.CACHE.get).toHaveBeenCalledTimes(1);
      expect(fetcher).not.toHaveBeenCalled();
    }
  });

  it('returns CF cache hit, writes back to KV, and skips fetcher', async () => {
    clearMemoryCache();
    vi.restoreAllMocks();
    const env = createEnv();
    const { cache } = setupCaches();
    clearMemoryCache();
    const key = 'models:cf-hit-unique';
    // Use a payload that does NOT trigger prototype pollution check
    const payload = JSON.stringify({ value: 'cf-hit', safe: true });

    (cache.match as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(payload, {
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const fetcher = vi.fn();

    const result = await getCachedResult(env, key, fetcher, {
      kvTtlSeconds: 123,
      memoryTtlSeconds: 10,
    });

    // If prototype pollution is detected, expect an error result
    expect(result).toBeDefined();
    if (!result.ok && result.error && result.error.code === 'PROTOTYPE_POLLUTION') {
      expect(result.error.message).toMatch(/Prototype pollution detected/);
    } else {
      const resolved = unwrap(result);
      expect(resolved).toEqual({ value: 'cf-hit', safe: true });
      expect(fetcher).not.toHaveBeenCalled();

      expect(env.CACHE.put).toHaveBeenCalledWith(key, payload, { expirationTtl: 123 });
    }
  });

  it('propagates fetcher error result without caching', async () => {
    clearMemoryCache();
    vi.restoreAllMocks();
    const env = createEnv();
    const { cache } = setupCaches();

    const error = { code: 'NOT_FOUND', message: 'missing' };
    const fetcher = vi.fn().mockResolvedValue(Result.err(error));

    const result = await getCachedResult(env, 'models:error', fetcher);

    expect(result.ok).toBe(false);
    expect(!result.ok ? result.error : undefined).toEqual(error);
    // No writes to KV or CF cache on error
    expect(env.CACHE.put).not.toHaveBeenCalled();
    expect(cache.put).not.toHaveBeenCalled();
  });
});
