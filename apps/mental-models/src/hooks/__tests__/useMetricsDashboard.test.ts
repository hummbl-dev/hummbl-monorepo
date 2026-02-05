// Tests for useMetricsDashboard hook

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMetricsDashboard } from '../useMetricsDashboard';

// Mock the dependencies
vi.mock('../../utils/performanceMetrics', () => ({
  getPerformanceReport: vi.fn(() => ({
    metrics: [],
    summary: {
      avgLoadTime: 1500,
      avgRenderTime: 80,
      totalDataFetches: 5,
      cacheHitRate: 0.85,
    },
    timestamp: Date.now(),
  })),
  getMetrics: vi.fn(() => [
    { name: 'page_load', value: 1500, unit: 'ms', timestamp: Date.now(), category: 'timing' },
  ]),
}));

vi.mock('../../utils/codeQualityMetrics', () => ({
  getLatestQualityMetrics: vi.fn(() => ({
    testCoverage: 85,
    componentCount: 15,
    utilityCount: 8,
    averageFileSize: 250,
    typeScriptUsage: 95,
    lintIssues: 2,
    buildTime: 1800,
    bundleSize: 180000,
    timestamp: Date.now(),
  })),
  getQualityHistory: vi.fn(() => []),
  calculateQualityScore: vi.fn(() => ({
    overall: 88,
    categories: { testing: 35, structure: 23, performance: 18, maintainability: 12 },
    grade: 'B',
    recommendations: [],
  })),
}));

vi.mock('../../utils/agentEffectiveness', () => ({
  calculateAgentMetrics: vi.fn(() => ({
    totalTasks: 10,
    successfulTasks: 9,
    successRate: 0.9,
    averageTaskTime: 3600000,
    totalLinesWritten: 500,
    totalTestsAdded: 20,
    buildSuccessRate: 0.9,
    averageFeedbackScore: 4.5,
    productivity: 300,
    quality: 85,
    timestamp: Date.now(),
  })),
  generateAgentReport: vi.fn(() => ({
    metrics: {
      totalTasks: 10,
      successfulTasks: 9,
      successRate: 0.9,
      averageTaskTime: 3600000,
      totalLinesWritten: 500,
      totalTestsAdded: 20,
      buildSuccessRate: 0.9,
      averageFeedbackScore: 4.5,
      productivity: 300,
      quality: 85,
      timestamp: Date.now(),
    },
    recentTasks: [],
    strengths: ['High success rate'],
    improvements: [],
    grade: 'A',
  })),
}));

vi.mock('../useUserAnalytics', () => ({
  useUserAnalytics: () => ({
    getStats: vi.fn(() => ({
      views: { totalViews: 50, narrativeViews: {}, modelViews: {}, lastViewTimestamp: Date.now() },
      searches: { totalSearches: 20, queries: [], queryCount: {}, lastSearchTimestamp: Date.now() },
      exports: {
        totalExports: 5,
        formatUsage: {},
        lastExportTimestamp: Date.now(),
        averageNarrativeCount: 10,
      },
      sessionStart: Date.now() - 3600000,
      sessionDuration: 3600000,
      actions: [],
    })),
    getRecentActions: vi.fn(() => []),
  }),
}));

describe('useMetricsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('initializes with loading state', () => {
      const { result } = renderHook(() => useMetricsDashboard(0)); // Disable auto-refresh

      expect(result.current.loading).toBe(true);
    });

    it('fetches metrics on mount', async () => {
      const { result } = renderHook(() => useMetricsDashboard(0));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.metrics).toBeDefined();
    });
  });

  describe('Metrics Data', () => {
    it('provides performance metrics', async () => {
      const { result } = renderHook(() => useMetricsDashboard(0));

      await waitFor(() => {
        expect(result.current.metrics).toBeDefined();
      });

      expect(result.current.metrics?.performance).toBeDefined();
      expect(result.current.metrics?.performance.avgLoadTime).toBe(1500);
      expect(result.current.metrics?.performance.cacheHitRate).toBe(0.85);
    });

    it('provides quality metrics', async () => {
      const { result } = renderHook(() => useMetricsDashboard(0));

      await waitFor(() => {
        expect(result.current.metrics).toBeDefined();
      });

      expect(result.current.metrics?.quality).toBeDefined();
      expect(result.current.metrics?.quality.testCoverage).toBe(85);
      expect(result.current.metrics?.quality.grade).toBe('B');
    });

    it('provides agent metrics', async () => {
      const { result } = renderHook(() => useMetricsDashboard(0));

      await waitFor(() => {
        expect(result.current.metrics).toBeDefined();
      });

      expect(result.current.metrics?.agent).toBeDefined();
      expect(result.current.metrics?.agent.successRate).toBe(0.9);
      expect(result.current.metrics?.agent.grade).toBe('A');
    });

    it('provides user activity metrics', async () => {
      const { result } = renderHook(() => useMetricsDashboard(0));

      await waitFor(() => {
        expect(result.current.metrics).toBeDefined();
      });

      expect(result.current.metrics?.userActivity).toBeDefined();
      expect(result.current.metrics?.userActivity.totalViews).toBe(50);
      expect(result.current.metrics?.userActivity.totalSearches).toBe(20);
    });
  });

  describe('Refresh Functionality', () => {
    it('refreshes metrics on demand', async () => {
      const { result } = renderHook(() => useMetricsDashboard(0));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialUpdate = result.current.lastUpdate;

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.lastUpdate).toBeGreaterThan(initialUpdate);
      });
    });
  });

  describe('Trend Data', () => {
    it('provides performance trend data', async () => {
      const { result } = renderHook(() => useMetricsDashboard(0));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const trend = result.current.trends.performance();
      expect(Array.isArray(trend)).toBe(true);
    });

    it('provides quality trend data', async () => {
      const { result } = renderHook(() => useMetricsDashboard(0));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const trend = result.current.trends.quality();
      expect(Array.isArray(trend)).toBe(true);
    });

    it('provides activity trend data', async () => {
      const { result } = renderHook(() => useMetricsDashboard(0));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const trend = result.current.trends.activity();
      expect(Array.isArray(trend)).toBe(true);
    });
  });

  describe('lastUpdate Timestamp', () => {
    it('updates lastUpdate timestamp', async () => {
      const { result } = renderHook(() => useMetricsDashboard(0));

      await waitFor(() => {
        expect(result.current.lastUpdate).toBeGreaterThan(0);
      });
    });
  });
});
