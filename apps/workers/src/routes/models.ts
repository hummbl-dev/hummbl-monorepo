/**
 * Models API Routes
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../env';
import { ModelCodeSchema, ModelFilterSchema, Result, type TransformationType } from '@hummbl/core';
import { createApiError, respondWithResult } from '../lib/api';
import { getCachedResult } from '../lib/cache';
import type { ApiError } from '../lib/api';

interface DbMentalModel {
  code: string;
  name: string;
  transformation: TransformationType;
  description: string;
  example?: string;
  tags: string;
  difficulty: string;
  relatedModels: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

const mapToApiModel = (model: DbMentalModel): DbMentalModel => ({
  ...model,
});

interface DbRelationship {
  id: number;
  source_code: string;
  target_code: string;
  relationship_type: string;
  confidence: number;
  evidence?: string;
  created_at: string;
}

const MODEL_SELECT =
  'SELECT code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt FROM mental_models';

const buildModelsQuery = (filters: { transformation?: TransformationType; search?: string }) => {
  const clauses: string[] = [];
  const params: string[] = [];

  if (filters.transformation) {
    // Validate transformation type
    const validTransformations = ['P', 'IN', 'CO', 'DE', 'RE', 'SY'];
    if (!validTransformations.includes(filters.transformation)) {
      throw new Error('Invalid transformation type');
    }
    clauses.push('transformation = ?');
    params.push(filters.transformation);
  }

  if (filters.search) {
    // Enhanced input validation and sanitization
    if (
      typeof filters.search !== 'string' ||
      filters.search.length > 100 ||
      filters.search.length < 1
    ) {
      throw new Error('Invalid search term');
    }

    // Remove potentially dangerous characters
    const sanitizedSearch = filters.search
      .replace(/[%_\\]/g, '\\$&')
      .replace(/[<>"'&]/g, '')
      .trim();

    if (sanitizedSearch.length === 0) {
      throw new Error('Search term too short after sanitization');
    }

    const searchTerm = `%${sanitizedSearch.toLowerCase()}%`;
    clauses.push('(LOWER(description) LIKE ? OR LOWER(name) LIKE ? OR code LIKE ?)');
    params.push(searchTerm, searchTerm, `%${sanitizedSearch.toUpperCase()}%`);
  }

  const whereClause = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const orderClause = ' ORDER BY transformation, code';

  return {
    query: `${MODEL_SELECT}${whereClause}${orderClause}`,
    params,
  };
};

export const modelsRouter = new Hono<{ Bindings: Env }>();

// GET /v1/models - List all models with optional filters
modelsRouter.get('/', async c => {
  const parsedFilters = ModelFilterSchema.safeParse(c.req.query());
  if (!parsedFilters.success) {
    return respondWithResult(
      c,
      Result.err(
        createApiError(
          'invalid_query',
          'Query parameters failed validation',
          400,
          parsedFilters.error.flatten()
        )
      )
    );
  }

  const { transformation, search } = parsedFilters.data;
  const cacheKey = ['models', transformation ?? 'all', search?.toLowerCase() ?? ''].join(':');

  const result = await getCachedResult(
    c.env,
    cacheKey,
    async (): Promise<
      Result<
        {
          models: DbMentalModel[];
          count: number;
          transformation: TransformationType | null;
          search: string | null;
        },
        ApiError
      >
    > => {
      const { query, params } = buildModelsQuery({ transformation, search });
      try {
        const { results } = await c.env.DB.prepare(query)
          .bind(...params)
          .all<DbMentalModel>();

        return Result.ok({
          models: results.map(mapToApiModel),
          count: results.length,
          transformation: transformation ?? null,
          search: search ?? null,
        });
      } catch (error) {
        return Result.err(
          createApiError('db_error', 'Failed to fetch models', 500, {
            cause: error instanceof Error ? error.message : String(error),
          })
        );
      }
    },
    {
      memoryTtlSeconds: 60,
      cfTtlSeconds: 300,
      kvTtlSeconds: 3600,
    }
  );

  return respondWithResult(c, result);
});

// GET /v1/models/:code - Get a specific model by code
modelsRouter.get('/:code', async c => {
  const rawCode = c.req.param('code');
  if (
    !rawCode ||
    typeof rawCode !== 'string' ||
    rawCode.length > 10 ||
    !/^[A-Z0-9]+$/.test(rawCode.toUpperCase())
  ) {
    return respondWithResult(
      c,
      Result.err(createApiError('invalid_code', 'Model code is invalid', 400))
    );
  }
  const code = rawCode.toUpperCase();
  const parsed = ModelCodeSchema.safeParse({ code });

  if (!parsed.success) {
    return respondWithResult(
      c,
      Result.err(
        createApiError('invalid_code', 'Model code is invalid', 400, parsed.error.flatten())
      )
    );
  }

  const cacheKey = `model:${code}`;

  const result = await getCachedResult(
    c.env,
    cacheKey,
    async (): Promise<Result<{ model: DbMentalModel }, ApiError>> => {
      try {
        const model = await c.env.DB.prepare(
          'SELECT code, name, transformation, description, example, tags, difficulty, relatedModels, version, createdAt, updatedAt FROM mental_models WHERE code = ?'
        )
          .bind(code)
          .first<DbMentalModel>();

        if (!model) {
          return Result.err(createApiError('not_found', `Model ${code} not found`, 404, { code }));
        }

        return Result.ok({ model: mapToApiModel(model) });
      } catch (error) {
        return Result.err(
          createApiError('db_error', 'Failed to fetch model', 500, {
            cause: error instanceof Error ? error.message : String(error),
          })
        );
      }
    }
  );

  return respondWithResult(c, result);
});

// GET /v1/models/:code/relationships - Get relationships for a model
modelsRouter.get('/:code/relationships', async c => {
  const rawCode = c.req.param('code');
  if (
    !rawCode ||
    typeof rawCode !== 'string' ||
    rawCode.length > 10 ||
    !/^[A-Z0-9]+$/.test(rawCode.toUpperCase())
  ) {
    return respondWithResult(
      c,
      Result.err(createApiError('invalid_code', 'Model code is invalid', 400))
    );
  }
  const code = rawCode.toUpperCase();
  const parsed = ModelCodeSchema.safeParse({ code });

  if (!parsed.success) {
    return respondWithResult(
      c,
      Result.err(
        createApiError('invalid_code', 'Model code is invalid', 400, parsed.error.flatten())
      )
    );
  }

  const cacheKey = `model:${code}:relationships`;

  const result = await getCachedResult(
    c.env,
    cacheKey,
    async (): Promise<
      Result<{ model: string; relationships: DbRelationship[]; count: number }, ApiError>
    > => {
      try {
        const modelExists = await c.env.DB.prepare('SELECT code FROM mental_models WHERE code = ?')
          .bind(code)
          .first();

        if (!modelExists) {
          return Result.err(createApiError('not_found', `Model ${code} not found`, 404, { code }));
        }

        const { results } = await c.env.DB.prepare(
          `
            SELECT id, source_code, target_code, relationship_type, confidence, evidence, created_at
            FROM model_relationships
            WHERE source_code = ? OR target_code = ?
            ORDER BY confidence DESC, created_at DESC
          `
        )
          .bind(code, code)
          .all<DbRelationship>();

        return Result.ok({
          model: code,
          relationships: results,
          count: results.length,
        });
      } catch (error) {
        return Result.err(
          createApiError('db_error', 'Failed to fetch relationships', 500, {
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

// POST /v1/models/recommend - Get model recommendations
const recommendSchema = z.object({
  problem: z
    .string()
    .min(10, 'Problem description must be at least 10 characters')
    .max(1000, 'Problem description too long'),
});

modelsRouter.post('/recommend', async c => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (error) {
      console.error('JSON parsing error in recommendations:', error);
      return respondWithResult(
        c,
        Result.err(createApiError('invalid_request', 'Invalid JSON format', 400))
      );
    }

    if (!body || typeof body !== 'object') {
      return respondWithResult(
        c,
        Result.err(createApiError('invalid_request', 'Request body must be an object', 400))
      );
    }

    let parsedData;
    try {
      parsedData = recommendSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return respondWithResult(
          c,
          Result.err(createApiError('invalid_request', 'Invalid request', 400, error.flatten()))
        );
      }
      throw error;
    }

    const { problem } = parsedData;

    // Sanitize input to prevent XSS
    const sanitizedProblem = problem.replace(/[<>"'&]/g, '').trim();

    if (sanitizedProblem.length < 10) {
      return respondWithResult(
        c,
        Result.err(
          createApiError('invalid_request', 'Problem description too short after sanitization', 400)
        )
      );
    }

    // Extract and validate keywords
    const keywords = sanitizedProblem
      .toLowerCase()
      .split(/\s+/)
      .filter(k => k.length > 2 && k.length < 50 && /^[a-z0-9]+$/.test(k))
      .slice(0, 5); // Limit to 5 keywords

    if (keywords.length === 0) {
      return respondWithResult(
        c,
        Result.err(
          createApiError('invalid_request', 'No valid keywords found in problem description', 400)
        )
      );
    }

    // Use parameterized query with escaped search terms
    const searchTerm = `%${keywords[0].substring(0, 30)}%`;

    let results;
    try {
      const dbResult = await c.env.DB.prepare(
        `
          SELECT code, name, transformation, description
          FROM mental_models
          WHERE (LOWER(description) LIKE ? OR LOWER(name) LIKE ?)
          AND LENGTH(code) <= 10
          ORDER BY 
            CASE 
              WHEN LOWER(name) LIKE ? THEN 1
              WHEN LOWER(description) LIKE ? THEN 2
              ELSE 3
            END,
            code
          LIMIT 10
        `
      )
        .bind(searchTerm, searchTerm, searchTerm, searchTerm)
        .all<Pick<DbMentalModel, 'code' | 'name' | 'transformation' | 'description'>>();

      if (!dbResult || !Array.isArray(dbResult.results)) {
        throw new Error('Invalid database response');
      }

      results = dbResult.results;
    } catch (dbError) {
      console.error('Database error in recommendations:', dbError);
      return respondWithResult(
        c,
        Result.err(
          createApiError('db_error', 'Failed to query recommendations', 500, {
            cause: dbError instanceof Error ? dbError.message : String(dbError),
          })
        )
      );
    }

    // Sanitize response data
    const sanitizedResults = results.map(result => ({
      code: result.code,
      name: typeof result.name === 'string' ? result.name.substring(0, 100) : '',
      transformation: result.transformation,
      description:
        typeof result.description === 'string' ? result.description.substring(0, 500) : '',
    }));

    return respondWithResult(
      c,
      Result.ok({
        problem: sanitizedProblem.substring(0, 1000),
        recommendations: sanitizedResults,
        count: sanitizedResults.length,
      })
    );
  } catch (error) {
    console.error('Recommendations error:', error);
    if (error instanceof z.ZodError) {
      return respondWithResult(
        c,
        Result.err(createApiError('invalid_request', 'Invalid request', 400, error.flatten()))
      );
    }

    return respondWithResult(
      c,
      Result.err(
        createApiError('server_error', 'Failed to generate recommendations', 500, {
          cause: error instanceof Error ? error.message : String(error),
        })
      )
    );
  }
});
