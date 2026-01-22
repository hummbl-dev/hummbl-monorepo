// Performance monitoring hook

import { useState, useEffect, useCallback } from 'react';
import { observeWebVitals } from '../utils/performanceMetrics';

export interface PerformanceSnapshot {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
  timestamp: number;
}

export interface PerformanceIssue {
  type: 'slow_load' | 'layout_shift' | 'high_memory' | 'slow_interaction';
  severity: 'low' | 'medium' | 'high';
  message: string;
  value: number;
  timestamp: number;
}

/**
 * Hook for real-time performance monitoring
 */
export function usePerformanceMonitor(enabled = true) {
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot | null>(null);
  const [issues, setIssues] = useState<PerformanceIssue[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  /**
   * Get current performance snapshot
   */
  const captureSnapshot = useCallback((): PerformanceSnapshot => {
    const snap: PerformanceSnapshot = {
      timestamp: Date.now(),
    };

    // Web Vitals from Performance API
    if ('performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        snap.ttfb = navigation.responseStart - navigation.requestStart;
      }

      // Paint timings
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcp) {
        snap.fcp = fcp.startTime;
      }
    }

    // Memory usage (if available)
    if (
      'memory' in performance &&
      (
        performance as Performance & {
          memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
        }
      ).memory
    ) {
      const mem = (
        performance as Performance & {
          memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
        }
      ).memory;
      snap.memoryUsage = {
        used: mem.usedJSHeapSize,
        total: mem.totalJSHeapSize,
        limit: mem.jsHeapSizeLimit,
      };
    }

    return snap;
  }, []);

  /**
   * Analyze snapshot for issues
   */
  const analyzePerformance = useCallback((snap: PerformanceSnapshot) => {
    const newIssues: PerformanceIssue[] = [];

    // Check FCP
    if (snap.fcp && snap.fcp > 3000) {
      newIssues.push({
        type: 'slow_load',
        severity: snap.fcp > 5000 ? 'high' : 'medium',
        message: `First Contentful Paint is ${Math.round(snap.fcp)}ms (target: <1800ms)`,
        value: snap.fcp,
        timestamp: Date.now(),
      });
    }

    // Check LCP
    if (snap.lcp && snap.lcp > 2500) {
      newIssues.push({
        type: 'slow_load',
        severity: snap.lcp > 4000 ? 'high' : 'medium',
        message: `Largest Contentful Paint is ${Math.round(snap.lcp)}ms (target: <2500ms)`,
        value: snap.lcp,
        timestamp: Date.now(),
      });
    }

    // Check CLS
    if (snap.cls && snap.cls > 0.1) {
      newIssues.push({
        type: 'layout_shift',
        severity: snap.cls > 0.25 ? 'high' : 'medium',
        message: `Cumulative Layout Shift is ${snap.cls.toFixed(3)} (target: <0.05)`,
        value: snap.cls,
        timestamp: Date.now(),
      });
    }

    // Check FID
    if (snap.fid && snap.fid > 100) {
      newIssues.push({
        type: 'slow_interaction',
        severity: snap.fid > 300 ? 'high' : 'medium',
        message: `First Input Delay is ${Math.round(snap.fid)}ms (target: <100ms)`,
        value: snap.fid,
        timestamp: Date.now(),
      });
    }

    // Check memory usage
    if (snap.memoryUsage) {
      const usagePercent = (snap.memoryUsage.used / snap.memoryUsage.limit) * 100;
      if (usagePercent > 80) {
        newIssues.push({
          type: 'high_memory',
          severity: usagePercent > 90 ? 'high' : 'medium',
          message: `High memory usage: ${usagePercent.toFixed(1)}% of limit`,
          value: usagePercent,
          timestamp: Date.now(),
        });
      }
    }

    if (newIssues.length > 0) {
      setIssues((prev) => [...newIssues, ...prev].slice(0, 20)); // Keep last 20 issues
    }
  }, []);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    observeWebVitals();

    // Periodic snapshot
    const interval = setInterval(() => {
      const snap = captureSnapshot();
      setSnapshot(snap);
      analyzePerformance(snap);
    }, 10000); // Every 10 seconds

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [isMonitoring, captureSnapshot, analyzePerformance]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  /**
   * Clear issues
   */
  const clearIssues = useCallback(() => {
    setIssues([]);
  }, []);

  /**
   * Get performance score (0-100)
   */
  const getPerformanceScore = useCallback((): number => {
    if (!snapshot) return 100;

    let score = 100;

    if (snapshot.fcp) {
      if (snapshot.fcp > 3000) score -= 20;
      else if (snapshot.fcp > 1800) score -= 10;
    }

    if (snapshot.lcp) {
      if (snapshot.lcp > 4000) score -= 20;
      else if (snapshot.lcp > 2500) score -= 10;
    }

    if (snapshot.cls) {
      if (snapshot.cls > 0.25) score -= 20;
      else if (snapshot.cls > 0.1) score -= 10;
    }

    if (snapshot.fid) {
      if (snapshot.fid > 300) score -= 20;
      else if (snapshot.fid > 100) score -= 10;
    }

    if (snapshot.memoryUsage) {
      const usagePercent = (snapshot.memoryUsage.used / snapshot.memoryUsage.limit) * 100;
      if (usagePercent > 90) score -= 20;
      else if (usagePercent > 80) score -= 10;
    }

    return Math.max(0, score);
  }, [snapshot]);

  // Auto-start if enabled
  useEffect(() => {
    if (enabled && !isMonitoring) {
      const cleanup = startMonitoring();
      return cleanup;
    }
  }, [enabled, isMonitoring, startMonitoring]);

  return {
    snapshot,
    issues,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    captureSnapshot,
    clearIssues,
    getPerformanceScore,
  };
}
