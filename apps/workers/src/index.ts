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
import authRouter from './routes/auth';
import { userRouter } from './routes/user';
import analytics, { trackRequest } from './routes/analytics';
import { rateLimiter, createTieredRateLimiter } from './middleware/rateLimiter';
import { errorTrackingMiddleware, enhancedErrorHandler } from './middleware/errorTracking';
import { createLogger, addBreadcrumb } from '@hummbl/core';
import { createProtectedDatabase } from './lib/db-wrapper';
import {
  circuitBreakerMonitoring,
  createCircuitBreakerMetricsRouter,
  performanceMonitoring,
} from './middleware/circuit-breaker-monitoring';

const app = new Hono<{ Bindings: Env }>();
const appLogger = createLogger('workers');

// Middleware
app.use('*', logger());
app.use('*', errorTrackingMiddleware()); // Add error tracking early in the middleware chain
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// ============================================
// Rate Limiting Configuration
// ============================================
//
// Different endpoints have different rate limits based on:
// - Computational cost (e.g., recommendations are expensive)
// - Data sensitivity (e.g., auth endpoints are strict)
// - Expected usage patterns (e.g., read operations are frequent)
//
// Tier Overview:
// - auth: 10 req/min (brute force protection)
// - models_read: 100 req/min (standard API reads)
// - models_write: 30 req/min (data modifications)
// - models_recommend: 20 req/min (expensive computation)
// - transformations_read: 120 req/min (cached/static data)
// - user: 200 req/min (authenticated user operations)
// - analytics: 30 req/min (admin/reporting)
// - public: 300 req/min (health checks)

// Auth routes have their own internal rate limiting (more strict)
// We apply a looser limit here as a safety net
app.use('/v1/auth/*', createTieredRateLimiter('auth'));

// Models routes - differentiated by operation type
// GET /v1/models/* uses models_read tier (applied automatically by path detection)
// POST /v1/models/recommend uses models_recommend tier (applied automatically)
app.use('/v1/models/*', rateLimiter());

// Transformations routes
app.use('/v1/transformations/*', createTieredRateLimiter('transformations_read'));

// User routes (authenticated - higher limits)
app.use('/v1/user/*', createTieredRateLimiter('user'));

// Analytics routes
app.use('/v1/analytics/*', createTieredRateLimiter('analytics'));

// General API fallback for any other /v1/* routes
app.use('/v1/*', rateLimiter());

// Circuit breaker and performance monitoring
app.use('*', circuitBreakerMonitoring());
app.use('/v1/*', performanceMonitoring());

// Health check
app.get('/', c => {
  addBreadcrumb('health-check', 'Root endpoint accessed', 'info');
  return c.json({
    name: 'HUMMBL Workers API',
    version: c.env.API_VERSION || 'v1',
    environment: c.env.ENVIRONMENT || 'production',
    status: 'healthy',
  });
});

app.get('/health', c => {
  addBreadcrumb('health-check', 'Health endpoint accessed', 'info');

  try {
    // Get circuit breaker health status
    const protectedDb = createProtectedDatabase(c.env.DB);
    const dbHealth = protectedDb.getHealthStatus();

    // Calculate overall health
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (dbHealth.status === 'unhealthy') {
      overallStatus = 'unhealthy';
    } else if (dbHealth.status === 'degraded') {
      overallStatus = 'degraded';
    }

    return c.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      database: dbHealth,
      services: {
        api: 'healthy',
        cache: 'healthy', // KV cache is generally reliable
        circuitBreakers: {
          read: dbHealth.circuits.read.state,
          write: dbHealth.circuits.write.state,
          auth: dbHealth.circuits.auth.state,
        },
      },
      version: c.env.API_VERSION || 'v1',
      environment: c.env.ENVIRONMENT || 'production',
    });
  } catch (error) {
    // Fallback health response if circuit breaker check fails
    appLogger.error('Health check error', {
      context: 'workers-health-check',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    return c.json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: 'Unable to check all health metrics',
      services: {
        api: 'healthy',
      },
    });
  }
});

// Analytics middleware
app.use('*', async (c, next) => {
  await next();
  const userAgent = c.req.header('user-agent');
  trackRequest(c.req.path, userAgent);
});

// API Routes
app.route('/v1/models', modelsRouter);
app.route('/v1/transformations', transformationsRouter);
app.route('/v1/auth', authRouter);
app.route('/v1/user', userRouter);
app.route('/v1/analytics', analytics);

// Circuit breaker monitoring routes
app.route('/v1/circuit-breaker', createCircuitBreakerMetricsRouter());

// 404 handler
app.notFound(c => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Enhanced error handler
app.onError(enhancedErrorHandler());

export default app;
