/**
 * Metrics Writer
 *
 * Collects and persists cost metrics.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CostMetrics, ModelMetrics, PriorityTier, CacheStats } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_METRICS_DIR = join(__dirname, '../../../../_state/cost');

interface MetricRecord {
  timestamp: number;
  model: string;
  tokens: number;
  cost: number;
  latencyMs: number;
  taskType?: string;
  priority: PriorityTier;
  cacheHit: boolean;
  complexity: string;
}

/**
 * Create a metrics collector
 */
export function createMetricsCollector(metricsDir = DEFAULT_METRICS_DIR) {
  const records: MetricRecord[] = [];

  return {
    /**
     * Record a metric
     */
    record(metric: MetricRecord): void {
      records.push(metric);
    },

    /**
     * Get aggregated metrics for a time period
     */
    getMetrics(periodMs: number): CostMetrics {
      const cutoff = Date.now() - periodMs;
      const periodRecords = records.filter((r) => r.timestamp >= cutoff);

      const byModel: Record<string, ModelMetrics> = {};
      const byTaskType: Record<string, number> = {};
      const byPriority: Record<PriorityTier, number> = {
        critical: 0,
        high: 0,
        normal: 0,
        low: 0,
        batch: 0,
      };

      let totalTokens = 0;
      let totalCost = 0;
      let cacheHits = 0;
      let complexitySum = 0;

      const complexityValues: Record<string, number> = {
        simple: 1,
        moderate: 2,
        complex: 3,
        expert: 4,
      };

      for (const record of periodRecords) {
        // Aggregate by model
        if (!byModel[record.model]) {
          byModel[record.model] = {
            requests: 0,
            tokens: 0,
            cost: 0,
            avgLatency: 0,
          };
        }
        byModel[record.model].requests++;
        byModel[record.model].tokens += record.tokens;
        byModel[record.model].cost += record.cost;
        byModel[record.model].avgLatency += record.latencyMs;

        // Aggregate by task type
        if (record.taskType) {
          byTaskType[record.taskType] = (byTaskType[record.taskType] ?? 0) + 1;
        }

        // Aggregate by priority
        byPriority[record.priority]++;

        // Totals
        totalTokens += record.tokens;
        totalCost += record.cost;
        if (record.cacheHit) cacheHits++;
        complexitySum += complexityValues[record.complexity] ?? 2;
      }

      // Calculate averages
      for (const model of Object.keys(byModel)) {
        const metrics = byModel[model];
        if (metrics.requests > 0) {
          metrics.avgLatency = metrics.avgLatency / metrics.requests;
        }
      }

      const totalRequests = periodRecords.length;

      return {
        timestamp: Date.now(),
        period: periodMs <= 3600000 ? 'hourly' : periodMs <= 86400000 ? 'daily' : 'weekly',
        totalRequests,
        cacheHitRate: totalRequests > 0 ? cacheHits / totalRequests : 0,
        avgComplexity: totalRequests > 0 ? complexitySum / totalRequests : 0,
        totalTokens,
        totalCost,
        byModel,
        byTaskType,
        byPriority,
      };
    },

    /**
     * Persist metrics to file
     */
    async persist(): Promise<void> {
      try {
        if (!existsSync(metricsDir)) {
          await mkdir(metricsDir, { recursive: true });
        }

        const date = new Date().toISOString().split('T')[0];
        const filePath = join(metricsDir, `metrics-${date}.jsonl`);

        const content = records.map((r) => JSON.stringify(r)).join('\n');
        await writeFile(filePath, content, { flag: 'a' });

        // Clear in-memory records after persisting
        records.length = 0;
      } catch (error) {
        console.warn('Failed to persist metrics:', error);
      }
    },

    /**
     * Get current record count
     */
    getRecordCount(): number {
      return records.length;
    },

    /**
     * Clear all records
     */
    clear(): void {
      records.length = 0;
    },
  };
}

/**
 * Merge cache stats into metrics
 */
export function mergeCacheStats(metrics: CostMetrics, cacheStats: CacheStats): CostMetrics {
  const totalCacheRequests =
    cacheStats.exactHits +
    cacheStats.exactMisses +
    cacheStats.semanticHits +
    cacheStats.semanticMisses;

  const totalHits = cacheStats.exactHits + cacheStats.semanticHits;

  return {
    ...metrics,
    cacheHitRate: totalCacheRequests > 0 ? totalHits / totalCacheRequests : metrics.cacheHitRate,
  };
}

export type MetricsCollector = ReturnType<typeof createMetricsCollector>;
