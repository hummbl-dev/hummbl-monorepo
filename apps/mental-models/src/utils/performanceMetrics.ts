// Performance metrics tracking utility

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'timing' | 'size' | 'count' | 'quality';
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    avgLoadTime: number;
    avgRenderTime: number;
    totalDataFetches: number;
    cacheHitRate: number;
  };
  timestamp: number;
}

const METRICS_KEY = 'hummbl_performance_metrics';
const MAX_METRICS = 100;

/**
 * Record a performance metric
 */
export function recordMetric(
  name: string,
  value: number,
  unit: string,
  category: PerformanceMetric['category']
): void {
  const metric: PerformanceMetric = {
    name,
    value,
    unit,
    timestamp: Date.now(),
    category,
  };

  const stored = getStoredMetrics();
  stored.push(metric);

  // Keep only last MAX_METRICS
  if (stored.length > MAX_METRICS) {
    stored.splice(0, stored.length - MAX_METRICS);
  }

  saveMetrics(stored);
}

/**
 * Get stored metrics
 */
function getStoredMetrics(): PerformanceMetric[] {
  try {
    const stored = localStorage.getItem(METRICS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load performance metrics:', error);
  }
  return [];
}

/**
 * Save metrics to localStorage
 */
function saveMetrics(metrics: PerformanceMetric[]): void {
  try {
    localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
  } catch (error) {
    console.warn('Failed to save performance metrics:', error);
  }
}

/**
 * Get all metrics
 */
export function getMetrics(): PerformanceMetric[] {
  return getStoredMetrics();
}

/**
 * Get metrics by category
 */
export function getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
  return getStoredMetrics().filter((m) => m.category === category);
}

/**
 * Get metrics by name
 */
export function getMetricsByName(name: string): PerformanceMetric[] {
  return getStoredMetrics().filter((m) => m.name === name);
}

/**
 * Calculate average for a metric
 */
export function getAverageMetric(name: string): number {
  const metrics = getMetricsByName(name);
  if (metrics.length === 0) return 0;

  const sum = metrics.reduce((acc, m) => acc + m.value, 0);
  return sum / metrics.length;
}

/**
 * Calculate percentile for a metric
 */
export function getPercentile(name: string, percentile: number): number {
  const metrics = getMetricsByName(name);
  if (metrics.length === 0) return 0;

  const values = metrics.map((m) => m.value).sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * values.length) - 1;
  return values[Math.max(0, index)];
}

/**
 * Get performance report
 */
export function getPerformanceReport(): PerformanceReport {
  const metrics = getStoredMetrics();

  const loadTimes = metrics.filter((m) => m.name === 'page_load').map((m) => m.value);
  const renderTimes = metrics.filter((m) => m.name === 'render_time').map((m) => m.value);
  const dataFetches = metrics.filter((m) => m.name === 'data_fetch').length;
  const cacheHits = metrics.filter((m) => m.name === 'cache_hit').length;
  const cacheMisses = metrics.filter((m) => m.name === 'cache_miss').length;

  const avgLoadTime =
    loadTimes.length > 0 ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0;
  const avgRenderTime =
    renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0;
  const cacheHitRate = cacheHits + cacheMisses > 0 ? cacheHits / (cacheHits + cacheMisses) : 0;

  return {
    metrics,
    summary: {
      avgLoadTime,
      avgRenderTime,
      totalDataFetches: dataFetches,
      cacheHitRate,
    },
    timestamp: Date.now(),
  };
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  localStorage.removeItem(METRICS_KEY);
}

/**
 * Measure function execution time
 */
export function measureExecutionTime<T>(fn: () => T, metricName: string): T {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();

  recordMetric(metricName, endTime - startTime, 'ms', 'timing');

  return result;
}

/**
 * Measure async function execution time
 */
export async function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>,
  metricName: string
): Promise<T> {
  const startTime = performance.now();
  const result = await fn();
  const endTime = performance.now();

  recordMetric(metricName, endTime - startTime, 'ms', 'timing');

  return result;
}

/**
 * Performance observer for Web Vitals
 */
export function observeWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };
        const lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
        recordMetric('lcp', lcp, 'ms', 'timing');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          const fid = fidEntry.processingStart - fidEntry.startTime;
          recordMetric('fid', fid, 'ms', 'timing');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value || 0;
          }
        });
        recordMetric('cls', clsValue, 'score', 'quality');
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported
    }
  }

  // Navigation Timing
  if ('performance' in window && 'timing' in window.performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        const timeToFirstByte = timing.responseStart - timing.navigationStart;

        recordMetric('page_load', loadTime, 'ms', 'timing');
        recordMetric('dom_content_loaded', domContentLoaded, 'ms', 'timing');
        recordMetric('ttfb', timeToFirstByte, 'ms', 'timing');
      }, 0);
    });
  }
}

/**
 * Get performance grade based on metrics
 */
export function getPerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
  const report = getPerformanceReport();
  const { avgLoadTime, avgRenderTime, cacheHitRate } = report.summary;

  let score = 100;

  // Load time scoring (target: < 2000ms)
  if (avgLoadTime > 5000) score -= 30;
  else if (avgLoadTime > 3000) score -= 20;
  else if (avgLoadTime > 2000) score -= 10;

  // Render time scoring (target: < 100ms)
  if (avgRenderTime > 500) score -= 20;
  else if (avgRenderTime > 200) score -= 10;
  else if (avgRenderTime > 100) score -= 5;

  // Cache hit rate scoring (target: > 80%)
  if (cacheHitRate < 0.5) score -= 20;
  else if (cacheHitRate < 0.7) score -= 10;
  else if (cacheHitRate < 0.8) score -= 5;

  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
