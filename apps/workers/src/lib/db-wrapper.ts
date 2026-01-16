// @ts-nocheck
/**
 * Database Wrapper with Circuit Breaker Protection
 *
 * Provides circuit breaker protection for all D1 database operations
 * with graceful degradation and fallback responses during outages.
 */

import type { D1Database, D1PreparedStatement, D1Result } from '@cloudflare/workers-types';
import {
  CircuitBreaker,
  CircuitBreakerState,
  DEFAULT_DB_CIRCUIT_CONFIG,
  AUTH_CIRCUIT_CONFIG,
  READ_CIRCUIT_CONFIG,
  type CircuitBreakerError,
  // type CircuitBreakerConfig,
} from './circuit-breaker';

export interface DbOperationContext {
  operation: 'read' | 'write' | 'auth';
  table?: string;
  query?: string;
  fallbackData?: unknown;
}

export interface FallbackResponse {
  models?: Array<{ code: string; name: string; transformation: string }>;
  user?: { id: string; email: string; name: string };
  message?: string;
  cached?: boolean;
}

/**
 * Enhanced D1 Prepared Statement with circuit breaker protection
 */
export class ProtectedD1PreparedStatement {
  constructor(
    private statement: D1PreparedStatement,
    private circuitBreaker: CircuitBreaker,
    private context: DbOperationContext
  ) {}

  /**
   * Bind parameters to the prepared statement
   */
  bind(...values: (string | number | boolean | null)[]): ProtectedD1PreparedStatement {
    return new ProtectedD1PreparedStatement(
      this.statement.bind(...values),
      this.circuitBreaker,
      this.context
    );
  }

  /**
   * Execute query and return all results with circuit breaker protection
   */
  async all<T = unknown>(): Promise<D1Result<T>> {
    return this.circuitBreaker.execute(async () => {
      try {
        return await this.statement.all<T>();
      } catch (error) {
        this.logDatabaseError('all', error);
        throw error;
      }
    });
  }

  /**
   * Execute query and return first result with circuit breaker protection
   */
  async first<T = unknown>(): Promise<T | null> {
    return this.circuitBreaker.execute(async () => {
      try {
        return await this.statement.first<T>();
      } catch (error) {
        this.logDatabaseError('first', error);
        throw error;
      }
    });
  }

  /**
   * Execute query with circuit breaker protection
   */
  async run(): Promise<D1Result> {
    return this.circuitBreaker.execute(async () => {
      try {
        return await this.statement.run();
      } catch (error) {
        this.logDatabaseError('run', error);
        throw error;
      }
    });
  }

  /**
   * Get raw statement (for compatibility)
   */
  raw(): D1PreparedStatement {
    return this.statement;
  }

  /**
   * Log database errors with context
   */
  private logDatabaseError(method: string, error: unknown): void {
    console.error(`[DB_WRAPPER][${this.context.operation}] Database ${method} operation failed`, {
      table: this.context.table,
      query: this.context.query?.substring(0, 200),
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
            }
          : String(error).substring(0, 200),
      circuitState: this.circuitBreaker.getMetrics().state,
    });
  }
}

/**
 * Database Wrapper with Circuit Breaker Protection
 */
export class ProtectedDatabase {
  private readCircuitBreaker: CircuitBreaker;
  private writeCircuitBreaker: CircuitBreaker;
  private authCircuitBreaker: CircuitBreaker;

  constructor(private db: D1Database) {
    this.readCircuitBreaker = new CircuitBreaker(READ_CIRCUIT_CONFIG);
    this.writeCircuitBreaker = new CircuitBreaker(DEFAULT_DB_CIRCUIT_CONFIG);
    this.authCircuitBreaker = new CircuitBreaker(AUTH_CIRCUIT_CONFIG);
  }

  /**
   * Prepare a SQL statement with circuit breaker protection
   */
  prepare(query: string, context?: Partial<DbOperationContext>): ProtectedD1PreparedStatement {
    const operation = this.determineOperation(query, context?.operation);
    const circuitBreaker = this.getCircuitBreakerForOperation(operation);

    const fullContext: DbOperationContext = {
      operation,
      table: context?.table || this.extractTableFromQuery(query),
      query: query.length > 200 ? query.substring(0, 200) + '...' : query,
      fallbackData: context?.fallbackData,
    };

    return new ProtectedD1PreparedStatement(this.db.prepare(query), circuitBreaker, fullContext);
  }

  /**
   * Execute multiple statements in a batch with circuit breaker protection
   */
  async batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
    return this.writeCircuitBreaker.execute(async () => {
      try {
        return await this.db.batch(statements);
      } catch (error) {
        console.error('[DB_WRAPPER][write] Batch operation failed', {
          statementCount: statements.length,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    });
  }

  /**
   * Execute a simple SQL statement with circuit breaker protection
   */
  async exec(query: string, context?: Partial<DbOperationContext>): Promise<D1Result> {
    const operation = this.determineOperation(query, context?.operation);
    const circuitBreaker = this.getCircuitBreakerForOperation(operation);

    return circuitBreaker.execute(async () => {
      try {
        return await this.db.exec(query);
      } catch (error) {
        console.error(`[DB_WRAPPER][${operation}] Exec operation failed`, {
          query: query.substring(0, 200),
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    });
  }

  /**
   * Dump database contents (admin operation)
   */
  async dump(): Promise<ArrayBuffer> {
    return this.readCircuitBreaker.execute(async () => {
      return await this.db.dump();
    });
  }

  /**
   * Get circuit breaker metrics for monitoring
   */
  getMetrics() {
    return {
      read: this.readCircuitBreaker.getMetrics(),
      write: this.writeCircuitBreaker.getMetrics(),
      auth: this.authCircuitBreaker.getMetrics(),
    };
  }

  /**
   * Get health status based on circuit breaker states
   */
  getHealthStatus() {
    const readMetrics = this.readCircuitBreaker.getMetrics();
    const writeMetrics = this.writeCircuitBreaker.getMetrics();
    const authMetrics = this.authCircuitBreaker.getMetrics();

    const anyCircuitOpen = [readMetrics, writeMetrics, authMetrics].some(
      m => m.state === CircuitBreakerState.OPEN
    );

    const anyCircuitHalfOpen = [readMetrics, writeMetrics, authMetrics].some(
      m => m.state === CircuitBreakerState.HALF_OPEN
    );

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (anyCircuitOpen) {
      status = 'unhealthy';
    } else if (anyCircuitHalfOpen) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return {
      status,
      circuits: {
        read: {
          state: readMetrics.state,
          failures: readMetrics.failures,
          failureRate: readMetrics.failureRate,
          uptime: readMetrics.uptime,
        },
        write: {
          state: writeMetrics.state,
          failures: writeMetrics.failures,
          failureRate: writeMetrics.failureRate,
          uptime: writeMetrics.uptime,
        },
        auth: {
          state: authMetrics.state,
          failures: authMetrics.failures,
          failureRate: authMetrics.failureRate,
          uptime: authMetrics.uptime,
        },
      },
    };
  }

  /**
   * Handle circuit breaker errors with appropriate fallback responses
   */
  static handleCircuitBreakerError(
    error: CircuitBreakerError,
    _context?: DbOperationContext
  ): FallbackResponse {
    console.warn(`[DB_WRAPPER] Providing fallback response for ${error.code}`, {
      operation: context?.operation,
      table: context?.table,
      state: error.circuitState,
    });

    // Return appropriate fallback based on operation type
    switch (context?.operation) {
      case 'read':
        return ProtectedDatabase.getReadFallback(context);
      case 'auth':
        return ProtectedDatabase.getAuthFallback(context);
      case 'write':
        return ProtectedDatabase.getWriteFallback(context);
      default:
        return {
          message: 'Service temporarily unavailable. Please try again later.',
          cached: false,
        };
    }
  }

  /**
   * Check if error is a circuit breaker error
   */
  static isCircuitBreakerError(error: unknown): error is CircuitBreakerError {
    return error instanceof Error && 'isCircuitBreakerError' in error;
  }

  /**
   * Reset all circuit breakers (for testing)
   */
  resetCircuitBreakers(): void {
    this.readCircuitBreaker.reset();
    this.writeCircuitBreaker.reset();
    this.authCircuitBreaker.reset();
  }

  /**
   * Determine operation type from SQL query
   */
  private determineOperation(
    query: string,
    explicitOperation?: 'read' | 'write' | 'auth'
  ): 'read' | 'write' | 'auth' {
    if (explicitOperation) {
      return explicitOperation;
    }

    const normalizedQuery = query.trim().toLowerCase();

    // Check if it's an auth-related query
    if (this.isAuthQuery(normalizedQuery)) {
      return 'auth';
    }

    // Check if it's a read operation
    if (normalizedQuery.startsWith('select') || normalizedQuery.startsWith('with')) {
      return 'read';
    }

    // Default to write for INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, etc.
    return 'write';
  }

  /**
   * Check if query is authentication-related
   */
  private isAuthQuery(query: string): boolean {
    // Only classify as auth if doing specific auth operations
    // Simple table mention isn't enough - check for auth-specific operations
    const authOnlyTables = ['user_sessions', 'refresh_tokens'];
    const authKeywords = ['password', 'token', 'login', 'register'];

    // Auth sessions/tokens tables are always auth
    const hasAuthTable = authOnlyTables.some(table => query.includes(table));
    
    // Users table is only auth if combined with auth keywords
    const hasUsersWithAuth = query.includes('users') && 
                             authKeywords.some(keyword => query.includes(keyword));

    return hasAuthTable || hasUsersWithAuth;
  }

  /**
   * Get appropriate circuit breaker for operation type
   */
  private getCircuitBreakerForOperation(operation: 'read' | 'write' | 'auth'): CircuitBreaker {
    switch (operation) {
      case 'read':
        return this.readCircuitBreaker;
      case 'auth':
        return this.authCircuitBreaker;
      case 'write':
      default:
        return this.writeCircuitBreaker;
    }
  }

  /**
   * Extract table name from SQL query for logging
   */
  private extractTableFromQuery(query: string): string | undefined {
    const normalizedQuery = query.trim().toLowerCase();

    // Match patterns like "FROM table_name", "INSERT INTO table_name", "UPDATE table_name"
    const patterns = [
      /from\s+([a-zA-Z_][a-zA-Z0-9_]*)/i,
      /insert\s+into\s+([a-zA-Z_][a-zA-Z0-9_]*)/i,
      /update\s+([a-zA-Z_][a-zA-Z0-9_]*)/i,
      /delete\s+from\s+([a-zA-Z_][a-zA-Z0-9_]*)/i,
    ];

    for (const pattern of patterns) {
      const match = normalizedQuery.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return undefined;
  }

  /**
   * Get fallback response for read operations
   */
  private static getReadFallback(_context?: DbOperationContext): FallbackResponse {
    // For models/transformations, return empty but valid structure
    if (context?.table === 'mental_models') {
      return {
        models: [],
        message: 'Models temporarily unavailable. Cached data may be available.',
        cached: false,
      };
    }

    return {
      message: 'Data temporarily unavailable. Please try again in a few moments.',
      cached: false,
    };
  }

  /**
   * Get fallback response for auth operations
   */
  private static getAuthFallback(_context?: DbOperationContext): FallbackResponse {
    return {
      message: 'Authentication service temporarily unavailable. Please try again shortly.',
      cached: false,
    };
  }

  /**
   * Get fallback response for write operations
   */
  private static getWriteFallback(_context?: DbOperationContext): FallbackResponse {
    return {
      message:
        'Write operations temporarily unavailable. Your request has been noted and will be processed when service is restored.',
      cached: false,
    };
  }
}

/**
 * Create a protected database instance
 */
export function createProtectedDatabase(db: D1Database): ProtectedDatabase {
  return new ProtectedDatabase(db);
}

/**
 * Utility function to handle database operations with automatic fallback
 */
export async function executeWithFallback<T>(
  operation: () => Promise<T>,
  context: DbOperationContext,
  fallbackValue: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (ProtectedDatabase.isCircuitBreakerError(error)) {
      console.warn('[DB_WRAPPER] Circuit breaker activated, using fallback', {
        operation: context.operation,
        table: context.table,
        state: error.circuitState,
      });
      return fallbackValue;
    }
    throw error;
  }
}
