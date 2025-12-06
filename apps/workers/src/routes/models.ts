/**
 * Models API Routes
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../env';
import type { TransformationType } from '@hummbl/core';

export const modelsRouter = new Hono<{ Bindings: Env }>();

// GET /v1/models - List all models with optional transformation filter
modelsRouter.get('/', async c => {
  const transformation = c.req.query('transformation') as TransformationType | undefined;

  try {
    let query =
      'SELECT code, name, transformation, definition, whenToUse, example, priority FROM mental_models';
    const params: string[] = [];

    if (transformation) {
      query += ' WHERE transformation = ?';
      params.push(transformation);
    }

    query += ' ORDER BY transformation, code';

    const { results } = await c.env.DB.prepare(query)
      .bind(...params)
      .all();

    return c.json({
      models: results,
      count: results.length,
      transformation: transformation || null,
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return c.json({ error: 'Failed to fetch models' }, 500);
  }
});

// GET /v1/models/:code - Get a specific model by code
modelsRouter.get('/:code', async c => {
  const code = c.req.param('code').toUpperCase();

  try {
    const model = await c.env.DB.prepare(
      'SELECT code, name, transformation, definition, whenToUse, example, priority FROM mental_models WHERE code = ?'
    )
      .bind(code)
      .first();

    if (!model) {
      return c.json({ error: 'Model not found', code }, 404);
    }

    return c.json({ model });
  } catch (error) {
    console.error('Error fetching model:', error);
    return c.json({ error: 'Failed to fetch model' }, 500);
  }
});

// GET /v1/models/:code/relationships - Get relationships for a model
modelsRouter.get('/:code/relationships', async c => {
  const code = c.req.param('code').toUpperCase();

  try {
    // First verify the model exists
    const modelExists = await c.env.DB.prepare('SELECT code FROM mental_models WHERE code = ?')
      .bind(code)
      .first();

    if (!modelExists) {
      return c.json({ error: 'Model not found', code }, 404);
    }

    // Fetch relationships
    const { results } = await c.env.DB.prepare(
      `
        SELECT id, source_code, target_code, relationship_type, confidence, evidence, created_at
        FROM model_relationships
        WHERE source_code = ? OR target_code = ?
        ORDER BY confidence DESC, created_at DESC
      `
    )
      .bind(code, code)
      .all();

    return c.json({
      model: code,
      relationships: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching relationships:', error);
    return c.json({ error: 'Failed to fetch relationships' }, 500);
  }
});

// POST /v1/recommend - Get model recommendations based on problem description
const recommendSchema = z.object({
  problem: z.string().min(10, 'Problem description must be at least 10 characters'),
});

modelsRouter.post('/recommend', async c => {
  try {
    const body = await c.req.json();
    const { problem } = recommendSchema.parse(body);

    // Simple keyword-based recommendation
    // In production, this would use vector similarity or LLM-based matching
    const keywords = problem.toLowerCase().split(/\s+/);

    const { results } = await c.env.DB.prepare(
      `
        SELECT code, name, transformation, definition, priority
        FROM mental_models
        WHERE LOWER(definition) LIKE ? OR LOWER(whenToUse) LIKE ?
        ORDER BY priority DESC
        LIMIT 10
      `
    )
      .bind(`%${keywords[0]}%`, `%${keywords[0]}%`)
      .all();

    return c.json({
      problem,
      recommendations: results,
      count: results.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request', details: error.errors }, 400);
    }
    console.error('Error generating recommendations:', error);
    return c.json({ error: 'Failed to generate recommendations' }, 500);
  }
});
