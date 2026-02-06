/**
 * Cost Engine Types
 *
 * Type definitions for cost optimization runtime including caching,
 * complexity routing, token budgets, and budget alerts.
 */

// ============================================================================
// Configuration Types
// ============================================================================

/** Complexity routing configuration */
export interface ComplexityRouterConfig {
  rules: ComplexityRule[];
  defaultModel: string;
  thresholds: {
    simple: number;
    moderate: number;
    complex: number;
  };
}

export interface ComplexityRule {
  pattern: string;
  taskType: string;
  complexity: ComplexityLevel;
  model: string;
  maxTokens?: number;
}

export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'expert';

/** Token budget policy configuration */
export interface TokenBudgetConfig {
  dailyLimit: number;
  hourlyLimit: number;
  perRequestLimit: number;
  warningThreshold: number;
  hardStopThreshold: number;
  resetHour: number; // Hour of day (0-23) for daily reset
  tierLimits: Record<PriorityTier, TierLimit>;
}

export interface TierLimit {
  dailyLimit: number;
  perRequestLimit: number;
  burstAllowance: number;
}

export type PriorityTier = 'critical' | 'high' | 'normal' | 'low' | 'batch';

/** Cache policy configuration */
export interface CachePolicyConfig {
  enabled: boolean;
  exactMatch: {
    enabled: boolean;
    ttlSeconds: number;
    maxEntries: number;
  };
  semanticMatch: {
    enabled: boolean;
    similarityThreshold: number;
    ttlSeconds: number;
    maxEntries: number;
  };
  deduplication: {
    enabled: boolean;
    windowMs: number;
  };
  bypassConditions: CacheBypassCondition[];
}

export interface CacheBypassCondition {
  type: 'task_type' | 'model' | 'header' | 'prompt_pattern';
  value: string;
}

/** Time-based routing configuration */
export interface TimeBasedRoutingConfig {
  enabled: boolean;
  timezone: string;
  peakHours: { start: number; end: number };
  offPeakHours: { start: number; end: number };
  peakModel: string;
  offPeakModel: string;
  weekendModel: string;
}

/** Priority tier configuration */
export interface PriorityTierConfig {
  rules: PriorityRule[];
  defaultTier: PriorityTier;
}

export interface PriorityRule {
  pattern: string;
  taskType?: string;
  source?: string;
  tier: PriorityTier;
}

/** Budget alert configuration */
export interface BudgetAlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: AlertThreshold[];
  cooldownMinutes: number;
}

export interface AlertChannel {
  type: 'file' | 'webhook' | 'console';
  target?: string;
}

export interface AlertThreshold {
  percent: number;
  level: AlertLevel;
  message: string;
}

export type AlertLevel = 'info' | 'warning' | 'critical' | 'emergency';

/** Model cost configuration */
export interface ModelCostConfig {
  models: Record<string, ModelCost>;
  defaultCost: ModelCost;
}

export interface ModelCost {
  inputCostPer1k: number;
  outputCostPer1k: number;
  contextWindow: number;
}

/** Retry policy configuration */
export interface RetryPolicyConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrors: string[];
}

/** Fallback chain configuration */
export interface FallbackChainConfig {
  chains: Record<string, string[]>;
  timeout: number;
}

/** Rate limiting configuration */
export interface RateLimitConfig {
  enabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  burstSize: number;
}

/** Combined cost optimization config */
export interface CostOptimizationConfig {
  complexityRouter: ComplexityRouterConfig;
  tokenBudget: TokenBudgetConfig;
  cachePolicy: CachePolicyConfig;
  timeBasedRouting: TimeBasedRoutingConfig;
  priorityTiers: PriorityTierConfig;
  budgetAlerts: BudgetAlertConfig;
  modelCosts: ModelCostConfig;
  retryPolicy: RetryPolicyConfig;
  fallbackChain: FallbackChainConfig;
  rateLimit: RateLimitConfig;
}

// ============================================================================
// Runtime Types
// ============================================================================

/** Request context for cost decisions */
export interface CostRequestContext {
  prompt: string;
  model?: string;
  taskType?: string;
  source?: string;
  priority?: PriorityTier;
  headers?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

/** Cost decision returned by middleware */
export interface CostDecision {
  action: 'proceed' | 'cache_hit' | 'reject' | 'throttle';
  model: string;
  complexity: ComplexityLevel;
  priority: PriorityTier;
  cacheKey?: string;
  cachedResponse?: CachedResponse;
  reason?: string;
  estimatedCost?: number;
  budgetRemaining?: number;
  warnings?: string[];
}

/** Post-request context for recording usage */
export interface PostRequestContext {
  requestId: string;
  model: string;
  taskType?: string;
  priority: PriorityTier;
  cacheKey?: string;
  startTime: number;
}

/** Token usage for recording */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/** Response data for caching */
export interface ResponseData {
  content: string;
  model: string;
  finishReason?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Cache Types
// ============================================================================

/** Base cache entry */
interface BaseCacheEntry {
  key: string;
  response: CachedResponse;
  createdAt: number;
  expiresAt: number;
  hitCount: number;
  lastAccessedAt: number;
}

/** Exact match cache entry */
export interface ExactCacheEntry extends BaseCacheEntry {
  type: 'exact';
  hash: string;
}

/** Semantic cache entry with embedding */
export interface SemanticCacheEntry extends BaseCacheEntry {
  type: 'semantic';
  embedding?: number[];
  similarity?: number;
}

export type CacheEntry = ExactCacheEntry | SemanticCacheEntry;

/** Cached response */
export interface CachedResponse {
  content: string;
  model: string;
  tokenUsage: TokenUsage;
  metadata?: Record<string, unknown>;
}

/** Cache lookup result */
export interface CacheLookupResult {
  hit: boolean;
  entry?: CacheEntry;
  source?: 'exact' | 'semantic';
}

/** Cache statistics */
export interface CacheStats {
  exactHits: number;
  exactMisses: number;
  semanticHits: number;
  semanticMisses: number;
  totalEntries: number;
  memoryUsageBytes: number;
}

// ============================================================================
// Budget Types
// ============================================================================

/** Token usage record */
export interface TokenUsageRecord {
  timestamp: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  taskType?: string;
  priority: PriorityTier;
}

/** Budget status */
export interface BudgetStatus {
  dailyUsed: number;
  dailyLimit: number;
  dailyRemaining: number;
  dailyPercent: number;
  hourlyUsed: number;
  hourlyLimit: number;
  hourlyRemaining: number;
  hourlyPercent: number;
  isWarning: boolean;
  isHardStop: boolean;
  alerts: BudgetAlert[];
}

/** Budget alert */
export interface BudgetAlert {
  id: string;
  level: AlertLevel;
  message: string;
  timestamp: number;
  percent: number;
  acknowledged: boolean;
}

// ============================================================================
// Metrics Types
// ============================================================================

/** Cost metrics */
export interface CostMetrics {
  timestamp: number;
  period: 'hourly' | 'daily' | 'weekly';
  totalRequests: number;
  cacheHitRate: number;
  avgComplexity: number;
  totalTokens: number;
  totalCost: number;
  byModel: Record<string, ModelMetrics>;
  byTaskType: Record<string, number>;
  byPriority: Record<PriorityTier, number>;
}

export interface ModelMetrics {
  requests: number;
  tokens: number;
  cost: number;
  avgLatency: number;
}

// ============================================================================
// Middleware Types
// ============================================================================

/** Cost engine middleware interface */
export interface CostEngineMiddleware {
  preRequest(context: CostRequestContext): Promise<CostDecision>;
  postRequest(
    context: PostRequestContext,
    response: ResponseData,
    usage: TokenUsage
  ): Promise<void>;
  getStats(): CacheStats;
  getBudgetStatus(): BudgetStatus;
  resetCache(): void;
}

/** Config loader interface */
export interface ConfigLoader {
  load(): Promise<CostOptimizationConfig>;
  reload(): Promise<CostOptimizationConfig>;
  getConfig(): CostOptimizationConfig;
}

/** Cache interface */
export interface Cache {
  get(key: string): CacheEntry | undefined;
  set(key: string, entry: CacheEntry): void;
  delete(key: string): boolean;
  clear(): void;
  getStats(): CacheStats;
  prune(): number;
}

/** Token tracker interface */
export interface TokenTracker {
  record(usage: TokenUsageRecord): void;
  getDailyUsage(): number;
  getHourlyUsage(): number;
  checkBudget(estimatedTokens: number): BudgetStatus;
  reset(): void;
}

/** Alert emitter interface */
export interface AlertEmitter {
  emit(alert: BudgetAlert): Promise<void>;
  getAlerts(): BudgetAlert[];
  acknowledge(alertId: string): void;
  clearAlerts(): void;
}
