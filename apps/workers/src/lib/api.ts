import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { Env } from '../env';
import type { Result } from '@hummbl/core';

export interface ApiError {
  code: string;
  message: string;
  status: ContentfulStatusCode;
  details?: unknown;
}

export const createApiError = (
  code: string,
  message: string,
  status: ContentfulStatusCode,
  details?: unknown
): ApiError => ({
  code,
  message,
  status,
  ...(details ? { details } : {}),
});

export const respondWithResult = <T>(
  c: Context<{ Bindings: Env }>,
  result: Result<T, ApiError>,
  successStatus = 200 as const
) => {
  if (result.ok) {
    return c.json(
      {
        ok: true,
        value: result.value,
      },
      successStatus
    );
  }

  return c.json(
    {
      ok: false,
      error: {
        code: result.error.code,
        message: result.error.message,
        details: result.error.details ?? null,
      },
    },
    result.error.status
  );
};

export const logCacheError = (message: string, error: unknown) => {
  console.warn(`[CACHE] ${message}`, error);
};
