/**
 * Global Rate Limiting Middleware
 * Provides tiered rate limiting for different endpoints with granular control
 * 
 * Rate Limit Tiers:
 * - auth: Authentication endpoints (most restrictive)
 * - models_read: GET /v1/models/* (standard read operations)
 * - models_write: POST/PUT/DELETE /v1/models/* (write operations)
 * - models_recommend: POST /v1/models/recommend (expensive computation)
 * - transformations_read: GET /v1/transformations/* (standard read operations)
 * - user: User-specific endpoints (authenticated operations)
 * - analytics: Analytics endpoints
 * - api: General API endpoints
 * - public: Health checks and static content (least restrictive)
 */

import type { Context, Next } from 'hono';
import type { Env } from '../env';
import { logError, createLogger } from '@hummbl/core';

const rateLimiterLogger = createLogger('rate-limiter');

// Rate limiting configurations for different endpoint types
export const RATE_LIMITS = {
  // Authentication endpoints (most restrictive - prevent brute force)
  auth: {
    windowSeconds: 60,
    maxRequests: 10,
    description: 'Authentication endpoints (login, register, OAuth)',
  },
  // Models read operations (standard API usage)
  models_read: {
    windowSeconds: 60,
    maxRequests: 100,
    description: 'Model list, get model, get relationships',
  },
  // Models write operations (data modification)
  models_write: {
    windowSeconds: 60,
    maxRequests: 30,
    description: 'Model creation, updates, deletion',
  },
  // Model recommendations (expensive operation - database query + computation)
  models_recommend: {
    windowSeconds: 60,
    maxRequests: 20,
    description: 'Model recommendations (computationally expensive)',
  },
  // Transformations read operations
  transformations_read: {
    windowSeconds: 60,
    maxRequests: 120,
    description: 'List transformations, get transformation with models',
  },
  // User endpoints (authenticated - higher limits for logged-in users)
  user: {
    windowSeconds: 60,
    maxRequests: 200,
    description: 'User profile, progress, favorites',
  },
  // Analytics endpoints
  analytics: {
    windowSeconds: 60,
    maxRequests: 30,
    description: 'Analytics and statistics',
  },
  // General API fallback
  api: {
    windowSeconds: 60,
    maxRequests: 60,
    description: 'General API endpoints',
  },
  // Health checks and public endpoints
  public: {
    windowSeconds: 60,
    maxRequests: 300,
    description: 'Health checks, root endpoint',
  },
} as const;

export type RateLimitTier = keyof typeof RATE_LIMITS;

interface RateLimitData {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  tier?: RateLimitTier;
  windowSeconds?: number;
  maxRequests?: number;
  skipSuccessfulRequests?: boolean;
  keyPrefix?: string;
}

/**
 * Decodes a JWT token without verification (for extracting user ID for rate limiting)
 * Note: This is safe for rate limiting since we only use it for bucketing, not security
 */
function decodeJwtUserId(token: string): string | null {
  try {
    // Split the token and get the payload
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Base64 decode the payload
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || payload.userId || null;
  } catch {
    return null;
  }
}

/**
 * Determines the rate limit tier based on the request path and method
 */
export function getRateLimitTier(path: string, method: string): RateLimitTier {
  const upperMethod = method.toUpperCase();
  
  // Authentication endpoints
  if (path.startsWith('/v1/auth')) {
    return 'auth';
  }
  
  // Models endpoints - differentiate between read and recommend
  if (path.startsWith('/v1/models')) {
    // Recommendations are expensive operations
    if (path.includes('/recommend')) {
      return 'models_recommend';
    }
    // Write operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(upperMethod)) {
      return 'models_write';
    }
    // Read operations
    return 'models_read';
  }
  
  // Transformations endpoints
  if (path.startsWith('/v1/transformations')) {
    return 'transformations_read';
  }
  
  // User endpoints
  if (path.startsWith('/v1/user')) {
    return 'user';
  }
  
  // Analytics endpoints
  if (path.startsWith('/v1/analytics')) {
    return 'analytics';
  }
  
  // General API endpoints
  if (path.startsWith('/v1/') || path.startsWith('/api/')) {
    return 'api';
  }
  
  // Public endpoints (health, root)
  return 'public';
}

/**
 * Extract client identifier from request
 * Uses authenticated user ID if available, falls back to IP address
 */
function getClientIdentifier(c: Context<{ Bindings: Env }>): { id: string; type: 'user' | 'ip' | 'unknown' } {
  // Try to extract user ID from JWT token
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const userId = decodeJwtUserId(token);
    if (userId) {
      return { id: `user:${userId}`, type: 'user' };
    }
  }
  
  // Fall back to CF-Connecting-IP from Cloudflare
  const cfIP = c.req.header('CF-Connecting-IP');
  if (cfIP && /^[0-9a-f.:]+$/i.test(cfIP)) {
    return { id: `ip:${cfIP}`, type: 'ip' };
  }
  
  // Try X-Forwarded-For as fallback (less trusted)
  const forwardedFor = c.req.header('X-Forwarded-For');
  if (forwardedFor) {
    const firstIP = forwardedFor.split(',')[0].trim();
    if (/^[0-9a-f.:]+$/i.test(firstIP)) {
      return { id: `ip:${firstIP}`, type: 'ip' };
    }
  }
  
  return { id: 'unknown', type: 'unknown' };
}

/**
 * Check if the request should be skipped for rate limiting
 */
function shouldSkipRateLimiting(path: string): boolean {
  // Skip health checks and root
  if (path === '/' || path === '/health') {
    return true;
  }
  
  // Skip circuit breaker monitoring internal endpoints
  if (path.startsWith('/v1/circuit-breaker')) {
    return true;
  }
  
  return false;
}

/**
 * Create rate limit response headers
 */
function createRateLimitHeaders(
  limit: number,
  remaining: number,
  resetAt: number,
  retryAfter?: number
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
    'X-RateLimit-Reset': resetAt.toString(),
  };
  
  if (retryAfter !== undefined) {
    headers['Retry-After'] = retryAfter.toString();
  }
  
  return headers;
}

/**
 * Global rate limiting middleware factory
 * 
 * @example
 * // Apply with default tier detection
 * app.use('/v1/*', rateLimiter());
 * 
 * @example
 * // Apply with custom tier for specific route
 * app.use('/v1/expensive', rateLimiter({ tier: 'models_recommend' }));
 * 
 * @example
 * // Apply with custom limits
 * app.use('/v1/special', rateLimiter({ windowSeconds: 300, maxRequests: 50 }));
 */
export const rateLimiter = (config: RateLimitConfig = {}) => {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const path = c.req.path;
    const method = c.req.method;
    
    // Skip rate limiting for certain paths
    if (shouldSkipRateLimiting(path)) {
      return await next();
    }
    
    let tier: RateLimitTier;
    let clientId = 'unknown';
    let clientType: 'user' | 'ip' | 'unknown' = 'unknown';

    try {
      // Determine rate limit tier
      tier = config.tier || getRateLimitTier(path, method);
      const tierConfig = RATE_LIMITS[tier];
      
      // Get client identifier
      const clientInfo = getClientIdentifier(c);
      clientId = clientInfo.id;
      clientType = clientInfo.type;
      
      // Apply stricter limits for unidentifiable clients
      const windowSeconds = config.windowSeconds || tierConfig.windowSeconds;
      let maxRequests = config.maxRequests || tierConfig.maxRequests;
      
      // Reduce limits for unknown clients (potential abuse)
      if (clientType === 'unknown') {
        maxRequests = Math.floor(maxRequests / 3);
      }
      
      // Increase limits for authenticated users (trusted)
      if (clientType === 'user') {
        maxRequests = Math.ceil(maxRequests * 1.5);
      }
      
      const keyPrefix = config.keyPrefix || 'ratelimit';
      const key = `${keyPrefix}:${tier}:${clientId}`;
      const now = Math.floor(Date.now() / 1000);
      const resetTime = Math.ceil((now + 1) / windowSeconds) * windowSeconds;
      
      // Get current rate limit data from KV
      const cacheData = await c.env.CACHE.get<RateLimitData>(key, 'json');
      
      let count = 0;
      if (cacheData && cacheData.resetAt > now) {
        count = cacheData.count;
      }
      
      // Check if rate limit exceeded
      if (count >= maxRequests) {
        const retryAfter = resetTime - now;
        const headers = createRateLimitHeaders(maxRequests, 0, resetTime, retryAfter);
        
        // Set all headers
        Object.entries(headers).forEach(([name, value]) => {
          c.header(name, value);
        });
        
        rateLimiterLogger.warn('Rate limit exceeded', {
          path,
          method,
          tier,
          clientType,
          count,
          limit: maxRequests,
          retryAfter,
        });
        
        return c.json(
          {
            error: 'Too Many Requests',
            message: `Rate limit exceeded for ${tier} tier. Please try again in ${retryAfter} seconds.`,
            code: 'RATE_LIMIT_EXCEEDED',
            tier,
            limit: maxRequests,
            retryAfter,
            resetAt: new Date(resetTime * 1000).toISOString(),
          },
          429
        );
      }
      
      // Increment counter
      await c.env.CACHE.put(
        key,
        JSON.stringify({
          count: count + 1,
          resetAt: resetTime,
        } as RateLimitData),
        { expirationTtl: windowSeconds }
      );
      
      // Add rate limit headers to response
      const headers = createRateLimitHeaders(maxRequests, maxRequests - count - 1, resetTime);
      Object.entries(headers).forEach(([name, value]) => {
        c.header(name, value);
      });
      
      // Continue to next middleware
      await next();
      
      // Log rate limit info for debugging (only when close to limit)
      if (count >= maxRequests * 0.8) {
        rateLimiterLogger.info('Rate limit warning', {
          path,
          method,
          tier,
          clientType,
          count: count + 1,
          limit: maxRequests,
          remaining: maxRequests - count - 1,
        });
      }
      
    } catch (error) {
      logError(error, {
        path,
        method,
        clientId,
        clientType,
        tier: tier!,
        component: 'rate-limiter',
      });
      
      // Allow the request to continue if there's an error with rate limiting
      // This prevents rate limiter failures from breaking the API
      await next();
    }
  };
};

/**
 * Create a rate limiter with specific tier configuration
 * Useful for applying consistent limits to route groups
 */
export const createTieredRateLimiter = (tier: RateLimitTier) => {
  return rateLimiter({ tier });
};

/**
 * Create a rate limiter for expensive operations
 * Use this for endpoints that perform complex computations
 */
export const createExpensiveOperationLimiter = (maxRequests = 10, windowSeconds = 60) => {
  return rateLimiter({
    maxRequests,
    windowSeconds,
    keyPrefix: 'expensive',
  });
};

export default rateLimiter;
