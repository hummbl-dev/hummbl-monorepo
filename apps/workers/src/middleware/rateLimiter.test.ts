/**
 * Rate Limiter Middleware Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../env';
import {
  rateLimiter,
  createTieredRateLimiter,
  createExpensiveOperationLimiter,
  getRateLimitTier,
  RATE_LIMITS,
} from './rateLimiter';

// Mock the @hummbl/core module
vi.mock('@hummbl/core', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
  logError: vi.fn(),
}));

// Mock KV namespace
const createMockKV = () => {
  const store = new Map<string, { value: string; expiration?: number }>();
  
  return {
    get: vi.fn(async <T>(key: string, type?: string): Promise<T | null> => {
      const item = store.get(key);
      if (!item) return null;
      if (item.expiration && item.expiration < Date.now() / 1000) {
        store.delete(key);
        return null;
      }
      return type === 'json' ? JSON.parse(item.value) : item.value as T;
    }),
    put: vi.fn(async (key: string, value: string, options?: { expirationTtl?: number }) => {
      store.set(key, {
        value,
        expiration: options?.expirationTtl ? Math.floor(Date.now() / 1000) + options.expirationTtl : undefined,
      });
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key);
    }),
    _store: store, // Expose for testing
  };
};

// Create test app
const createTestApp = (middleware: any) => {
  const app = new Hono<{ Bindings: Env }>();
  app.use(middleware);
  app.get('/test', c => c.json({ success: true }));
  app.post('/test', c => c.json({ success: true }));
  return app;
};

describe('Rate Limiter', () => {
  let mockKV: ReturnType<typeof createMockKV>;
  let mockEnv: Env;

  beforeEach(() => {
    mockKV = createMockKV();
    mockEnv = {
      DB: {} as any,
      CACHE: mockKV as any,
      ASSETS: {} as any,
      ENVIRONMENT: 'test',
      API_VERSION: 'v1',
      JWT_SECRET: 'test-secret',
      PASSWORD_SALT: 'test-salt',
      GITHUB_CLIENT_ID: 'test-github-id',
      GITHUB_CLIENT_SECRET: 'test-github-secret',
      GOOGLE_CLIENT_ID: 'test-google-id',
      GOOGLE_CLIENT_SECRET: 'test-google-secret',
    };
    vi.clearAllMocks();
  });

  describe('getRateLimitTier', () => {
    it('should return auth tier for auth endpoints', () => {
      expect(getRateLimitTier('/v1/auth/login', 'POST')).toBe('auth');
      expect(getRateLimitTier('/v1/auth/register', 'POST')).toBe('auth');
      expect(getRateLimitTier('/v1/auth/google', 'POST')).toBe('auth');
    });

    it('should return models_read tier for GET model endpoints', () => {
      expect(getRateLimitTier('/v1/models', 'GET')).toBe('models_read');
      expect(getRateLimitTier('/v1/models/P1', 'GET')).toBe('models_read');
      expect(getRateLimitTier('/v1/models/P1/relationships', 'GET')).toBe('models_read');
    });

    it('should return models_write tier for POST/PUT/DELETE model endpoints', () => {
      expect(getRateLimitTier('/v1/models', 'POST')).toBe('models_write');
      expect(getRateLimitTier('/v1/models/P1', 'PUT')).toBe('models_write');
      expect(getRateLimitTier('/v1/models/P1', 'DELETE')).toBe('models_write');
    });

    it('should return models_recommend tier for recommendations', () => {
      expect(getRateLimitTier('/v1/models/recommend', 'POST')).toBe('models_recommend');
    });

    it('should return transformations_read tier for transformation endpoints', () => {
      expect(getRateLimitTier('/v1/transformations', 'GET')).toBe('transformations_read');
      expect(getRateLimitTier('/v1/transformations/P', 'GET')).toBe('transformations_read');
    });

    it('should return user tier for user endpoints', () => {
      expect(getRateLimitTier('/v1/user/profile', 'GET')).toBe('user');
      expect(getRateLimitTier('/v1/user/progress', 'POST')).toBe('user');
    });

    it('should return analytics tier for analytics endpoints', () => {
      expect(getRateLimitTier('/v1/analytics/stats', 'GET')).toBe('analytics');
    });

    it('should return public tier for root and health', () => {
      expect(getRateLimitTier('/', 'GET')).toBe('public');
      expect(getRateLimitTier('/health', 'GET')).toBe('public');
    });
  });

  describe('RATE_LIMITS configuration', () => {
    it('should have correct limits for each tier', () => {
      expect(RATE_LIMITS.auth.maxRequests).toBe(10);
      expect(RATE_LIMITS.auth.windowSeconds).toBe(60);
      
      expect(RATE_LIMITS.models_read.maxRequests).toBe(100);
      expect(RATE_LIMITS.models_read.windowSeconds).toBe(60);
      
      expect(RATE_LIMITS.models_recommend.maxRequests).toBe(20);
      expect(RATE_LIMITS.models_recommend.windowSeconds).toBe(60);
      
      expect(RATE_LIMITS.transformations_read.maxRequests).toBe(120);
      expect(RATE_LIMITS.transformations_read.windowSeconds).toBe(60);
      
      expect(RATE_LIMITS.user.maxRequests).toBe(200);
      expect(RATE_LIMITS.user.windowSeconds).toBe(60);
    });
  });

  describe('rateLimiter middleware', () => {
    it('should allow requests under the limit', async () => {
      const app = createTestApp(rateLimiter());
      
      const req = new Request('http://localhost/test', {
        headers: { 'CF-Connecting-IP': '192.168.1.1' },
      });
      
      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });

    it('should include rate limit headers in response', async () => {
      const app = createTestApp(rateLimiter());
      
      const req = new Request('http://localhost/test', {
        headers: { 'CF-Connecting-IP': '192.168.1.1' },
      });
      
      const res = await app.fetch(req, mockEnv);
      expect(res.headers.get('X-RateLimit-Limit')).toBeDefined();
      expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(res.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('should block requests over the limit', async () => {
      const app = createTestApp(rateLimiter({ maxRequests: 2, windowSeconds: 60 }));
      
      const headers = { 'CF-Connecting-IP': '192.168.1.1' };
      
      // First two requests should succeed
      const res1 = await app.fetch(new Request('http://localhost/test', { headers }), mockEnv);
      expect(res1.status).toBe(200);
      
      const res2 = await app.fetch(new Request('http://localhost/test', { headers }), mockEnv);
      expect(res2.status).toBe(200);
      
      // Third request should be rate limited
      const res3 = await app.fetch(new Request('http://localhost/test', { headers }), mockEnv);
      expect(res3.status).toBe(429);
      
      const body = await res3.json() as { error: string; code: string; retryAfter: number };
      expect(body.error).toBe('Too Many Requests');
      expect(body.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(body.retryAfter).toBeDefined();
    });

    it('should include Retry-After header when rate limited', async () => {
      const app = createTestApp(rateLimiter({ maxRequests: 1, windowSeconds: 60 }));
      
      const headers = { 'CF-Connecting-IP': '192.168.1.1' };
      
      // First request succeeds
      await app.fetch(new Request('http://localhost/test', { headers }), mockEnv);
      
      // Second request should be rate limited with Retry-After
      const res = await app.fetch(new Request('http://localhost/test', { headers }), mockEnv);
      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBeDefined();
      expect(parseInt(res.headers.get('Retry-After')!)).toBeGreaterThan(0);
    });

    it('should track different clients separately', async () => {
      const app = createTestApp(rateLimiter({ maxRequests: 1, windowSeconds: 60 }));
      
      // First IP hits limit
      await app.fetch(
        new Request('http://localhost/test', { headers: { 'CF-Connecting-IP': '192.168.1.1' } }),
        mockEnv
      );
      const res1 = await app.fetch(
        new Request('http://localhost/test', { headers: { 'CF-Connecting-IP': '192.168.1.1' } }),
        mockEnv
      );
      expect(res1.status).toBe(429);
      
      // Different IP should still be allowed
      const res2 = await app.fetch(
        new Request('http://localhost/test', { headers: { 'CF-Connecting-IP': '192.168.1.2' } }),
        mockEnv
      );
      expect(res2.status).toBe(200);
    });

    it('should skip rate limiting for health endpoints', async () => {
      const app = new Hono<{ Bindings: Env }>();
      app.use(rateLimiter({ maxRequests: 0, windowSeconds: 60 })); // Zero limit
      app.get('/health', c => c.json({ status: 'ok' }));
      
      const res = await app.fetch(
        new Request('http://localhost/health', { headers: { 'CF-Connecting-IP': '192.168.1.1' } }),
        mockEnv
      );
      expect(res.status).toBe(200);
    });

    it('should handle unknown clients with stricter limits', async () => {
      const app = createTestApp(rateLimiter({ maxRequests: 6, windowSeconds: 60 }));
      
      // No IP header - treated as unknown
      const res1 = await app.fetch(new Request('http://localhost/test'), mockEnv);
      expect(res1.status).toBe(200);
      expect(res1.headers.get('X-RateLimit-Limit')).toBe('2'); // 6 / 3 = 2
    });

    it('should use user ID from JWT for authenticated users', async () => {
      const app = createTestApp(rateLimiter({ maxRequests: 10, windowSeconds: 60 }));
      
      // Create a mock JWT token with user ID (base64 encoded payload)
      const payload = btoa(JSON.stringify({ sub: 'user-123', email: 'test@example.com' }));
      const token = `header.${payload}.signature`;
      
      const res = await app.fetch(
        new Request('http://localhost/test', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'CF-Connecting-IP': '192.168.1.1',
          },
        }),
        mockEnv
      );
      
      expect(res.status).toBe(200);
      // Authenticated users get 1.5x limit
      expect(res.headers.get('X-RateLimit-Limit')).toBe('15'); // 10 * 1.5 = 15
    });
  });

  describe('createTieredRateLimiter', () => {
    it('should create a rate limiter with the specified tier', async () => {
      const app = new Hono<{ Bindings: Env }>();
      app.use('/v1/auth/*', createTieredRateLimiter('auth'));
      app.post('/v1/auth/login', c => c.json({ success: true }));
      
      const headers = { 'CF-Connecting-IP': '192.168.1.1' };
      
      // Should allow up to 10 requests (auth tier limit)
      for (let i = 0; i < 10; i++) {
        const res = await app.fetch(
          new Request('http://localhost/v1/auth/login', { method: 'POST', headers }),
          mockEnv
        );
        expect(res.status).toBe(200);
      }
      
      // 11th request should be blocked
      const res = await app.fetch(
        new Request('http://localhost/v1/auth/login', { method: 'POST', headers }),
        mockEnv
      );
      expect(res.status).toBe(429);
    });
  });

  describe('createExpensiveOperationLimiter', () => {
    it('should create a rate limiter with custom limits', async () => {
      const app = new Hono<{ Bindings: Env }>();
      app.use('/expensive', createExpensiveOperationLimiter(5, 300)); // 5 requests per 5 minutes
      app.get('/expensive', c => c.json({ success: true }));
      
      const headers = { 'CF-Connecting-IP': '192.168.1.1' };
      
      // Should allow up to 5 requests
      for (let i = 0; i < 5; i++) {
        const res = await app.fetch(
          new Request('http://localhost/expensive', { headers }),
          mockEnv
        );
        expect(res.status).toBe(200);
      }
      
      // 6th request should be blocked
      const res = await app.fetch(
        new Request('http://localhost/expensive', { headers }),
        mockEnv
      );
      expect(res.status).toBe(429);
    });
  });

  describe('rate limit error response', () => {
    it('should return structured error response', async () => {
      const app = createTestApp(rateLimiter({ maxRequests: 1, windowSeconds: 60 }));
      
      const headers = { 'CF-Connecting-IP': '192.168.1.1' };
      
      // First request succeeds
      await app.fetch(new Request('http://localhost/test', { headers }), mockEnv);
      
      // Second request fails with structured error
      const res = await app.fetch(new Request('http://localhost/test', { headers }), mockEnv);
      const body = await res.json();
      
      expect(body).toMatchObject({
        error: 'Too Many Requests',
        code: 'RATE_LIMIT_EXCEEDED',
        tier: expect.any(String),
        limit: expect.any(Number),
        retryAfter: expect.any(Number),
        resetAt: expect.any(String),
      } as Record<string, unknown>);
    });
  });
});
