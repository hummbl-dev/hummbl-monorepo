import { Hono } from 'hono';
import { createLogger, logError } from '@hummbl/core';

// Create logger instance for analytics
const logger = createLogger('analytics');

const analytics = new Hono();

// Simple in-memory analytics (in production, use KV or D1)
const stats = {
  requests: [] as Array<{ endpoint: string; timestamp: number; userAgent?: string }>,
  modelAccess: new Map<string, number>(),
  searchQueries: new Map<string, number>(),
};

export function trackRequest(endpoint: string, userAgent?: string) {
  try {
    // Validate and sanitize inputs
    if (!endpoint || typeof endpoint !== 'string' || endpoint.length > 200) {
      logger.warn('Invalid endpoint for tracking', { context: 'analytics-invalid-endpoint', endpoint: endpoint?.substring(0, 100), timestamp: new Date().toISOString() });
      return;
    }

    const sanitizedEndpoint = endpoint.replace(/[<>"'&]/g, '').substring(0, 200);
    const sanitizedUserAgent =
      userAgent && typeof userAgent === 'string'
        ? userAgent.replace(/[<>"'&]/g, '').substring(0, 500)
        : undefined;

    stats.requests.push({
      endpoint: sanitizedEndpoint,
      timestamp: Date.now(),
      userAgent: sanitizedUserAgent,
    });

    // Keep only last 1000 requests to prevent memory leaks
    if (stats.requests.length > 1000) {
      stats.requests = stats.requests.slice(-1000);
    }
  } catch (error) {
    logError(error, { context: 'analytics-track-request', timestamp: new Date().toISOString() });
  }
}

export function trackModelAccess(modelId: string) {
  try {
    // Validate model ID format
    if (
      !modelId ||
      typeof modelId !== 'string' ||
      modelId.length === 0 ||
      modelId.length > 20 ||
      !/^[A-Z0-9]+$/.test(modelId)
    ) {
      logger.warn('Invalid model ID for tracking', { context: 'analytics-invalid-model-id', modelId: modelId?.substring(0, 50), timestamp: new Date().toISOString() });
      return;
    }

    const currentCount = stats.modelAccess.get(modelId) || 0;
    if (currentCount < 1000000) {
      // Prevent overflow
      stats.modelAccess.set(modelId, currentCount + 1);
    }

    // Prevent memory leaks by limiting map size
    if (stats.modelAccess.size > 10000) {
      const entries = Array.from(stats.modelAccess.entries());
      entries.sort(([, a], [, b]) => b - a);
      stats.modelAccess.clear();
      entries.slice(0, 5000).forEach(([key, value]) => {
        stats.modelAccess.set(key, value);
      });
    }
  } catch (error) {
    logError(error, { context: 'analytics-track-model', timestamp: new Date().toISOString() });
  }
}

export function trackSearch(query: string) {
  try {
    // Validate and sanitize query
    if (!query || typeof query !== 'string' || query.length > 200) {
      logger.warn('Invalid search query for tracking', { context: 'analytics-invalid-search', query: query?.substring(0, 100), timestamp: new Date().toISOString() });
      return;
    }

    const sanitizedQuery = query
      .replace(/[<>"'&]/g, '')
      .toLowerCase()
      .trim()
      .substring(0, 100);

    if (sanitizedQuery.length === 0) {
      return;
    }

    const currentCount = stats.searchQueries.get(sanitizedQuery) || 0;
    if (currentCount < 1000000) {
      // Prevent overflow
      stats.searchQueries.set(sanitizedQuery, currentCount + 1);
    }

    // Prevent memory leaks by limiting map size
    if (stats.searchQueries.size > 10000) {
      const entries = Array.from(stats.searchQueries.entries());
      entries.sort(([, a], [, b]) => b - a);
      stats.searchQueries.clear();
      entries.slice(0, 5000).forEach(([key, value]) => {
        stats.searchQueries.set(key, value);
      });
    }
  } catch (error) {
    logError(error, { context: 'analytics-track-search', timestamp: new Date().toISOString() });
  }
}

analytics.get('/stats', c => {
  try {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;

    let recentRequests: Array<{ endpoint: string; timestamp: number; userAgent?: string }> = [];
    try {
      recentRequests = stats.requests.filter(
        r => r && typeof r.timestamp === 'number' && r.timestamp > last24h && r.timestamp <= now
      );
    } catch (error) {
      logError(error, { context: 'analytics-filter-requests', timestamp: new Date().toISOString() });
      recentRequests = [];
    }

    const endpointCounts = new Map<string, number>();
    recentRequests.forEach(r => {
      if (r.endpoint && typeof r.endpoint === 'string') {
        const sanitizedEndpoint = r.endpoint.substring(0, 200);
        endpointCounts.set(sanitizedEndpoint, (endpointCounts.get(sanitizedEndpoint) || 0) + 1);
      }
    });

    let topModels: Array<[string, number]> = [];
    let topQueries: Array<[string, number]> = [];
    let topEndpoints: Array<[string, number]> = [];
    try {
      topModels = Array.from(stats.modelAccess.entries())
        .filter(([id, count]) => typeof id === 'string' && typeof count === 'number' && count > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      topQueries = Array.from(stats.searchQueries.entries())
        .filter(
          ([query, count]) => typeof query === 'string' && typeof count === 'number' && count > 0
        )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      topEndpoints = Array.from(endpointCounts.entries())
        .filter(
          ([endpoint, count]) =>
            typeof endpoint === 'string' && typeof count === 'number' && count > 0
        )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
    } catch (error) {
      logError(error, { context: 'analytics-process-data', timestamp: new Date().toISOString() });
      topModels = [];
      topQueries = [];
      topEndpoints = [];
    }

    // Sanitize response data
    const sanitizedResponse = {
      timeframe: '24 hours',
      totalRequests: Math.max(0, recentRequests.length),
      topModels: topModels.map(([id, count]) => ({
        id: String(id).substring(0, 20),
        count: Math.max(0, Math.min(1000000, Number(count))),
      })),
      topQueries: topQueries.map(([query, count]) => ({
        query: String(query).substring(0, 100),
        count: Math.max(0, Math.min(1000000, Number(count))),
      })),
      topEndpoints: topEndpoints.map(([endpoint, count]) => ({
        endpoint: String(endpoint).substring(0, 200),
        count: Math.max(0, Math.min(1000000, Number(count))),
      })),
      uniqueModelsAccessed: Math.max(0, stats.modelAccess.size),
      uniqueSearchQueries: Math.max(0, stats.searchQueries.size),
    };

    return c.json(sanitizedResponse);
  } catch (error) {
    logError(error, { context: 'analytics-stats-general', timestamp: new Date().toISOString() });
    return c.json(
      {
        error: 'Failed to retrieve analytics',
        timeframe: '24 hours',
        totalRequests: 0,
        topModels: [],
        topQueries: [],
        topEndpoints: [],
        uniqueModelsAccessed: 0,
        uniqueSearchQueries: 0,
      },
      500
    );
  }
});

analytics.get('/health', c => {
  try {
    // Cloudflare Workers don't have process.uptime(), use 0 as fallback
    const uptime = 0;

    const healthData = {
      status: 'healthy',
      uptime: Math.max(0, Number(uptime) || 0),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      analytics: {
        requestsTracked: stats.requests.length,
        modelsTracked: stats.modelAccess.size,
        queriesTracked: stats.searchQueries.size,
      },
    };

    return c.json(healthData);
  } catch (error) {
    logError(error, { context: 'analytics-health-check', timestamp: new Date().toISOString() });
    return c.json(
      {
        status: 'error',
        uptime: 0,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        error: 'Health check failed',
      },
      500
    );
  }
});

export default analytics;
