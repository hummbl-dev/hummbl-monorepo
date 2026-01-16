/**
 * Global Rate Limiting Middleware
 * Provides tiered rate limiting for different endpoints
 */

import type { Context, Next } from 'hono';
import type { Env } from '../env';
import { createLogger, logError } from '@hummbl/core';

// Rate limiting configurations for different endpoint types
const RATE_LIMITS = {
  // Authentication endpoints (most restrictive)
  auth: {
    windowSeconds: 60,
    maxRequests: 10,
  },
  // Model and transformation queries (moderate)
  api: {
    windowSeconds: 60,
    maxRequests: 60,
  },
  // Health checks and static content (least restrictive)
  public: {
    windowSeconds: 60,
    maxRequests: 120,
  },
} as const;

interface RateLimitData {
  count: number;
  resetAt: number;
}

/**
 * Determines the rate limit tier based on the request path
 */
function getRateLimitTier(path: string): keyof typeof RATE_LIMITS {
  if (path.startsWith('/v1/auth')) {
    return 'auth';
  }
  if (path.startsWith('/v1/') || path.startsWith('/api/')) {
    return 'api';
  }
  return 'public';
}

/**
 * Global rate limiting middleware
 */
// const rateLimiterLogger = createLogger('rate-limiter'); // TODO: Use for rate limiting logs

export const rateLimiter = () => {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    let tier: keyof typeof RATE_LIMITS = 'public';
    let ip = 'unknown';

    try {
      // Skip rate limiting for certain paths if needed
      const path = c.req.path;

      // Get rate limit configuration for this endpoint
      tier = getRateLimitTier(path);
      const config = RATE_LIMITS[tier];

      // Only trust CF-Connecting-IP from Cloudflare to prevent IP spoofing
      const cfIP = c.req.header('CF-Connecting-IP');
      ip = cfIP && /^[0-9a-f.:]+$/i.test(cfIP) ? cfIP : 'unknown';

      // If no valid CF IP, use a more restrictive rate limit
      const isValidIP = ip !== 'unknown';
      const maxRequests = isValidIP
        ? config.maxRequests
        : Math.floor(config.maxRequests / 2);

      const key = `global_rate_limit:${tier}:${ip}`;
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const resetTime = Math.ceil((now + 1) / config.windowSeconds) * config.windowSeconds;

      // Get current count and reset time
      const cacheData = await c.env.CACHE.get<RateLimitData>(key, 'json');

      let count = 0;
      if (cacheData && cacheData.resetAt > now) {
        count = cacheData.count;
      }

      // Check if rate limit exceeded
      if (count >= maxRequests) {
        const retryAfter = resetTime - now;
        c.status(429);
        c.header('Retry-After', retryAfter.toString());
        c.header('X-RateLimit-Limit', maxRequests.toString());
        c.header('X-RateLimit-Remaining', '0');
        c.header('X-RateLimit-Reset', resetTime.toString());

        return c.json({
          error: 'Too many requests, please try again later',
          retryAfter,
          limit: maxRequests,
          tier
        });
      }

      // Increment counter
      await c.env.CACHE.put(
        key,
        JSON.stringify({
          count: count + 1,
          resetAt: resetTime,
        } as RateLimitData),
        { expirationTtl: config.windowSeconds }
      );

      // Add rate limit headers
      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', (maxRequests - count - 1).toString());
      c.header('X-RateLimit-Reset', resetTime.toString());

      // Continue to next middleware
      return await next();
    } catch (error) {
      logError(error, {
        path: c.req.path,
        ip,
        tier,
        component: 'rate-limiter'
      });
      // Allow the request to continue if there's an error with rate limiting
      return await next();
    }
  };
};