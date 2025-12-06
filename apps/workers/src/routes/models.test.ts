import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { Hono } from 'hono';
import { modelsRouter } from './models';
import type { Env } from '../env';
import { Result } from '@hummbl/core';
import { getCachedResult } from '../lib/cache';

vi.mock('../lib/cache', () => ({
  getCachedResult: vi.fn(),
}));

const mockedGetCachedResult = getCachedResult as unknown as Mock;

const createEnv = (): Env => ({
  DB: {} as D1Database,
  CACHE: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  } as unknown as KVNamespace,
  ASSETS: {} as R2Bucket,
  ENVIRONMENT: 'test',
  API_VERSION: 'v1',
});

const createApp = () => {
  const app = new Hono<{ Bindings: Env }>();
  app.route('/v1/models', modelsRouter);
  return app;
};

describe('modelsRouter', () => {
  beforeEach(() => {
    mockedGetCachedResult.mockReset();
  });

  it('rejects invalid transformation query params', async () => {
    const app = createApp();
    const request = new Request('https://api.test/v1/models?transformation=invalid');

    const response = await app.fetch(request, createEnv());

    expect(response.status).toBe(400);
    const body = (await response.json()) as { ok: boolean; error: { code: string } };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('invalid_query');
  });

  it('returns cached result for valid queries', async () => {
    mockedGetCachedResult.mockResolvedValue(
      Result.ok({
        models: [{ code: 'P1', name: 'First Principles' }],
        count: 1,
        transformation: 'P',
        search: null,
      })
    );

    const app = createApp();
    const request = new Request('https://api.test/v1/models?transformation=P');

    const response = await app.fetch(request, createEnv());

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: true;
      value: { models: Array<{ code: string }> };
    };
    expect(body.value.models[0].code).toBe('P1');
    expect(mockedGetCachedResult).toHaveBeenCalledWith(
      expect.any(Object),
      'models:P:',
      expect.any(Function),
      expect.objectContaining({
        memoryTtlSeconds: 60,
      })
    );
  });
});
