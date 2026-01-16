/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * HUMMBL Workers API with OpenAPI Documentation
 * Cloudflare Workers REST API for Base120 mental models
 */

import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
// import type { Env } from './env';
import { createOpenAPIApp, setupSwaggerUI } from './openapi/config';
import { createLogger, logError } from '@hummbl/core';
import { rateLimiter } from './middleware/rateLimiter';

// Import route definitions
import {
  healthRoute,
  rootRoute,
  // loginRoute,
  // registerRoute,
  // googleAuthRoute,
  // githubAuthRoute,
  // verifyTokenRoute,
  // refreshTokenRoute,
  // getModelsRoute,
  // getModelRoute,
  // getModelRelationshipsRoute,
  // recommendModelsRoute,
  // getTransformationsRoute,
  // getTransformationRoute,
  // getUserProgressRoute,
  // addProgressRoute,
  // getUserFavoritesRoute,
  // getUserProfileRoute,
  // getAnalyticsStatsRoute,
  // getAnalyticsHealthRoute,
} from './openapi/routes';

// Import existing route handlers
import { modelsRouter } from './routes/models';
import { transformationsRouter } from './routes/transformations';
import authRouter from './routes/auth';
import { userRouter } from './routes/user';
import analytics, { trackRequest } from './routes/analytics';

// const appLogger = createLogger('workers-api');

// Create OpenAPI-enabled app
const app = createOpenAPIApp();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// Setup Swagger UI and documentation endpoints
setupSwaggerUI(app);

// Global rate limiting (before auth routes to avoid double limiting)
app.use('/v1/*', rateLimiter());

// Analytics middleware
app.use('*', async (c, next) => {
  await next();
  const userAgent = c.req.header('user-agent');
  trackRequest(c.req.path, userAgent);
});

// Health and Info Routes with OpenAPI
app.openapi(rootRoute, c => {
  return c.json({
    name: 'HUMMBL Workers API',
    version: c.env.API_VERSION || 'v1',
    environment: c.env.ENVIRONMENT || 'production',
    status: 'healthy',
  });
});

app.openapi(healthRoute, c => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: 0, // Cloudflare Workers don't have persistent uptime
    version: c.env.API_VERSION || '1.0.0',
  });
});

// Authentication Routes with OpenAPI
// Note: For now, we'll route to the existing implementations
// These could be gradually migrated to use the OpenAPI route handlers

// Mount existing route handlers
app.route('/v1/models', modelsRouter);
app.route('/v1/transformations', transformationsRouter);
app.route('/v1/auth', authRouter);
app.route('/v1/user', userRouter);
app.route('/v1/analytics', analytics);

// Additional documentation endpoints
app.get('/health', c => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: 0,
    version: c.env.API_VERSION || '1.0.0',
  });
});

// Rate limiting information endpoint
app.get('/v1/rate-limit-info', c => {
  return c.json({
    description: 'API Rate Limiting Information',
    globalRateLimit: {
      windowSeconds: 60,
      maxRequests: 100,
      scope: 'per IP address',
    },
    authRateLimit: {
      windowSeconds: 60,
      maxRequests: 10,
      scope: 'per IP address',
      endpoints: ['/v1/auth/*'],
    },
    rateLimitHeaders: {
      'X-RateLimit-Limit': 'Maximum requests per window',
      'X-RateLimit-Remaining': 'Remaining requests in current window',
      'X-RateLimit-Reset': 'Window reset time (Unix timestamp)',
      'Retry-After': 'Seconds to wait when rate limited (429 responses only)',
    },
    bestPractices: [
      'Implement exponential backoff on 429 responses',
      'Cache responses when possible to reduce API calls',
      'Use appropriate User-Agent headers for better rate limit allocation',
      'Consider using authentication tokens for higher rate limits',
    ],
  });
});

// OAuth flow information endpoint
app.get('/v1/auth/oauth-info', c => {
  return c.json({
    description: 'OAuth Authentication Flow Information',
    providers: {
      google: {
        name: 'Google OAuth 2.0',
        authUrl: 'https://accounts.google.com/oauth/authorize',
        scopes: ['openid', 'email', 'profile'],
        implementation: 'Server-side token verification',
        endpoint: '/v1/auth/google',
      },
      github: {
        name: 'GitHub OAuth 2.0',
        authUrl: 'https://github.com/login/oauth/authorize',
        scopes: ['read:user', 'user:email'],
        implementation: 'Authorization code flow',
        endpoint: '/v1/auth/github',
      },
    },
    tokenFormat: {
      type: 'JWT (JSON Web Token)',
      algorithm: 'HS256',
      expiration: '24 hours',
      refreshable: true,
      refreshTokenExpiration: '7 days',
    },
    usage: {
      header: 'Authorization: Bearer <token>',
      securityScheme: 'BearerAuth',
    },
  });
});

// Base120 system information endpoint
app.get('/v1/base120-info', c => {
  return c.json({
    description: 'Base120 Mental Models System Information',
    overview: 'A comprehensive collection of 120+ mental models organized by transformation types',
    transformations: {
      P: {
        name: 'Perspective',
        description: 'Models for changing viewpoints and reframing problems',
        examples: ['First Principles', 'Inversion', "Devil's Advocate"],
      },
      IN: {
        name: 'Input',
        description: 'Models for gathering and processing information',
        examples: ['Active Listening', 'SWOT Analysis', 'Five Whys'],
      },
      CO: {
        name: 'Connection',
        description: 'Models for finding relationships and patterns',
        examples: ['Network Effects', 'Analogical Thinking', 'Systems Thinking'],
      },
      DE: {
        name: 'Decision',
        description: 'Models for making choices and judgments',
        examples: ['Decision Trees', 'Expected Value', 'Sunk Cost Fallacy'],
      },
      RE: {
        name: 'Reflection',
        description: 'Models for self-awareness and learning',
        examples: ['Retrospectives', 'Growth Mindset', 'Feedback Loops'],
      },
      SY: {
        name: 'System',
        description: 'Models for understanding complex systems',
        examples: ['Leverage Points', 'Feedback Systems', 'Emergence'],
      },
    },
    usage: {
      browse: 'GET /v1/models - Browse all models with optional filters',
      search: 'POST /v1/models/recommend - Get recommendations for a problem',
      details: 'GET /v1/models/{code} - Get detailed model information',
      relationships: 'GET /v1/models/{code}/relationships - Find related models',
    },
  });
});

// Error handling middleware
app.onError((err, c) => {
  logError(err, {
    path: c.req.path,
    method: c.req.method,
    userAgent: c.req.header('user-agent'),
    ip: c.req.header('CF-Connecting-IP') || 'unknown',
  });

  return c.json(
    {
      ok: false,
      error: {
        code: 'internal_error',
        message: 'Internal Server Error',
        details: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
      },
    },
    500
  );
});

// 404 handler
app.notFound(c => {
  return c.json(
    {
      ok: false,
      error: {
        code: 'not_found',
        message: 'Endpoint not found',
        details: {
          path: c.req.path,
          method: c.req.method,
          availableEndpoints: [
            'GET /',
            'GET /health',
            'GET /docs - Interactive API documentation',
            'GET /redoc - Alternative documentation',
            'GET /openapi.json - OpenAPI specification',
            'GET /v1/models',
            'GET /v1/transformations',
            'POST /v1/auth/login',
            'POST /v1/auth/register',
            'GET /v1/user/profile (requires auth)',
            'GET /v1/analytics/stats',
          ],
        },
      },
    },
    404
  );
});

export default app;
