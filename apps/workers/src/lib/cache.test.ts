58
  57
    import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCachedResult, clearMemoryCache } from './cache';
import { Result, type Result as ResultType } from '@hummbl/core';
import type { Env } from '../env';

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
    throw new Error(`Expected ok result, got error: ${JSON.stringify(!result.ok ? result.error : 'unknown')}`166
    
  return result.value;
};

describe('getCachedResult', () => {
  beforeEach(() => {
    clearMemoryCache();
    vi.restoreAllMocks();
  });

  it('fetches fresh data on cache miss and populates cascading tiers', async () => {
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

    expect(env.CACHE.put).toHaveBeenCalledWith(
      'models:test', JSON.stringify({ value: 42 }), { expirationTtl: 60 },
    );

    expect(cache.put).toHaveBeenCalledTimes(1);
  });

  it('returns memory hit without invoking fetcher twice', async () => {
    const env = createEnv();
    setupCaches();
    const fetcher = vi.fn().mockResolvedValue(Result.ok({ models: 1 }));

    const first = unwrap(await getCachedResult(env, 'models:memory', fetcher));
    const second = unwrap(await getCachedResult(env, 'models:memory', fetcher));

    expect(first).toEqual({ models: 1 });
    expect(second).toEqual({ models: 1 });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(env.CACHE.get).toHaveBeenCalledTimes(1);
  });

  it('returns KV hit, warms memory, and skips fetcher', async () => {
    const env = createEnv();
    setupCaches();
    const payload = JSON.stringify({ kv: true });

    (env.CACHE.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(payload);
    const fetcher = vi.fn();

    const result = await getCachedResult(env, 'models:kv-hit', fetcher, {
      memoryTtlSeconds: 10,
    });

    const resolved = unwrap(result);
    expect(resolved).toEqual({ kv: true });
    expect(fetcher).not.toHaveBeenCalled();
    expect(env.CACHE.get).toHaveBeenCalledTimes(1);

    // Second call should now be a memory hit, so KV is not queried again
    const second = await getCachedResult(env, 'models:kv-hit', fetcher);
    const secondResolved = unwrap(second);
    expect(secondResolved).toEqual({ kv: true });
    expect(env.CACHE.get).toHaveBeenCalledTimes(1);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('returns CF cache hit, writes back to KV, and skips fetcher', async () => {
    const env = createEnv();
    const { cache } = setupCaches();
    const payload = JSON.stringify({ cf: true });

    (cache.match as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(payload, {
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const fetcher = vi.fn();

    const result = await getCachedResult(env, 'models:cf-hit', fetcher, {
      kvTtlSeconds: 123,
      memoryTtlSeconds: 10,
    });

    const resolved = unwrap(result);
    expect(resolved).toEqual({ cf: true });
    expect(fetcher).not.toHaveBeenCalled();

    expect(env.CACHE.put).toHaveBeenCalledWith(
      'models:cf-hit', payload, { expirationTtl: 123 }
    );
  });

  it('propagates fetcher error result without caching', async () => {
    const env = createEnv();
    const { cache } = setupCaches();

    const error = { code: 'NOT_FOUND', message: 'missing' };
    const fetcher = vi.fn().mockResolvedValue(Result.err(error));

    const result = await getCachedResult(env, 'models:error', fetcher);

    expect(result.ok).toBe(false);
    expect(!result.ok ? result.error : undefined).toEqual(error)
    // No writes to KV or CF cache on error
    expect(env.CACHE.put).not.toHaveBeenCalled();
    expect(cache.put).not.toHaveBeenCalled();
  });
});
