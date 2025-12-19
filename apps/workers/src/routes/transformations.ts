/**
 * Transformations API Routes
 */

import { Hono } from 'hono';
import {
  TRANSFORMATIONS,
  Result,
  TransformationParamSchema,
  type TransformationType,
} from '@hummbl/core';
import type { Env } from '../env';
import { createApiError, respondWithResult } from '../lib/api';
import { getCachedResult } from '../lib/cache';
import type { ApiError } from '../lib/api';

interface DbMentalModel {
  code: string;
  name: string;
  transformation: TransformationType;
  definition: string;
  whenToUse: string;
  example?: string;
  priority: number;
  system_prompt: string;
}

export const transformationsRouter = new Hono<{ Bindings: Env }>();

// GET /v1/transformations - List all transformations
transformationsRouter.get('/', async c => {
  const cacheKey = 'transformations:list';

  const result = await getCachedResult(
    c.env,
    cacheKey,
    async (): Promise<
      Result<{ transformations: typeof TRANSFORMATIONS; count: number }, ApiError>
    > => {
      try {
        const transformations = TRANSFORMATIONS;
        return Result.ok({
          transformations,
          count: Object.keys(transformations).length,
        });
      } catch (error) {
        return Result.err(
          createApiError('internal_error', 'Failed to load transformations', 500, {
            cause: error instanceof Error ? error.message : String(error),
          })
        );
      }
    },
    {
      memoryTtlSeconds: 300,
      cfTtlSeconds: 600,
      kvTtlSeconds: 14400,
    }
  );

  return respondWithResult(c, result);
});

// GET /v1/transformations/:type - Get a specific transformation with its models
transformationsRouter.get('/:type', async c => {
  const typeParam = c.req.param('type').toUpperCase();
  const parsed = TransformationParamSchema.safeParse({ transformation: typeParam });

  if (!parsed.success) {
    return respondWithResult(
      c,
      Result.err(
        createApiError(
          'invalid_transformation',
          'Transformation type is invalid',
          400,
          parsed.error.flatten()
        )
      )
    );
  }

  const type = parsed.data.transformation;
  const transformation = TRANSFORMATIONS[type];

  if (!transformation) {
    return respondWithResult(
      c,
      Result.err(
        createApiError('not_found', `Transformation ${type} not found`, 404, {
          validTypes: Object.keys(TRANSFORMATIONS),
        })
      )
    );
  }

  const cacheKey = `transformation:${type}`;

  const result = await getCachedResult(
    c.env,
    cacheKey,
    async (): Promise<
      Result<typeof transformation & { models: DbMentalModel[]; modelCount: number }, ApiError>
    > => {
      try {
        const { results } = await c.env.DB.prepare(
          `
            SELECT code, name, transformation, description as definition, description as whenToUse, example, 1 as priority, '' as system_prompt
            FROM mental_models
            WHERE transformation = ?
            ORDER BY code
          `
        )
          .bind(type)
          .all<DbMentalModel>();

        return Result.ok({
          ...transformation,
          models: results,
          modelCount: results.length,
        });
      } catch (error) {
        return Result.err(
          createApiError('db_error', 'Failed to fetch transformation models', 500, {
            cause: error instanceof Error ? error.message : String(error),
          })
        );
      }
    },
    {
      memoryTtlSeconds: 120,
      cfTtlSeconds: 600,
      kvTtlSeconds: 7200,
    }
  );

  return respondWithResult(c, result);
});
