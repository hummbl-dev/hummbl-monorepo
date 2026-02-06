/**
 * Token Tracker
 *
 * Tracks token usage against configured budgets.
 */

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  TokenTracker,
  TokenUsageRecord,
  BudgetStatus,
  BudgetAlert,
  TokenBudgetConfig,
  ModelCostConfig,
} from '../types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_STATE_DIR = join(__dirname, '../../../../../_state/tokens');

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getDateString(date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get current hour
 */
function getCurrentHour(): number {
  return new Date().getHours();
}

/**
 * Calculate cost for token usage
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string,
  modelCosts: ModelCostConfig
): number {
  const costs = modelCosts.models[model] ?? modelCosts.defaultCost;
  const inputCost = (inputTokens / 1000) * costs.inputCostPer1k;
  const outputCost = (outputTokens / 1000) * costs.outputCostPer1k;
  return inputCost + outputCost;
}

/**
 * Create a token tracker
 */
export function createTokenTracker(
  budgetConfig: TokenBudgetConfig,
  _modelCosts: ModelCostConfig,
  stateDir = DEFAULT_STATE_DIR
): TokenTracker & {
  getRecords(): TokenUsageRecord[];
  persist(): Promise<void>;
} {
  const records: TokenUsageRecord[] = [];
  let lastResetDate = getDateString();
  /**
   * Check if daily reset is needed
   */
  function checkDailyReset(): void {
    const today = getDateString();
    const currentHour = getCurrentHour();

    // Reset if:
    // 1. It's a new day AND past reset hour
    // 2. OR it's the same day but we've passed reset hour since last check
    if (today !== lastResetDate && currentHour >= budgetConfig.resetHour) {
      // Filter out records from before today's reset
      const resetTime = new Date();
      resetTime.setHours(budgetConfig.resetHour, 0, 0, 0);

      records.length = 0; // Clear for new day
      lastResetDate = today;
    }
  }

  /**
   * Get usage for time period
   */
  function getUsageForPeriod(periodMs: number): number {
    checkDailyReset();
    const cutoff = Date.now() - periodMs;
    return records
      .filter((r) => r.timestamp >= cutoff)
      .reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);
  }

  return {
    record(usage: TokenUsageRecord): void {
      checkDailyReset();
      records.push(usage);
    },

    getDailyUsage(): number {
      checkDailyReset();

      // Get start of day (at reset hour)
      const resetTime = new Date();
      resetTime.setHours(budgetConfig.resetHour, 0, 0, 0);

      return records
        .filter((r) => r.timestamp >= resetTime.getTime())
        .reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);
    },

    getHourlyUsage(): number {
      return getUsageForPeriod(60 * 60 * 1000); // 1 hour in ms
    },

    checkBudget(_estimatedTokens: number): BudgetStatus {
      checkDailyReset();

      const dailyUsed = this.getDailyUsage();
      const hourlyUsed = this.getHourlyUsage();

      const dailyRemaining = budgetConfig.dailyLimit - dailyUsed;
      const hourlyRemaining = budgetConfig.hourlyLimit - hourlyUsed;

      const dailyPercent = dailyUsed / budgetConfig.dailyLimit;
      const hourlyPercent = hourlyUsed / budgetConfig.hourlyLimit;

      const isWarning =
        dailyPercent >= budgetConfig.warningThreshold ||
        hourlyPercent >= budgetConfig.warningThreshold;

      const isHardStop =
        dailyPercent >= budgetConfig.hardStopThreshold ||
        hourlyPercent >= budgetConfig.hardStopThreshold;

      // Generate alerts based on thresholds
      const alerts: BudgetAlert[] = [];

      if (dailyPercent >= 0.95) {
        alerts.push({
          id: `daily-95-${Date.now()}`,
          level: 'emergency',
          message: 'Daily budget at 95% - hard stop imminent',
          timestamp: Date.now(),
          percent: dailyPercent * 100,
          acknowledged: false,
        });
      } else if (dailyPercent >= 0.9) {
        alerts.push({
          id: `daily-90-${Date.now()}`,
          level: 'critical',
          message: 'Daily budget at 90% - reduce usage',
          timestamp: Date.now(),
          percent: dailyPercent * 100,
          acknowledged: false,
        });
      } else if (dailyPercent >= 0.75) {
        alerts.push({
          id: `daily-75-${Date.now()}`,
          level: 'warning',
          message: 'Daily budget at 75% - approaching limit',
          timestamp: Date.now(),
          percent: dailyPercent * 100,
          acknowledged: false,
        });
      }

      return {
        dailyUsed,
        dailyLimit: budgetConfig.dailyLimit,
        dailyRemaining,
        dailyPercent,
        hourlyUsed,
        hourlyLimit: budgetConfig.hourlyLimit,
        hourlyRemaining,
        hourlyPercent,
        isWarning,
        isHardStop,
        alerts,
      };
    },

    reset(): void {
      records.length = 0;
      lastResetDate = getDateString();
    },

    getRecords(): TokenUsageRecord[] {
      return [...records];
    },

    async persist(): Promise<void> {
      try {
        if (!existsSync(stateDir)) {
          await mkdir(stateDir, { recursive: true });
        }

        const filePath = join(stateDir, `${getDateString()}.jsonl`);
        const content = records.map((r) => JSON.stringify(r)).join('\n');
        await writeFile(filePath, content, 'utf-8');
      } catch (error) {
        console.warn('Failed to persist token usage:', error);
      }
    },
  };
}

/**
 * Load token tracker from persisted state
 */
export async function loadTokenTracker(
  budgetConfig: TokenBudgetConfig,
  modelCosts: ModelCostConfig,
  stateDir = DEFAULT_STATE_DIR
): Promise<ReturnType<typeof createTokenTracker>> {
  const tracker = createTokenTracker(budgetConfig, modelCosts, stateDir);

  try {
    const filePath = join(stateDir, `${getDateString()}.jsonl`);
    if (existsSync(filePath)) {
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim());

      for (const line of lines) {
        try {
          const record = JSON.parse(line) as TokenUsageRecord;
          tracker.record(record);
        } catch {
          // Skip invalid lines
        }
      }
    }
  } catch {
    // Start fresh if load fails
  }

  return tracker;
}

export type TokenTrackerInstance = ReturnType<typeof createTokenTracker>;
