/**
 * Cost Engine Middleware
 *
 * Main integration point that orchestrates all cost optimization components.
 */

import type {
  CostEngineMiddleware,
  CostRequestContext,
  CostDecision,
  PostRequestContext,
  ResponseData,
  TokenUsage,
  CacheStats,
  BudgetStatus,
  CostOptimizationConfig,
  CachedResponse,
  TokenUsageRecord,
} from './types.js';

import {
  createExactCache,
  generateCacheKey,
  createExactCacheEntry,
  shouldBypassCache,
} from './cache/exact-cache.js';
import {
  createSemanticCache,
  createSemanticCacheEntry,
  simpleTextEmbedding,
} from './cache/semantic-cache.js';
import { createDeduplicator } from './cache/dedup.js';
import { createComplexityClassifier } from './routing/complexity.js';
import { createPriorityClassifier } from './routing/priority.js';
import { createTimeBasedRouter } from './routing/time-based.js';
import { createTokenTracker, calculateCost } from './budgets/token-tracker.js';
import { createAlertEmitter, checkAndEmitAlerts } from './budgets/alerts.js';
import { createMetricsCollector } from './metrics.js';

/**
 * Create the cost engine middleware
 */
export function createCostEngineMiddleware(
  config: CostOptimizationConfig
): CostEngineMiddleware {
  // Initialize components
  const exactCache = createExactCache(config.cachePolicy.exactMatch);
  const semanticCache = createSemanticCache(config.cachePolicy.semanticMatch);
  const deduplicator = createDeduplicator(config.cachePolicy.deduplication.windowMs);
  const complexityClassifier = createComplexityClassifier(config.complexityRouter);
  const priorityClassifier = createPriorityClassifier(config.priorityTiers);
  const timeBasedRouter = createTimeBasedRouter(config.timeBasedRouting);
  const tokenTracker = createTokenTracker(config.tokenBudget, config.modelCosts);
  const alertEmitter = createAlertEmitter(config.budgetAlerts);
  const metricsCollector = createMetricsCollector();

  return {
    async preRequest(context: CostRequestContext): Promise<CostDecision> {
      const warnings: string[] = [];
      const { prompt, model: requestedModel, taskType, headers } = context;

      // Step 1: Check cache bypass conditions
      const shouldBypass = shouldBypassCache(
        prompt,
        taskType,
        headers,
        config.cachePolicy.bypassConditions
      );

      // Step 2: Check exact cache (if not bypassing)
      if (config.cachePolicy.enabled && config.cachePolicy.exactMatch.enabled && !shouldBypass) {
        const cacheKey = generateCacheKey(prompt, requestedModel ?? config.complexityRouter.defaultModel);
        const cachedEntry = exactCache.get(cacheKey);

        if (cachedEntry) {
          return {
            action: 'cache_hit',
            model: cachedEntry.response.model,
            complexity: 'simple', // Cached responses don't need complexity
            priority: context.priority ?? 'normal',
            cacheKey,
            cachedResponse: cachedEntry.response,
            reason: 'Exact cache hit',
          };
        }
      }

      // Step 3: Check semantic cache (if enabled and not bypassing)
      if (
        config.cachePolicy.enabled &&
        config.cachePolicy.semanticMatch.enabled &&
        !shouldBypass
      ) {
        const queryEmbedding = simpleTextEmbedding(prompt);
        const semanticMatch = semanticCache.findSimilar(queryEmbedding);

        if (semanticMatch) {
          return {
            action: 'cache_hit',
            model: semanticMatch.response.model,
            complexity: 'simple',
            priority: context.priority ?? 'normal',
            cacheKey: semanticMatch.key,
            cachedResponse: semanticMatch.response,
            reason: `Semantic cache hit (similarity: ${semanticMatch.similarity?.toFixed(2)})`,
          };
        }
      }

      // Step 4: Classify complexity
      const complexityResult = complexityClassifier.classify(context);
      let selectedModel = complexityResult.model;

      // Step 5: Apply time-based routing (may override model)
      if (config.timeBasedRouting.enabled) {
        const timeResult = timeBasedRouter.route();

        // Only override if complexity allows
        if (
          complexityResult.level === 'simple' ||
          complexityResult.level === 'moderate'
        ) {
          selectedModel = timeResult.model;
          warnings.push(`Time-based routing: ${timeResult.reason}`);
        }
      }

      // Step 6: Use requested model if provided and appropriate
      if (requestedModel) {
        if (complexityClassifier.isModelAppropriate(requestedModel, complexityResult.level)) {
          selectedModel = requestedModel;
        } else {
          warnings.push(
            `Requested model "${requestedModel}" may be insufficient for ${complexityResult.level} complexity`
          );
        }
      }

      // Step 7: Assign priority
      const priorityResult = priorityClassifier.assign(context);

      // Step 8: Estimate tokens and check budget
      const estimatedTokens = Math.ceil(prompt.length / 4) * 2; // Rough estimate: input + output
      const budgetStatus = tokenTracker.checkBudget(estimatedTokens);

      // Step 9: Handle budget warnings and hard stops
      if (budgetStatus.isHardStop) {
        await checkAndEmitAlerts(alertEmitter, budgetStatus.dailyPercent * 100, config.budgetAlerts);

        return {
          action: 'reject',
          model: selectedModel,
          complexity: complexityResult.level,
          priority: priorityResult.tier,
          reason: 'Budget hard stop reached',
          budgetRemaining: budgetStatus.dailyRemaining,
          warnings: [...warnings, ...budgetStatus.alerts.map((a) => a.message)],
        };
      }

      if (budgetStatus.isWarning) {
        await checkAndEmitAlerts(alertEmitter, budgetStatus.dailyPercent * 100, config.budgetAlerts);
        warnings.push(...budgetStatus.alerts.map((a) => a.message));
      }

      // Step 10: Calculate estimated cost
      const modelCost = config.modelCosts.models[selectedModel] ?? config.modelCosts.defaultCost;
      const estimatedCost =
        (estimatedTokens / 1000) * (modelCost.inputCostPer1k + modelCost.outputCostPer1k) / 2;

      // Generate cache key for post-request caching
      const cacheKey = generateCacheKey(prompt, selectedModel);

      return {
        action: 'proceed',
        model: selectedModel,
        complexity: complexityResult.level,
        priority: priorityResult.tier,
        cacheKey,
        reason: complexityResult.reason,
        estimatedCost,
        budgetRemaining: budgetStatus.dailyRemaining,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    },

    async postRequest(
      context: PostRequestContext,
      response: ResponseData,
      usage: TokenUsage
    ): Promise<void> {
      const { model, taskType, priority, cacheKey } = context;
      const latencyMs = Date.now() - context.startTime;

      // Calculate cost
      const cost = calculateCost(
        usage.inputTokens,
        usage.outputTokens,
        model,
        config.modelCosts
      );

      // Record token usage
      const usageRecord: TokenUsageRecord = {
        timestamp: Date.now(),
        model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cost,
        taskType,
        priority,
      };
      tokenTracker.record(usageRecord);

      // Cache response if enabled
      if (config.cachePolicy.enabled && cacheKey) {
        const cachedResponse: CachedResponse = {
          content: response.content,
          model: response.model,
          tokenUsage: usage,
          metadata: response.metadata,
        };

        // Add to exact cache
        if (config.cachePolicy.exactMatch.enabled) {
          const entry = createExactCacheEntry(
            '', // Key is already computed
            model,
            cachedResponse,
            config.cachePolicy.exactMatch.ttlSeconds
          );
          entry.key = cacheKey;
          entry.hash = cacheKey;
          exactCache.set(cacheKey, entry);
        }

        // Add to semantic cache
        if (config.cachePolicy.semanticMatch.enabled) {
          // We need the original prompt for semantic caching
          // This is a limitation - in production, you'd pass the prompt through context
          const semanticEntry = createSemanticCacheEntry(
            response.content.substring(0, 500), // Use response as proxy
            cachedResponse,
            config.cachePolicy.semanticMatch.ttlSeconds
          );
          semanticCache.set(semanticEntry.key, semanticEntry);
        }
      }

      // Record metrics
      metricsCollector.record({
        timestamp: Date.now(),
        model,
        tokens: usage.totalTokens,
        cost,
        latencyMs,
        taskType,
        priority,
        cacheHit: false,
        complexity: 'moderate', // Would need to pass through from pre-request
      });
    },

    getStats(): CacheStats {
      const exactStats = exactCache.getStats();
      const semanticStats = semanticCache.getStats();

      return {
        exactHits: exactStats.exactHits,
        exactMisses: exactStats.exactMisses,
        semanticHits: semanticStats.semanticHits,
        semanticMisses: semanticStats.semanticMisses,
        totalEntries: exactStats.totalEntries + semanticStats.totalEntries,
        memoryUsageBytes: exactStats.memoryUsageBytes + semanticStats.memoryUsageBytes,
      };
    },

    getBudgetStatus(): BudgetStatus {
      return tokenTracker.checkBudget(0);
    },

    resetCache(): void {
      exactCache.clear();
      semanticCache.clear();
      deduplicator.clear();
    },
  };
}
