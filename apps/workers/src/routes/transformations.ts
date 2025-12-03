/**
 * Transformations API Routes
 */

import { Hono } from 'hono';
import { TRANSFORMATIONS, type TransformationType } from '@hummbl/core';
import type { Env } from '../env';

export const transformationsRouter = new Hono<{ Bindings: Env }>();

// GET /v1/transformations - List all transformations
transformationsRouter.get('/', (c) => {
  const transformations = Object.values(TRANSFORMATIONS);
  
  return c.json({
    transformations,
    count: transformations.length,
  });
});

// GET /v1/transformations/:type - Get a specific transformation with its models
transformationsRouter.get('/:type', async (c) => {
  const type = c.req.param('type').toUpperCase() as TransformationType;
  
  const transformation = TRANSFORMATIONS[type];
  
  if (!transformation) {
    return c.json({
      error: 'Transformation not found',
      type,
      validTypes: Object.keys(TRANSFORMATIONS),
    }, 404);
  }
  
  try {
    // Fetch models for this transformation from D1
    const { results } = await c.env.DB
      .prepare(`
        SELECT code, name, transformation, definition, whenToUse, example, priority
        FROM mental_models
        WHERE transformation = ?
        ORDER BY code
      `)
      .bind(type)
      .all();
    
    return c.json({
      ...transformation,
      models: results,
      modelCount: results.length,
    });
  } catch (error) {
    console.error('Error fetching transformation models:', error);
    return c.json({ error: 'Failed to fetch transformation models' }, 500);
  }
});
