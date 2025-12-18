import { Hono } from 'hono';

const analytics = new Hono();

// Simple in-memory analytics (in production, use KV or D1)
const stats = {
  requests: [] as Array<{ endpoint: string; timestamp: number; userAgent?: string }>,
  modelAccess: new Map<string, number>(),
  searchQueries: new Map<string, number>(),
};

export function trackRequest(endpoint: string, userAgent?: string) {
  stats.requests.push({ endpoint, timestamp: Date.now(), userAgent });

  // Keep only last 1000 requests
  if (stats.requests.length > 1000) {
    stats.requests = stats.requests.slice(-1000);
  }
}

export function trackModelAccess(modelId: string) {
  stats.modelAccess.set(modelId, (stats.modelAccess.get(modelId) || 0) + 1);
}

export function trackSearch(query: string) {
  const normalizedQuery = query.toLowerCase().trim();
  stats.searchQueries.set(normalizedQuery, (stats.searchQueries.get(normalizedQuery) || 0) + 1);
}

analytics.get('/stats', c => {
  const now = Date.now();
  const last24h = now - 24 * 60 * 60 * 1000;
  const recentRequests = stats.requests.filter(r => r.timestamp > last24h);

  const endpointCounts = new Map<string, number>();
  recentRequests.forEach(r => {
    endpointCounts.set(r.endpoint, (endpointCounts.get(r.endpoint) || 0) + 1);
  });

  const topModels = Array.from(stats.modelAccess.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topQueries = Array.from(stats.searchQueries.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topEndpoints = Array.from(endpointCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return c.json({
    timeframe: '24 hours',
    totalRequests: recentRequests.length,
    topModels: topModels.map(([id, count]) => ({ id, count })),
    topQueries: topQueries.map(([query, count]) => ({ query, count })),
    topEndpoints: topEndpoints.map(([endpoint, count]) => ({ endpoint, count })),
    uniqueModelsAccessed: stats.modelAccess.size,
    uniqueSearchQueries: stats.searchQueries.size,
  });
});

analytics.get('/health', c => {
  return c.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default analytics;
