/**
 * Comprehensive Error Tracking System
 * Provides centralized error tracking, categorization, and reporting
 */

import { createLogger, LogContext, logError as baseLogError } from './logger';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  NETWORK = 'network',
  RATE_LIMIT = 'rate_limit',
  MCP_TOOL = 'mcp_tool',
  PERFORMANCE = 'performance',
  USER_INPUT = 'user_input',
  SYSTEM = 'system',
  UNKNOWN = 'unknown',
}

export interface ErrorMetadata {
  severity: ErrorSeverity;
  category: ErrorCategory;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
  fingerprint?: string; // For deduplication
  tags?: Record<string, string>;
  breadcrumbs?: ErrorBreadcrumb[];
  performance?: PerformanceMetrics;
}

export interface ErrorBreadcrumb {
  timestamp: string;
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

export interface PerformanceMetrics {
  responseTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  dbQueryTime?: number;
  networkLatency?: number;
}

export interface TrackedError {
  id: string;
  message: string;
  stack?: string;
  metadata: ErrorMetadata;
  context?: LogContext;
  count: number;
  firstSeen: string;
  lastSeen: string;
}

class ErrorTracker {
  private logger = createLogger('error-tracker');
  private errorStore = new Map<string, TrackedError>();
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private maxBreadcrumbs = 50;

  /**
   * Track an error with comprehensive metadata
   */
  track(
    error: Error | string,
    metadata: Partial<ErrorMetadata> = {},
    context?: LogContext
  ): string {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    const fullMetadata: ErrorMetadata = {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      timestamp: new Date().toISOString(),
      fingerprint: this.generateFingerprint(errorMessage, errorStack),
      breadcrumbs: [...this.breadcrumbs],
      ...metadata,
    };

    const errorId = fullMetadata.fingerprint || this.generateErrorId();

    // Update or create error record
    const existingError = this.errorStore.get(errorId);
    if (existingError) {
      existingError.count++;
      existingError.lastSeen = fullMetadata.timestamp;
      existingError.metadata = fullMetadata; // Update with latest metadata
    } else {
      const trackedError: TrackedError = {
        id: errorId,
        message: errorMessage,
        stack: errorStack,
        metadata: fullMetadata,
        context,
        count: 1,
        firstSeen: fullMetadata.timestamp,
        lastSeen: fullMetadata.timestamp,
      };
      this.errorStore.set(errorId, trackedError);
    }

    // Log the error
    this.logTrackedError(errorId);

    // Check for alerts
    this.checkAlertThresholds(errorId);

    return errorId;
  }

  /**
   * Add breadcrumb for error context
   */
  addBreadcrumb(breadcrumb: Omit<ErrorBreadcrumb, 'timestamp'>): void {
    const fullBreadcrumb: ErrorBreadcrumb = {
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeWindow?: { start: string; end: string }) {
    const errors = Array.from(this.errorStore.values());

    let filteredErrors = errors;
    if (timeWindow) {
      filteredErrors = errors.filter(error =>
        error.lastSeen >= timeWindow.start && error.lastSeen <= timeWindow.end
      );
    }

    return {
      totalErrors: filteredErrors.reduce((sum, error) => sum + error.count, 0),
      uniqueErrors: filteredErrors.length,
      bySeverity: this.groupBy(filteredErrors, error => error.metadata.severity),
      byCategory: this.groupBy(filteredErrors, error => error.metadata.category),
      topErrors: filteredErrors
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(error => ({
          id: error.id,
          message: error.message,
          count: error.count,
          severity: error.metadata.severity,
          category: error.metadata.category,
        })),
    };
  }

  /**
   * Clear old errors based on retention policy
   */
  cleanup(retentionDays = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffISO = cutoffDate.toISOString();

    for (const [errorId, error] of this.errorStore.entries()) {
      if (error.lastSeen < cutoffISO) {
        this.errorStore.delete(errorId);
      }
    }

    this.logger.info('Error cleanup completed', {
      retentionDays,
      remainingErrors: this.errorStore.size,
    });
  }

  private generateFingerprint(message: string, stack?: string): string {
    // Create a stable fingerprint for error deduplication
    const content = stack ? `${message}\n${this.normalizeStack(stack)}` : message;
    return this.hash(content);
  }

  private normalizeStack(stack: string): string {
    // Remove line numbers and absolute paths for consistent fingerprinting
    return stack
      .replace(/:\d+:\d+/g, ':X:X') // Remove line/column numbers
      .replace(/\/.*?\/([^\/]+)\.js/g, '$1.js') // Keep only filename
      .split('\n')
      .slice(0, 5) // Keep only top 5 stack frames
      .join('\n');
  }

  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logTrackedError(errorId: string): void {
    const error = this.errorStore.get(errorId);
    if (!error) return;

    baseLogError(new Error(error.message), {
      errorId,
      count: error.count,
      severity: error.metadata.severity,
      category: error.metadata.category,
      firstSeen: error.firstSeen,
      lastSeen: error.lastSeen,
      ...error.context,
    });
  }

  private checkAlertThresholds(errorId: string): void {
    const error = this.errorStore.get(errorId);
    if (!error) return;

    // Alert thresholds
    const thresholds = {
      [ErrorSeverity.CRITICAL]: 1,
      [ErrorSeverity.HIGH]: 5,
      [ErrorSeverity.MEDIUM]: 25,
      [ErrorSeverity.LOW]: 100,
    };

    const threshold = thresholds[error.metadata.severity];
    if (error.count === threshold) {
      this.sendAlert(error, `Error threshold reached: ${threshold} occurrences`);
    }
  }

  private sendAlert(error: TrackedError, reason: string): void {
    this.logger.error('Error alert triggered', {
      alertReason: reason,
      errorId: error.id,
      message: error.message,
      count: error.count,
      severity: error.metadata.severity,
      category: error.metadata.category,
    });
  }

  private groupBy<T, K extends string | number | symbol>(
    items: T[],
    keyFn: (item: T) => K
  ): Record<K, number> {
    return items.reduce((groups, item) => {
      const key = keyFn(item);
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {} as Record<K, number>);
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker();

// Convenience functions
export function trackError(
  error: Error | string,
  metadata?: Partial<ErrorMetadata>,
  context?: LogContext
): string {
  return errorTracker.track(error, metadata, context);
}

export function addBreadcrumb(
  category: string,
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, unknown>
): void {
  errorTracker.addBreadcrumb({ category, message, level, data });
}

// Error classification helpers
export function classifyError(error: Error): {
  category: ErrorCategory;
  severity: ErrorSeverity;
} {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';

  // Authentication errors
  if (message.includes('unauthorized') || message.includes('auth')) {
    return { category: ErrorCategory.AUTHENTICATION, severity: ErrorSeverity.HIGH };
  }

  // Database errors
  if (message.includes('database') || message.includes('sql') || message.includes('query')) {
    return { category: ErrorCategory.DATABASE, severity: ErrorSeverity.HIGH };
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return { category: ErrorCategory.NETWORK, severity: ErrorSeverity.MEDIUM };
  }

  // Rate limiting
  if (message.includes('rate limit') || message.includes('too many')) {
    return { category: ErrorCategory.RATE_LIMIT, severity: ErrorSeverity.MEDIUM };
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return { category: ErrorCategory.VALIDATION, severity: ErrorSeverity.LOW };
  }

  // Performance issues
  if (message.includes('timeout') || message.includes('slow') || stack.includes('performance')) {
    return { category: ErrorCategory.PERFORMANCE, severity: ErrorSeverity.MEDIUM };
  }

  // Default classification
  return { category: ErrorCategory.UNKNOWN, severity: ErrorSeverity.MEDIUM };
}

export { ErrorTracker, errorTracker as default };