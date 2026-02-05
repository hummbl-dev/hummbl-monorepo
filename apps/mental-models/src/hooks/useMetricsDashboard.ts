// Metrics dashboard data aggregation hook

import { useState, useEffect, useCallback } from 'react';
import { getPerformanceReport, getMetrics } from '../utils/performanceMetrics';
import {
  getLatestQualityMetrics,
  getQualityHistory,
  calculateQualityScore,
} from '../utils/codeQualityMetrics';
import { calculateAgentMetrics, generateAgentReport } from '../utils/agentEffectiveness';
import { useUserAnalytics } from './useUserAnalytics';

export interface DashboardMetrics {
  performance: {
    avgLoadTime: number;
    avgRenderTime: number;
    cacheHitRate: number;
    grade: string;
  };
  quality: {
    overall: number;
    testCoverage: number;
    buildTime: number;
    grade: string;
  };
  agent: {
    successRate: number;
    productivity: number;
    quality: number;
    grade: string;
  };
  userActivity: {
    totalViews: number;
    totalSearches: number;
    totalExports: number;
    sessionDuration: number;
  };
}

export interface TrendData {
  timestamp: number;
  value: number;
}

/**
 * Custom hook for metrics dashboard
 */
export function useMetricsDashboard(refreshInterval = 30000) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const analytics = useUserAnalytics();

  /**
   * Fetch and aggregate all metrics
   */
  const fetchMetrics = useCallback(() => {
    try {
      // Performance metrics
      const perfReport = getPerformanceReport();
      const perfMetrics = getMetrics();

      // Calculate performance grade
      const { avgLoadTime, avgRenderTime, cacheHitRate } = perfReport.summary;
      let perfGrade = 'N/A';
      if (perfMetrics.length > 0) {
        let score = 100;
        if (avgLoadTime > 5000) score -= 30;
        else if (avgLoadTime > 3000) score -= 20;
        else if (avgLoadTime > 2000) score -= 10;

        if (avgRenderTime > 500) score -= 20;
        else if (avgRenderTime > 200) score -= 10;

        if (cacheHitRate < 0.5) score -= 20;
        else if (cacheHitRate < 0.7) score -= 10;

        perfGrade =
          score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
      }

      // Quality metrics
      const latestQuality = getLatestQualityMetrics();
      let qualityData = {
        overall: 0,
        testCoverage: 0,
        buildTime: 0,
        grade: 'N/A' as string,
      };

      if (latestQuality) {
        const qualityScore = calculateQualityScore(latestQuality);
        qualityData = {
          overall: qualityScore.overall,
          testCoverage: latestQuality.testCoverage,
          buildTime: latestQuality.buildTime,
          grade: qualityScore.grade,
        };
      }

      // Agent metrics
      const agentMetrics = calculateAgentMetrics();
      const agentReport = generateAgentReport();

      // User activity
      const userStats = analytics.getStats();

      const aggregated: DashboardMetrics = {
        performance: {
          avgLoadTime,
          avgRenderTime,
          cacheHitRate,
          grade: perfGrade,
        },
        quality: qualityData,
        agent: {
          successRate: agentMetrics.successRate,
          productivity: agentMetrics.productivity,
          quality: agentMetrics.quality,
          grade: agentReport.grade,
        },
        userActivity: {
          totalViews: userStats.views.totalViews,
          totalSearches: userStats.searches.totalSearches,
          totalExports: userStats.exports.totalExports,
          sessionDuration: userStats.sessionDuration,
        },
      };

      setMetrics(aggregated);
      setLastUpdate(Date.now());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setLoading(false);
    }
  }, [analytics]);

  /**
   * Get performance trend data
   */
  const getPerformanceTrend = useCallback((): TrendData[] => {
    const allMetrics = getMetrics();
    const loadTimes = allMetrics
      .filter((m) => m.name === 'page_load')
      .map((m) => ({
        timestamp: m.timestamp,
        value: m.value,
      }))
      .slice(-20); // Last 20 data points

    return loadTimes;
  }, []);

  /**
   * Get quality trend data
   */
  const getQualityTrend = useCallback((): TrendData[] => {
    const history = getQualityHistory();
    return history
      .map((h) => ({
        timestamp: h.timestamp,
        value: h.testCoverage,
      }))
      .slice(-20);
  }, []);

  /**
   * Get user activity trend
   */
  const getUserActivityTrend = useCallback((): TrendData[] => {
    const userStats = analytics.getStats();
    const recentActions = analytics.getRecentActions(20);

    // Group by hour
    const hourlyActivity = new Map<number, number>();

    for (const action of recentActions) {
      const hour = Math.floor(action.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);
      hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + 1);
    }

    return Array.from(hourlyActivity.entries())
      .map(([timestamp, value]) => ({ timestamp, value }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [analytics]);

  /**
   * Refresh metrics
   */
  const refresh = useCallback(() => {
    setLoading(true);
    fetchMetrics();
  }, [fetchMetrics]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchMetrics]);

  return {
    metrics,
    loading,
    lastUpdate,
    refresh,
    trends: {
      performance: getPerformanceTrend,
      quality: getQualityTrend,
      activity: getUserActivityTrend,
    },
  };
}
