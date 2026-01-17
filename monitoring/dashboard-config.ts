/**
 * Error Monitoring Dashboard Configuration
 * Defines metrics, visualizations, and monitoring workflows
 */

import { errorTracker } from '@hummbl/core';
import { alertingSystem } from './error-alerting';

export interface DashboardMetric {
  id: string;
  name: string;
  description: string;
  type: 'counter' | 'gauge' | 'histogram' | 'rate';
  unit?: string;
  aggregation: 'sum' | 'avg' | 'max' | 'min' | 'count';
  timeWindows: string[]; // e.g., ['1h', '24h', '7d']
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'line_chart' | 'bar_chart' | 'pie_chart' | 'table' | 'single_stat' | 'heatmap';
  metrics: string[];
  filters?: Record<string, unknown>;
  position: { x: number; y: number; width: number; height: number };
  refreshInterval?: number; // seconds
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  autoRefresh: boolean;
  refreshInterval: number;
}

class MonitoringDashboard {
  private metrics: Map<string, DashboardMetric> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();
  private metricData: Map<string, MetricDataPoint[]> = new Map();

  constructor() {
    this.initializeMetrics();
    this.initializeDashboards();
    this.startMetricsCollection();
  }

  /**
   * Get dashboard configuration
   */
  getDashboard(dashboardId: string): Dashboard | undefined {
    return this.dashboards.get(dashboardId);
  }

  /**
   * Get all available dashboards
   */
  getAllDashboards(): Dashboard[] {
    return Array.from(this.dashboards.values());
  }

  /**
   * Get metric data for a time period
   */
  getMetricData(
    metricId: string,
    timeWindow: string = '1h',
    filters?: Record<string, unknown>
  ): MetricDataPoint[] {
    const data = this.metricData.get(metricId) || [];
    const windowMs = this.parseTimeWindow(timeWindow);
    const cutoff = Date.now() - windowMs;

    let filteredData = data.filter(point => point.timestamp >= cutoff);

    if (filters) {
      filteredData = this.applyFilters(filteredData, filters);
    }

    return filteredData.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get real-time dashboard data
   */
  getDashboardData(dashboardId: string): DashboardData {
    const dashboard = this.getDashboard(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${dashboardId}`);
    }

    const widgetData: Record<string, WidgetData> = {};

    for (const widget of dashboard.widgets) {
      widgetData[widget.id] = this.getWidgetData(widget);
    }

    const errorStats = errorTracker.getErrorStats();
    const alertStatus = alertingSystem.getAlertStatus();

    return {
      dashboard,
      widgetData,
      errorStats,
      alertStatus,
      timestamp: Date.now(),
    };
  }

  /**
   * Generate performance report
   */
  generateReport(timeWindow: string = '24h'): PerformanceReport {
    const errorStats = errorTracker.getErrorStats({
      start: new Date(Date.now() - this.parseTimeWindow(timeWindow)).toISOString(),
      end: new Date().toISOString(),
    });

    const alertStatus = alertingSystem.getAlertStatus();

    // Calculate additional metrics
    const errorTrends = this.calculateErrorTrends(timeWindow);
    const performanceMetrics = this.calculatePerformanceMetrics(timeWindow);
    const userImpactAnalysis = this.calculateUserImpact(timeWindow);

    return {
      timeWindow,
      generatedAt: new Date().toISOString(),
      overview: {
        totalErrors: errorStats.totalErrors,
        uniqueErrors: errorStats.uniqueErrors,
        activeAlerts: alertStatus.activeAlerts,
        criticalAlerts: alertStatus.criticalAlerts,
      },
      errorBreakdown: {
        bySeverity: errorStats.bySeverity,
        byCategory: errorStats.byCategory,
        topErrors: errorStats.topErrors,
      },
      trends: errorTrends,
      performance: performanceMetrics,
      userImpact: userImpactAnalysis,
      recommendations: this.generateRecommendations(errorStats, alertStatus),
    };
  }

  private initializeMetrics(): void {
    const metrics: DashboardMetric[] = [
      {
        id: 'error_rate',
        name: 'Error Rate',
        description: 'Percentage of requests resulting in errors',
        type: 'rate',
        unit: '%',
        aggregation: 'avg',
        timeWindows: ['5m', '1h', '24h', '7d'],
      },
      {
        id: 'error_count',
        name: 'Error Count',
        description: 'Total number of errors',
        type: 'counter',
        aggregation: 'sum',
        timeWindows: ['5m', '1h', '24h', '7d'],
      },
      {
        id: 'response_time_p95',
        name: '95th Percentile Response Time',
        description: '95th percentile of response times',
        type: 'histogram',
        unit: 'ms',
        aggregation: 'max',
        timeWindows: ['5m', '1h', '24h'],
      },
      {
        id: 'active_users',
        name: 'Active Users',
        description: 'Number of active users in time window',
        type: 'gauge',
        aggregation: 'count',
        timeWindows: ['5m', '1h', '24h'],
      },
      {
        id: 'critical_errors',
        name: 'Critical Errors',
        description: 'Number of critical severity errors',
        type: 'counter',
        aggregation: 'sum',
        timeWindows: ['5m', '1h', '24h', '7d'],
      },
      {
        id: 'auth_failures',
        name: 'Authentication Failures',
        description: 'Number of authentication failures',
        type: 'counter',
        aggregation: 'sum',
        timeWindows: ['5m', '1h', '24h'],
      },
      {
        id: 'database_errors',
        name: 'Database Errors',
        description: 'Number of database-related errors',
        type: 'counter',
        aggregation: 'sum',
        timeWindows: ['5m', '1h', '24h'],
      },
    ];

    metrics.forEach(metric => this.metrics.set(metric.id, metric));
  }

  private initializeDashboards(): void {
    // Overview Dashboard
    this.dashboards.set('overview', {
      id: 'overview',
      name: 'Error Monitoring Overview',
      description: 'High-level overview of system health and errors',
      autoRefresh: true,
      refreshInterval: 30,
      widgets: [
        {
          id: 'error_rate_chart',
          title: 'Error Rate Trend',
          type: 'line_chart',
          metrics: ['error_rate'],
          position: { x: 0, y: 0, width: 6, height: 4 },
          refreshInterval: 30,
        },
        {
          id: 'error_count_chart',
          title: 'Error Count',
          type: 'bar_chart',
          metrics: ['error_count'],
          position: { x: 6, y: 0, width: 6, height: 4 },
          refreshInterval: 30,
        },
        {
          id: 'error_severity_pie',
          title: 'Errors by Severity',
          type: 'pie_chart',
          metrics: ['critical_errors', 'error_count'],
          position: { x: 0, y: 4, width: 4, height: 4 },
          refreshInterval: 60,
        },
        {
          id: 'response_time_trend',
          title: 'Response Time (95th percentile)',
          type: 'line_chart',
          metrics: ['response_time_p95'],
          position: { x: 4, y: 4, width: 4, height: 4 },
          refreshInterval: 30,
        },
        {
          id: 'active_alerts',
          title: 'Active Alerts',
          type: 'single_stat',
          metrics: [],
          position: { x: 8, y: 4, width: 4, height: 4 },
          refreshInterval: 15,
        },
      ],
    });

    // Performance Dashboard
    this.dashboards.set('performance', {
      id: 'performance',
      name: 'Performance Monitoring',
      description: 'Detailed performance metrics and trends',
      autoRefresh: true,
      refreshInterval: 60,
      widgets: [
        {
          id: 'response_time_histogram',
          title: 'Response Time Distribution',
          type: 'heatmap',
          metrics: ['response_time_p95'],
          position: { x: 0, y: 0, width: 8, height: 6 },
          refreshInterval: 60,
        },
        {
          id: 'slow_endpoints',
          title: 'Slowest Endpoints',
          type: 'table',
          metrics: ['response_time_p95'],
          position: { x: 8, y: 0, width: 4, height: 6 },
          refreshInterval: 120,
        },
      ],
    });

    // Error Analysis Dashboard
    this.dashboards.set('errors', {
      id: 'errors',
      name: 'Error Analysis',
      description: 'Detailed error tracking and analysis',
      autoRefresh: true,
      refreshInterval: 30,
      widgets: [
        {
          id: 'error_categories',
          title: 'Errors by Category',
          type: 'bar_chart',
          metrics: ['auth_failures', 'database_errors'],
          position: { x: 0, y: 0, width: 6, height: 4 },
          refreshInterval: 60,
        },
        {
          id: 'top_errors_table',
          title: 'Most Frequent Errors',
          type: 'table',
          metrics: ['error_count'],
          position: { x: 6, y: 0, width: 6, height: 4 },
          refreshInterval: 60,
        },
        {
          id: 'error_timeline',
          title: 'Error Timeline',
          type: 'line_chart',
          metrics: ['critical_errors', 'error_count'],
          position: { x: 0, y: 4, width: 12, height: 4 },
          refreshInterval: 30,
        },
      ],
    });
  }

  private getWidgetData(widget: DashboardWidget): WidgetData {
    const data: Record<string, MetricDataPoint[]> = {};

    for (const metricId of widget.metrics) {
      data[metricId] = this.getMetricData(metricId, '1h', widget.filters);
    }

    return {
      widget,
      data,
      lastUpdated: Date.now(),
    };
  }

  private startMetricsCollection(): void {
    // Collect metrics every minute
    setInterval(() => {
      this.collectMetrics();
    }, 60000);

    // Initial collection
    this.collectMetrics();
  }

  private collectMetrics(): void {
    const timestamp = Date.now();
    const errorStats = errorTracker.getErrorStats();

    // Collect error metrics
    this.addMetricPoint('error_count', errorStats.totalErrors, timestamp);
    this.addMetricPoint('critical_errors', errorStats.bySeverity?.critical || 0, timestamp);

    // Calculate error rate (would need request count from elsewhere)
    const errorRate = errorStats.totalErrors / Math.max(1000, errorStats.totalErrors); // Placeholder
    this.addMetricPoint('error_rate', errorRate * 100, timestamp);

    // Collect category-specific metrics
    this.addMetricPoint('auth_failures', errorStats.byCategory?.authentication || 0, timestamp);
    this.addMetricPoint('database_errors', errorStats.byCategory?.database || 0, timestamp);

    // Collect performance metrics (would integrate with actual performance monitoring)
    this.addMetricPoint('response_time_p95', Math.random() * 1000 + 100, timestamp); // Placeholder
    this.addMetricPoint('active_users', Math.floor(Math.random() * 1000 + 100), timestamp); // Placeholder
  }

  private addMetricPoint(metricId: string, value: number, timestamp: number): void {
    if (!this.metricData.has(metricId)) {
      this.metricData.set(metricId, []);
    }

    const points = this.metricData.get(metricId)!;
    points.push({ value, timestamp, labels: {} });

    // Keep only last 7 days of data
    const sevenDaysAgo = timestamp - 7 * 24 * 60 * 60 * 1000;
    this.metricData.set(metricId, points.filter(p => p.timestamp >= sevenDaysAgo));
  }

  private parseTimeWindow(window: string): number {
    const unit = window.slice(-1);
    const value = parseInt(window.slice(0, -1));

    switch (unit) {
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000; // Default to 1 hour
    }
  }

  private applyFilters(data: MetricDataPoint[], filters: Record<string, unknown>): MetricDataPoint[] {
    // Apply filtering logic based on labels
    return data.filter(point => {
      for (const [key, value] of Object.entries(filters)) {
        if (point.labels[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  private calculateErrorTrends(timeWindow: string): ErrorTrends {
    const windowMs = this.parseTimeWindow(timeWindow);
    const now = Date.now();
    const midpoint = now - windowMs / 2;

    const recentErrors = this.getMetricData('error_count', timeWindow.replace(/\d+/, (n) => String(Math.floor(parseInt(n) / 2))));
    const previousErrors = this.getMetricData('error_count', timeWindow).filter(p => p.timestamp < midpoint);

    const recentSum = recentErrors.reduce((sum, p) => sum + p.value, 0);
    const previousSum = previousErrors.reduce((sum, p) => sum + p.value, 0);

    const changePercent = previousSum === 0 ? 0 : ((recentSum - previousSum) / previousSum) * 100;

    return {
      currentPeriod: recentSum,
      previousPeriod: previousSum,
      changePercent,
      trend: changePercent > 10 ? 'increasing' : changePercent < -10 ? 'decreasing' : 'stable',
    };
  }

  private calculatePerformanceMetrics(timeWindow: string): PerformanceMetrics {
    const responseTimeData = this.getMetricData('response_time_p95', timeWindow);

    return {
      averageResponseTime: responseTimeData.reduce((sum, p) => sum + p.value, 0) / Math.max(1, responseTimeData.length),
      p95ResponseTime: Math.max(...responseTimeData.map(p => p.value), 0),
      slowRequestsCount: responseTimeData.filter(p => p.value > 2000).length,
    };
  }

  private calculateUserImpact(timeWindow: string): UserImpactAnalysis {
    const errorData = this.getMetricData('error_count', timeWindow);
    const criticalErrorData = this.getMetricData('critical_errors', timeWindow);

    return {
      affectedUsers: Math.floor(Math.random() * 100), // Placeholder
      errorSessions: errorData.reduce((sum, p) => sum + p.value, 0),
      criticalIncidents: criticalErrorData.reduce((sum, p) => sum + p.value, 0),
      userSatisfactionImpact: 'medium', // Would be calculated based on actual user feedback
    };
  }

  private generateRecommendations(errorStats: any, alertStatus: any): string[] {
    const recommendations: string[] = [];

    if (alertStatus.criticalAlerts > 0) {
      recommendations.push('Immediate attention required: Critical alerts are active');
    }

    if (errorStats.totalErrors > 100) {
      recommendations.push('High error volume detected. Review top error categories');
    }

    if (errorStats.byCategory?.authentication > 20) {
      recommendations.push('High authentication failures. Check auth service health');
    }

    if (errorStats.byCategory?.database > 10) {
      recommendations.push('Database errors detected. Monitor database performance');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is operating within normal parameters');
    }

    return recommendations;
  }
}

// Interfaces
interface MetricDataPoint {
  value: number;
  timestamp: number;
  labels: Record<string, unknown>;
}

interface WidgetData {
  widget: DashboardWidget;
  data: Record<string, MetricDataPoint[]>;
  lastUpdated: number;
}

interface DashboardData {
  dashboard: Dashboard;
  widgetData: Record<string, WidgetData>;
  errorStats: any;
  alertStatus: any;
  timestamp: number;
}

interface ErrorTrends {
  currentPeriod: number;
  previousPeriod: number;
  changePercent: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface PerformanceMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  slowRequestsCount: number;
}

interface UserImpactAnalysis {
  affectedUsers: number;
  errorSessions: number;
  criticalIncidents: number;
  userSatisfactionImpact: 'low' | 'medium' | 'high';
}

interface PerformanceReport {
  timeWindow: string;
  generatedAt: string;
  overview: {
    totalErrors: number;
    uniqueErrors: number;
    activeAlerts: number;
    criticalAlerts: number;
  };
  errorBreakdown: {
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    topErrors: any[];
  };
  trends: ErrorTrends;
  performance: PerformanceMetrics;
  userImpact: UserImpactAnalysis;
  recommendations: string[];
}

// Global instance
export const monitoringDashboard = new MonitoringDashboard();

export default monitoringDashboard;