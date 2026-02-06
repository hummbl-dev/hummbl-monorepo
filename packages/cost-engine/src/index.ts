/**
 * @hummbl/cost-engine
 *
 * Cost optimization runtime for LLM routing with caching,
 * complexity routing, token budgets, and budget alerts.
 */

// Types
export * from './types.js';

// Config loader
export { createConfigLoader, getConfigLoader, loadConfigs } from './config-loader.js';

// Cache modules
export {
  createExactCache,
  generateCacheKey,
  createExactCacheEntry,
  shouldBypassCache,
} from './cache/exact-cache.js';

export {
  createSemanticCache,
  createSemanticCacheEntry,
  cosineSimilarity,
  simpleTextEmbedding,
} from './cache/semantic-cache.js';

export { createDeduplicator, type Deduplicator } from './cache/dedup.js';

// Routing modules
export {
  createComplexityClassifier,
  classifyComplexity,
  estimateTokenCount,
  type ComplexityClassifier,
} from './routing/complexity.js';

export {
  createPriorityClassifier,
  assignPriority,
  getTierWeight,
  compareTiers,
  type PriorityClassifier,
} from './routing/priority.js';

export {
  createTimeBasedRouter,
  routeByTime,
  getCurrentHour,
  isWeekend,
  type TimeBasedRouter,
} from './routing/time-based.js';

// Budget modules
export {
  createTokenTracker,
  loadTokenTracker,
  calculateCost,
  type TokenTrackerInstance,
} from './budgets/token-tracker.js';

export {
  createAlertEmitter,
  checkAndEmitAlerts,
  type AlertEmitterInstance,
} from './budgets/alerts.js';

// Metrics
export { createMetricsCollector, mergeCacheStats, type MetricsCollector } from './metrics.js';

// Middleware
export { createCostEngineMiddleware } from './middleware.js';

/**
 * Initialize the cost engine with default configuration
 */
export async function initializeCostEngine(configDir?: string) {
  const { loadConfigs } = await import('./config-loader.js');
  const { createCostEngineMiddleware } = await import('./middleware.js');

  const config = await loadConfigs(configDir);
  return createCostEngineMiddleware(config);
}
