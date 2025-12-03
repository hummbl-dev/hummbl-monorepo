/**
 * HUMMBL Workers API
 * Cloudflare Workers REST API for Base120 mental models
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './env';
import { modelsRouter } from './routes/models';
import { transformationsRouter } from './routes/transformations';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'HUMMBL Workers API',
    version: c.env.API_VERSION || 'v1',
    environment: c.env.ENVIRONMENT || 'production',
    status: 'healthy',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.route('/v1/models', modelsRouter);
app.route('/v1/transformations', transformationsRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
  }, 500);
});

export default app;
