// Tests for performance metrics

import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordMetric,
  getMetrics,
  getMetricsByCategory,
  getMetricsByName,
  getAverageMetric,
  getPercentile,
  getPerformanceReport,
  getPerformanceGrade,
  clearMetrics,
} from '../performanceMetrics';

describe('Performance Metrics', () => {
  beforeEach(() => {
    clearMetrics();
  });

  describe('recordMetric', () => {
    it('records a metric', () => {
      recordMetric('test_metric', 100, 'ms', 'timing');

      const metrics = getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test_metric');
      expect(metrics[0].value).toBe(100);
      expect(metrics[0].unit).toBe('ms');
      expect(metrics[0].category).toBe('timing');
    });

    it('records multiple metrics', () => {
      recordMetric('metric1', 100, 'ms', 'timing');
      recordMetric('metric2', 200, 'kb', 'size');
      recordMetric('metric3', 5, 'count', 'count');

      const metrics = getMetrics();
      expect(metrics).toHaveLength(3);
    });
  });

  describe('getMetricsByCategory', () => {
    it('filters metrics by category', () => {
      recordMetric('metric1', 100, 'ms', 'timing');
      recordMetric('metric2', 200, 'kb', 'size');
      recordMetric('metric3', 150, 'ms', 'timing');

      const timingMetrics = getMetricsByCategory('timing');
      expect(timingMetrics).toHaveLength(2);
      expect(timingMetrics.every((m) => m.category === 'timing')).toBe(true);
    });
  });

  describe('getMetricsByName', () => {
    it('filters metrics by name', () => {
      recordMetric('page_load', 1000, 'ms', 'timing');
      recordMetric('page_load', 1200, 'ms', 'timing');
      recordMetric('render_time', 50, 'ms', 'timing');

      const pageLoadMetrics = getMetricsByName('page_load');
      expect(pageLoadMetrics).toHaveLength(2);
      expect(pageLoadMetrics.every((m) => m.name === 'page_load')).toBe(true);
    });
  });

  describe('getAverageMetric', () => {
    it('calculates average for a metric', () => {
      recordMetric('test', 100, 'ms', 'timing');
      recordMetric('test', 200, 'ms', 'timing');
      recordMetric('test', 150, 'ms', 'timing');

      const avg = getAverageMetric('test');
      expect(avg).toBe(150);
    });

    it('returns 0 for non-existent metric', () => {
      const avg = getAverageMetric('nonexistent');
      expect(avg).toBe(0);
    });
  });

  describe('getPercentile', () => {
    it('calculates percentile correctly', () => {
      // Add metrics: 10, 20, 30, 40, 50
      [10, 20, 30, 40, 50].forEach((value) => {
        recordMetric('test', value, 'ms', 'timing');
      });

      const p50 = getPercentile('test', 50);
      expect(p50).toBe(30);

      const p90 = getPercentile('test', 90);
      expect(p90).toBeGreaterThanOrEqual(40);
    });

    it('returns 0 for non-existent metric', () => {
      const p50 = getPercentile('nonexistent', 50);
      expect(p50).toBe(0);
    });
  });

  describe('getPerformanceReport', () => {
    it('generates performance report', () => {
      recordMetric('page_load', 2000, 'ms', 'timing');
      recordMetric('render_time', 100, 'ms', 'timing');
      recordMetric('data_fetch', 300, 'ms', 'timing');
      recordMetric('cache_hit', 1, 'count', 'count');
      recordMetric('cache_miss', 1, 'count', 'count');

      const report = getPerformanceReport();

      expect(report.metrics.length).toBeGreaterThan(0);
      expect(report.summary.avgLoadTime).toBe(2000);
      expect(report.summary.avgRenderTime).toBe(100);
      expect(report.summary.totalDataFetches).toBe(1);
      expect(report.summary.cacheHitRate).toBe(0.5);
    });

    it('handles empty metrics', () => {
      const report = getPerformanceReport();

      expect(report.metrics).toHaveLength(0);
      expect(report.summary.avgLoadTime).toBe(0);
      expect(report.summary.avgRenderTime).toBe(0);
      expect(report.summary.totalDataFetches).toBe(0);
      expect(report.summary.cacheHitRate).toBe(0);
    });
  });

  describe('getPerformanceGrade', () => {
    it('returns grade A for excellent performance', () => {
      recordMetric('page_load', 1500, 'ms', 'timing');
      recordMetric('render_time', 50, 'ms', 'timing');
      recordMetric('cache_hit', 9, 'count', 'count');
      recordMetric('cache_miss', 1, 'count', 'count');

      const grade = getPerformanceGrade();
      expect(grade).toBe('A');
    });

    it('returns lower grade for poor performance', () => {
      recordMetric('page_load', 6000, 'ms', 'timing');
      recordMetric('render_time', 600, 'ms', 'timing');
      recordMetric('cache_hit', 1, 'count', 'count');
      recordMetric('cache_miss', 9, 'count', 'count');

      const grade = getPerformanceGrade();
      expect(['D', 'F']).toContain(grade);
    });
  });

  describe('clearMetrics', () => {
    it('clears all metrics', () => {
      recordMetric('test', 100, 'ms', 'timing');
      clearMetrics();

      const metrics = getMetrics();
      expect(metrics).toHaveLength(0);
    });
  });

  describe('Metric Limits', () => {
    it('limits stored metrics to MAX_METRICS', () => {
      // Record 150 metrics (max is 100)
      for (let i = 0; i < 150; i++) {
        recordMetric('test', i, 'ms', 'timing');
      }

      const metrics = getMetrics();
      expect(metrics.length).toBeLessThanOrEqual(100);
    });
  });
});
