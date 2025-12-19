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
    JWT_SECRET: '<jwt_secret>',
    PASSWORD_SALT: '<password_salt>',
    GITHUB_CLIENT_ID: '<github_client_id>',
    GITHUB_CLIENT_SECRET: '<github_client_secret>',
    GOOGLE_CLIENT_ID: '<google_client_id>',
    GOOGLE_CLIENT_SECRET: '<google_client_secret>',
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
    expect(env.CACHE.put).toHaveBeenCalledWith('models:test', JSON.stringify({ value: 42 }), {
      expirationTtl: 60,
    });
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
});

const unwrap = <T>(result: ResultType<T, unknown>): T => {
  if (!result.ok) {
    throw new Error('Expected ok result');
  }
  return result.value;
};
