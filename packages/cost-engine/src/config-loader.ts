/**
 * Config Loader
 *
 * Loads and validates all cost optimization configuration files.
 */

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Result, isErr } from '@hummbl/core';
import type { ConfigLoader, CostOptimizationConfig } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Default config directory path */
const DEFAULT_CONFIG_DIR = join(__dirname, '../../../../shared-hummbl-space/configs');

/** Config file mapping */
const CONFIG_FILES = {
  complexityRouter: 'complexity-router.json',
  tokenBudget: 'token-budget-policy.json',
  cachePolicy: 'cache-policy.json',
  timeBasedRouting: 'time-based-routing.json',
  priorityTiers: 'priority-tiers.json',
  budgetAlerts: 'budget-alerts.json',
  modelCosts: 'model-costs.json',
  retryPolicy: 'retry-policy.json',
  fallbackChain: 'fallback-chain.json',
  rateLimit: 'rate-limit.json',
} as const;

type ConfigKey = keyof typeof CONFIG_FILES;

/** Default configurations for fallback */
const DEFAULT_CONFIGS: CostOptimizationConfig = {
  complexityRouter: {
    rules: [],
    defaultModel: 'claude-sonnet-4',
    thresholds: { simple: 100, moderate: 500, complex: 2000 },
  },
  tokenBudget: {
    dailyLimit: 1000000,
    hourlyLimit: 100000,
    perRequestLimit: 32768,
    warningThreshold: 0.8,
    hardStopThreshold: 0.95,
    resetHour: 0,
    tierLimits: {
      critical: { dailyLimit: 500000, perRequestLimit: 65536, burstAllowance: 1.5 },
      high: { dailyLimit: 300000, perRequestLimit: 32768, burstAllowance: 1.2 },
      normal: { dailyLimit: 150000, perRequestLimit: 16384, burstAllowance: 1.0 },
      low: { dailyLimit: 40000, perRequestLimit: 8192, burstAllowance: 0.8 },
      batch: { dailyLimit: 10000, perRequestLimit: 4096, burstAllowance: 0.5 },
    },
  },
  cachePolicy: {
    enabled: true,
    exactMatch: { enabled: true, ttlSeconds: 3600, maxEntries: 10000 },
    semanticMatch: { enabled: false, similarityThreshold: 0.92, ttlSeconds: 1800, maxEntries: 5000 },
    deduplication: { enabled: true, windowMs: 5000 },
    bypassConditions: [],
  },
  timeBasedRouting: {
    enabled: false,
    timezone: 'UTC',
    peakHours: { start: 9, end: 17 },
    offPeakHours: { start: 22, end: 6 },
    peakModel: 'claude-haiku-3-5',
    offPeakModel: 'claude-opus-4',
    weekendModel: 'claude-sonnet-4',
  },
  priorityTiers: {
    rules: [],
    defaultTier: 'normal',
  },
  budgetAlerts: {
    enabled: true,
    channels: [{ type: 'console' }],
    thresholds: [
      { percent: 80, level: 'warning', message: 'Budget at 80%' },
      { percent: 95, level: 'critical', message: 'Budget at 95%' },
    ],
    cooldownMinutes: 15,
  },
  modelCosts: {
    models: {},
    defaultCost: { inputCostPer1k: 0.003, outputCostPer1k: 0.015, contextWindow: 100000 },
  },
  retryPolicy: {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    retryableErrors: ['RATE_LIMIT_EXCEEDED', 'SERVICE_UNAVAILABLE', 'TIMEOUT'],
  },
  fallbackChain: {
    chains: { default: ['claude-sonnet-4'] },
    timeout: 30000,
  },
  rateLimit: {
    enabled: false,
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    burstSize: 10,
  },
};

/**
 * Load a single config file
 */
async function loadConfigFile<T>(filePath: string): Promise<Result<T, Error>> {
  return Result.fromPromise(
    readFile(filePath, 'utf-8').then((content) => JSON.parse(content) as T),
    (error) => new Error(`Failed to load config ${filePath}: ${error}`)
  );
}

/**
 * Create a config loader instance
 */
export function createConfigLoader(configDir?: string): ConfigLoader {
  const dir = configDir ?? DEFAULT_CONFIG_DIR;
  let config: CostOptimizationConfig = { ...DEFAULT_CONFIGS };

  return {
    async load(): Promise<CostOptimizationConfig> {
      const loadedConfig: Partial<CostOptimizationConfig> = {};

      // Load each config file
      const loadResults = await Promise.all(
        (Object.entries(CONFIG_FILES) as [ConfigKey, string][]).map(async ([key, filename]) => {
          const filePath = join(dir, filename);
          const result = await loadConfigFile(filePath);
          return { key, result };
        })
      );

      // Process results
      for (const { key, result } of loadResults) {
        if (isErr(result)) {
          console.warn(`Using default for ${key}: ${result.error.message}`);
          continue;
        }
        (loadedConfig as Record<string, unknown>)[key] = result.value;
      }

      // Merge with defaults
      config = {
        complexityRouter: loadedConfig.complexityRouter ?? DEFAULT_CONFIGS.complexityRouter,
        tokenBudget: loadedConfig.tokenBudget ?? DEFAULT_CONFIGS.tokenBudget,
        cachePolicy: loadedConfig.cachePolicy ?? DEFAULT_CONFIGS.cachePolicy,
        timeBasedRouting: loadedConfig.timeBasedRouting ?? DEFAULT_CONFIGS.timeBasedRouting,
        priorityTiers: loadedConfig.priorityTiers ?? DEFAULT_CONFIGS.priorityTiers,
        budgetAlerts: loadedConfig.budgetAlerts ?? DEFAULT_CONFIGS.budgetAlerts,
        modelCosts: loadedConfig.modelCosts ?? DEFAULT_CONFIGS.modelCosts,
        retryPolicy: loadedConfig.retryPolicy ?? DEFAULT_CONFIGS.retryPolicy,
        fallbackChain: loadedConfig.fallbackChain ?? DEFAULT_CONFIGS.fallbackChain,
        rateLimit: loadedConfig.rateLimit ?? DEFAULT_CONFIGS.rateLimit,
      };

      return config;
    },

    async reload(): Promise<CostOptimizationConfig> {
      return this.load();
    },

    getConfig(): CostOptimizationConfig {
      return config;
    },
  };
}

/** Singleton config loader instance */
let defaultLoader: ConfigLoader | null = null;

/**
 * Get or create the default config loader
 */
export function getConfigLoader(configDir?: string): ConfigLoader {
  if (!defaultLoader) {
    defaultLoader = createConfigLoader(configDir);
  }
  return defaultLoader;
}

/**
 * Load configs using default loader
 */
export async function loadConfigs(configDir?: string): Promise<CostOptimizationConfig> {
  const loader = getConfigLoader(configDir);
  return loader.load();
}
