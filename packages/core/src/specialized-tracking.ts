/**
 * Specialized Error Tracking for Specific Failure Scenarios
 * Provides tailored tracking for authentication, database, rate limiting, and MCP tool failures
 */

import { trackError, addBreadcrumb, ErrorSeverity, ErrorCategory } from './error-tracking';

// TODO: Add structured logging for specialized tracking operations

// ===== Authentication Error Tracking =====

export interface AuthErrorContext {
  authMethod: 'jwt' | 'session' | 'apikey' | 'oauth';
  userId?: string;
  clientId?: string;
  attemptCount?: number;
  lastAttemptTime?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint: string;
  reason: 'invalid_credentials' | 'expired_token' | 'malformed_token' | 'missing_token' | 'insufficient_permissions';
}

export class AuthErrorTracker {
  private failureAttempts = new Map<string, number>();
  private lastAttemptTime = new Map<string, number>();

  trackAuthFailure(context: AuthErrorContext): string {
    const identifier = context.ipAddress || context.userId || 'unknown';
    const attempts = this.failureAttempts.get(identifier) || 0;
    const newAttempts = attempts + 1;

    this.failureAttempts.set(identifier, newAttempts);
    this.lastAttemptTime.set(identifier, Date.now());

    // Determine severity based on attempt patterns
    let severity = ErrorSeverity.LOW;
    if (newAttempts >= 5) severity = ErrorSeverity.MEDIUM;
    if (newAttempts >= 10) severity = ErrorSeverity.HIGH;
    if (newAttempts >= 20) severity = ErrorSeverity.CRITICAL;

    addBreadcrumb(
      'auth-failure',
      `Authentication failure: ${context.reason}`,
      'warning',
      {
        method: context.authMethod,
        endpoint: context.endpoint,
        attempts: newAttempts,
        reason: context.reason,
      }
    );

    return trackError(
      new Error(`Authentication failed: ${context.reason}`),
      {
        severity,
        category: ErrorCategory.AUTHENTICATION,
        userId: context.userId,
        endpoint: context.endpoint,
        userAgent: context.userAgent,
        ip: context.ipAddress,
        timestamp: new Date().toISOString(),
        tags: {
          authMethod: context.authMethod,
          reason: context.reason,
          attemptCount: String(newAttempts),
          type: 'auth-failure',
        },
      },
      {
        clientId: context.clientId,
        attemptCount: newAttempts,
        consecutiveFailures: this.getConsecutiveFailures(identifier),
        suspiciousActivity: this.detectSuspiciousActivity(identifier),
        ...context,
      }
    );
  }

  trackAuthSuccess(userId: string, ipAddress?: string): void {
    const identifier = ipAddress || userId;
    this.failureAttempts.delete(identifier);
    this.lastAttemptTime.delete(identifier);

    addBreadcrumb(
      'auth-success',
      `Successful authentication for user: ${userId}`,
      'info',
      { userId, ipAddress }
    );
  }

  private getConsecutiveFailures(identifier: string): number {
    return this.failureAttempts.get(identifier) || 0;
  }

  private detectSuspiciousActivity(identifier: string): boolean {
    const attempts = this.failureAttempts.get(identifier) || 0;
    const lastAttempt = this.lastAttemptTime.get(identifier) || 0;
    const timeSinceLastAttempt = Date.now() - lastAttempt;

    // Suspicious if many attempts in short time
    return attempts >= 5 && timeSinceLastAttempt < 60000; // 5 attempts in 1 minute
  }
}

// ===== Database Error Tracking =====

export interface DatabaseErrorContext {
  operation: 'read' | 'write' | 'delete' | 'migrate' | 'connect';
  table?: string;
  query?: string;
  connectionPool?: string;
  transactionId?: string;
  rowsAffected?: number;
  queryTime?: number;
  errorCode?: string;
  constraint?: string;
  deadlockDetected?: boolean;
}

export class DatabaseErrorTracker {
  private connectionIssues = new Map<string, number>();
  private queryPerformance = new Map<string, number[]>();

  trackDatabaseError(error: Error, context: DatabaseErrorContext): string {
    const { operation, table, errorCode } = context;

    // Classify error severity
    let severity = ErrorSeverity.MEDIUM;
    let category = ErrorCategory.DATABASE;

    if (context.deadlockDetected) severity = ErrorSeverity.HIGH;
    if (operation === 'migrate') severity = ErrorSeverity.CRITICAL;
    if (errorCode === 'CONNECTION_LOST') severity = ErrorSeverity.HIGH;
    if (context.queryTime && context.queryTime > 5000) severity = ErrorSeverity.HIGH;

    // Track connection issues
    const poolKey = context.connectionPool || 'default';
    if (errorCode === 'CONNECTION_LOST' || errorCode === 'TIMEOUT') {
      const issues = this.connectionIssues.get(poolKey) || 0;
      this.connectionIssues.set(poolKey, issues + 1);
    }

    // Track query performance
    if (context.query && context.queryTime) {
      const queryHash = this.hashQuery(context.query);
      const times = this.queryPerformance.get(queryHash) || [];
      times.push(context.queryTime);
      this.queryPerformance.set(queryHash, times.slice(-20)); // Keep last 20 executions
    }

    addBreadcrumb(
      'database-error',
      `Database ${operation} failed${table ? ` on table ${table}` : ''}`,
      'error',
      {
        operation,
        table,
        errorCode,
        queryTime: context.queryTime,
      }
    );

    return trackError(
      error,
      {
        severity,
        category,
        timestamp: new Date().toISOString(),
        tags: {
          operation,
          table: table || 'unknown',
          errorCode: errorCode || 'unknown',
          connectionPool: context.connectionPool || 'default',
          type: 'database-error',
        },
        performance: {
          dbQueryTime: context.queryTime,
        },
      },
      {
        table,
        query: context.query ? this.sanitizeQuery(context.query) : undefined,
        rowsAffected: context.rowsAffected,
        connectionIssuesInPool: this.connectionIssues.get(poolKey) || 0,
        averageQueryTime: this.getAverageQueryTime(context.query),
        ...context,
      }
    );
  }

  trackSlowQuery(query: string, executionTime: number, context: Partial<DatabaseErrorContext> = {}): void {
    if (executionTime > 1000) { // Slower than 1 second
      addBreadcrumb(
        'slow-query',
        `Slow query detected: ${executionTime}ms`,
        'warning',
        { executionTime, table: context.table }
      );

      this.trackDatabaseError(
        new Error(`Slow query: ${executionTime}ms`),
        {
          operation: 'read',
          queryTime: executionTime,
          query,
          ...context,
        }
      );
    }
  }

  private hashQuery(query: string): string {
    // Simple hash for query identification (remove parameters)
    const normalized = query.replace(/\$\d+|\?\?|\'/g, '?').replace(/\s+/g, ' ').trim();
    return normalized.substring(0, 100);
  }

  private sanitizeQuery(query: string): string {
    // Remove sensitive data from query for logging
    return query.replace(/'[^']*'/g, "'***'").replace(/\$\d+/g, '$?');
  }

  private getAverageQueryTime(query?: string): number | undefined {
    if (!query) return undefined;

    const queryHash = this.hashQuery(query);
    const times = this.queryPerformance.get(queryHash);
    if (!times || times.length === 0) return undefined;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
}

// ===== Rate Limiting Error Tracking =====

export interface RateLimitContext {
  identifier: string; // User ID, IP, or API key
  limit: number;
  window: number; // in seconds
  current: number;
  endpoint: string;
  limitType: 'user' | 'ip' | 'global' | 'endpoint';
  resetTime: number;
}

export class RateLimitTracker {
  private violationHistory = new Map<string, RateLimitViolation[]>();

  trackRateLimitViolation(context: RateLimitContext): string {
    const violations = this.violationHistory.get(context.identifier) || [];

    const violation: RateLimitViolation = {
      timestamp: Date.now(),
      endpoint: context.endpoint,
      current: context.current,
      limit: context.limit,
      window: context.window,
    };

    violations.push(violation);
    this.violationHistory.set(context.identifier, violations.slice(-10)); // Keep last 10

    // Determine severity based on violation pattern
    const recentViolations = this.getRecentViolations(context.identifier, 300000); // 5 minutes
    let severity = ErrorSeverity.LOW;
    if (recentViolations.length >= 3) severity = ErrorSeverity.MEDIUM;
    if (recentViolations.length >= 5) severity = ErrorSeverity.HIGH;
    if (context.current > context.limit * 5) severity = ErrorSeverity.HIGH;

    addBreadcrumb(
      'rate-limit',
      `Rate limit exceeded: ${context.current}/${context.limit} for ${context.endpoint}`,
      'warning',
      {
        identifier: context.identifier,
        endpoint: context.endpoint,
        current: context.current,
        limit: context.limit,
      }
    );

    return trackError(
      new Error(`Rate limit exceeded: ${context.current}/${context.limit}`),
      {
        severity,
        category: ErrorCategory.RATE_LIMIT,
        endpoint: context.endpoint,
        timestamp: new Date().toISOString(),
        tags: {
          limitType: context.limitType,
          identifier: context.identifier.substring(0, 8), // Partial identifier for privacy
          type: 'rate-limit-violation',
        },
      },
      {
        recentViolationCount: recentViolations.length,
        violationPattern: this.analyzeViolationPattern(violations),
        ...context,
      }
    );
  }

  private getRecentViolations(identifier: string, timeWindowMs: number): RateLimitViolation[] {
    const violations = this.violationHistory.get(identifier) || [];
    const cutoff = Date.now() - timeWindowMs;
    return violations.filter(v => v.timestamp >= cutoff);
  }

  private analyzeViolationPattern(violations: RateLimitViolation[]): string {
    if (violations.length < 2) return 'isolated';

    const recentViolations = violations.slice(-5);
    const timeDiffs = recentViolations.slice(1).map((v, i) => v.timestamp - recentViolations[i].timestamp);
    const averageInterval = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;

    if (averageInterval < 1000) return 'burst';
    if (averageInterval < 60000) return 'sustained';
    return 'periodic';
  }
}

interface RateLimitViolation {
  timestamp: number;
  endpoint: string;
  current: number;
  limit: number;
  window: number;
}

// ===== MCP Tool Error Tracking =====

export interface MCPToolContext {
  toolName: string;
  operation: string;
  providerId?: string;
  requestId?: string;
  timeoutMs?: number;
  retryAttempt?: number;
  maxRetries?: number;
  inputSize?: number;
  outputSize?: number;
}

export class MCPToolTracker {
  private toolReliability = new Map<string, ToolStats>();

  trackMCPToolError(error: Error, context: MCPToolContext): string {
    const { toolName, operation } = context;
    const toolKey = `${toolName}:${operation}`;

    // Update tool reliability stats
    const stats = this.toolReliability.get(toolKey) || { attempts: 0, failures: 0, averageTime: 0 };
    stats.failures++;
    stats.attempts++;
    this.toolReliability.set(toolKey, stats);

    // Determine severity
    let severity = ErrorSeverity.MEDIUM;
    const failureRate = stats.failures / stats.attempts;
    if (failureRate > 0.5) severity = ErrorSeverity.HIGH;
    if (context.retryAttempt && context.retryAttempt >= (context.maxRetries || 3)) {
      severity = ErrorSeverity.HIGH;
    }

    addBreadcrumb(
      'mcp-tool-error',
      `MCP tool failure: ${toolName}.${operation}`,
      'error',
      {
        toolName,
        operation,
        retryAttempt: context.retryAttempt,
        providerId: context.providerId,
      }
    );

    return trackError(
      error,
      {
        severity,
        category: ErrorCategory.MCP_TOOL,
        timestamp: new Date().toISOString(),
        tags: {
          toolName,
          operation,
          providerId: context.providerId || 'unknown',
          retryAttempt: String(context.retryAttempt || 0),
          type: 'mcp-tool-failure',
        },
        performance: {
          responseTime: context.timeoutMs,
        },
      },
      {
        toolReliability: failureRate,
        isRetryExhausted: (context.retryAttempt || 0) >= (context.maxRetries || 3),
        toolStats: stats,
        ...context,
      }
    );
  }

  trackMCPToolSuccess(context: MCPToolContext, executionTime: number): void {
    const { toolName, operation } = context;
    const toolKey = `${toolName}:${operation}`;

    // Update tool reliability stats
    const stats = this.toolReliability.get(toolKey) || { attempts: 0, failures: 0, averageTime: 0 };
    stats.attempts++;
    stats.averageTime = (stats.averageTime * (stats.attempts - 1) + executionTime) / stats.attempts;
    this.toolReliability.set(toolKey, stats);

    addBreadcrumb(
      'mcp-tool-success',
      `MCP tool success: ${toolName}.${operation} (${executionTime}ms)`,
      'info',
      { toolName, operation, executionTime }
    );
  }

  getToolReliabilityReport(): Record<string, ToolReliabilityReport> {
    const report: Record<string, ToolReliabilityReport> = {};

    for (const [toolKey, stats] of this.toolReliability.entries()) {
      const [toolName, operation] = toolKey.split(':');
      const successRate = stats.attempts > 0 ? ((stats.attempts - stats.failures) / stats.attempts) * 100 : 0;

      report[toolKey] = {
        toolName,
        operation,
        attempts: stats.attempts,
        failures: stats.failures,
        successRate,
        averageTime: stats.averageTime,
        reliability: this.classifyReliability(successRate),
      };
    }

    return report;
  }

  private classifyReliability(successRate: number): 'excellent' | 'good' | 'poor' | 'critical' {
    if (successRate >= 99) return 'excellent';
    if (successRate >= 95) return 'good';
    if (successRate >= 80) return 'poor';
    return 'critical';
  }
}

interface ToolStats {
  attempts: number;
  failures: number;
  averageTime: number;
}

interface ToolReliabilityReport {
  toolName: string;
  operation: string;
  attempts: number;
  failures: number;
  successRate: number;
  averageTime: number;
  reliability: 'excellent' | 'good' | 'poor' | 'critical';
}

// ===== Global Specialized Trackers =====

export const authErrorTracker = new AuthErrorTracker();
export const databaseErrorTracker = new DatabaseErrorTracker();
export const rateLimitTracker = new RateLimitTracker();
export const mcpToolTracker = new MCPToolTracker();

// Convenience functions for easy integration
export function trackAuthFailure(context: AuthErrorContext): string {
  return authErrorTracker.trackAuthFailure(context);
}

export function trackAuthSuccess(userId: string, ipAddress?: string): void {
  authErrorTracker.trackAuthSuccess(userId, ipAddress);
}

export function trackDatabaseError(error: Error, context: DatabaseErrorContext): string {
  return databaseErrorTracker.trackDatabaseError(error, context);
}

export function trackSlowQuery(query: string, executionTime: number, context?: Partial<DatabaseErrorContext>): void {
  databaseErrorTracker.trackSlowQuery(query, executionTime, context);
}

export function trackRateLimitViolation(context: RateLimitContext): string {
  return rateLimitTracker.trackRateLimitViolation(context);
}

export function trackMCPToolError(error: Error, context: MCPToolContext): string {
  return mcpToolTracker.trackMCPToolError(error, context);
}

export function trackMCPToolSuccess(context: MCPToolContext, executionTime: number): void {
  mcpToolTracker.trackMCPToolSuccess(context, executionTime);
}

export function getMCPToolReliability(): Record<string, ToolReliabilityReport> {
  return mcpToolTracker.getToolReliabilityReport();
}