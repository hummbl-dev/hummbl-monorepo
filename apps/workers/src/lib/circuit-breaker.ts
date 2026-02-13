/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * Circuit Breaker Pattern Implementation for Database Resilience

import { createLogger } from '@hummbl/core';

const logger = createLogger('circuit-breaker');
 *
 * Protects against cascading failures during database outages by:
 * - Failing fast when database is unavailable
 * - Providing exponential backoff for retry attempts
 * - Tracking failure/success metrics
 * - Graceful degradation with fallback responses
 */

export enum CircuitBreakerState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Circuit tripped, failing fast
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** How long circuit stays open (ms) */
  timeout: number;
  /** Maximum timeout with exponential backoff (ms) */
  maxTimeout: number;
  /** Number of successful calls needed to close circuit from half-open */
  successThreshold: number;
  /** Monitor window for failure rate calculation (ms) */
  monitoringWindow: number;
  /** Name for logging and metrics */
  name: string;
}

export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failures: number;
  successes: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  openedAt: number | null;
  totalRequests: number;
  circuitOpens: number;
  failureRate: number;
  uptime: number;
}

export interface CircuitBreakerError extends Error {
  code: 'CIRCUIT_OPEN' | 'DB_ERROR' | 'TIMEOUT';
  isCircuitBreakerError: true;
  circuitState: CircuitBreakerState;
  metrics: CircuitBreakerMetrics;
}

/**
 * Creates a circuit breaker error with proper typing
 */
function createCircuitBreakerError(
  message: string,
  code: CircuitBreakerError['code'],
  circuitState: CircuitBreakerState,
  metrics: CircuitBreakerMetrics
): CircuitBreakerError {
  const error = new Error(message) as CircuitBreakerError;
  error.code = code;
  error.isCircuitBreakerError = true;
  error.circuitState = circuitState;
  error.metrics = { ...metrics };
  return error;
}

/**
 * Circuit Breaker implementation with exponential backoff and metrics
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures = 0;
  private successes = 0;
  private consecutiveFailures = 0;
  private consecutiveSuccesses = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private openedAt: number | null = null;
  private totalRequests = 0;
  private circuitOpens = 0;
  private readonly createdAt = Date.now();

  constructor(private config: CircuitBreakerConfig) {
    // Validate configuration
    if (config.failureThreshold <= 0) {
      throw new Error('failureThreshold must be greater than 0');
    }
    if (config.timeout <= 0) {
      throw new Error('timeout must be greater than 0');
    }
    if (config.maxTimeout <= config.timeout) {
      throw new Error('maxTimeout must be greater than timeout');
    }
    if (config.successThreshold <= 0) {
      throw new Error('successThreshold must be greater than 0');
    }
    if (config.monitoringWindow <= 0) {
      throw new Error('monitoringWindow must be greater than 0');
    }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit should transition states
    this.updateState();

    // If circuit is open, fail fast
    if (this.state === CircuitBreakerState.OPEN) {
      const error = createCircuitBreakerError(
        `Circuit breaker is OPEN for ${this.config.name}. Database operations are currently failing fast to prevent cascading failures.`,
        'CIRCUIT_OPEN',
        this.state,
        this.getMetrics()
      );
      this.logError(error);
      throw error;
    }

    try {
      // Execute the function
      const result = await this.executeWithTimeout(fn);

      // Record success
      this.onSuccess();
      this.updateState(); // Check if we should transition to CLOSED
      return result;
    } catch (error) {
      // Record failure
      this.onFailure(error);

      // Wrap and re-throw the error with circuit breaker context
      if (this.isCircuitBreakerError(error)) {
        throw err;
      }

      const cbError = createCircuitBreakerError(
        `Database operation failed in ${this.config.name}: ${error instanceof Error ? error.message : String(error)}`,
        'DB_ERROR',
        this.state,
        this.getMetrics()
      );
      this.logError(cbError, error);
      throw cbError;
    }
  }

  /**
   * Execute function with timeout protection
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    const timeoutMs = this.getTimeoutWithBackoff();

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const error = createCircuitBreakerError(
          `Database operation timeout after ${timeoutMs}ms in ${this.config.name}`,
          'TIMEOUT',
          this.state,
          this.getMetrics()
        );
        reject(error);
      }, timeoutMs);

      fn()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Calculate timeout with exponential backoff
   */
  private getTimeoutWithBackoff(): number {
    if (this.consecutiveFailures === 0) {
      return this.config.timeout;
    }

    // Exponential backoff: timeout * 2^failures (capped at maxTimeout)
    const backoffMultiplier = Math.pow(2, Math.min(this.consecutiveFailures - 1, 10)); // Cap at 2^10
    const timeoutWithBackoff = this.config.timeout * backoffMultiplier;

    return Math.min(timeoutWithBackoff, this.config.maxTimeout);
  }

  /**
   * Update circuit breaker state based on current conditions
   */
  private updateState(): void {
    // const now = Date.now();

    switch (this.state) {
      case CircuitBreakerState.CLOSED:
        // Check if we should open the circuit
        if (this.consecutiveFailures >= this.config.failureThreshold) {
          this.openCircuit(Date.now());
        }
        break;

      case CircuitBreakerState.OPEN:
        // Check if timeout has elapsed to try half-open
        if (this.openedAt && Date.now() - this.openedAt >= this.config.timeout) {
          this.state = CircuitBreakerState.HALF_OPEN;
          this.consecutiveSuccesses = 0;
          this.logStateChange('HALF_OPEN', 'Timeout elapsed, testing if service recovered');
        }
        break;

      case CircuitBreakerState.HALF_OPEN:
        // Check if we should close (enough successes) or open (any failure)
        if (this.consecutiveSuccesses >= this.config.successThreshold) {
          this.closeCircuit(Date.now());
        }
        break;
    }
  }

  /**
   * Open the circuit breaker
   */
  private openCircuit(now: number): void {
    this.state = CircuitBreakerState.OPEN;
    this.openedAt = now;
    this.circuitOpens++;
    this.consecutiveSuccesses = 0;
    this.logStateChange(
      'OPEN',
      `Circuit opened due to ${this.consecutiveFailures} consecutive failures`
    );
  }

  /**
   * Close the circuit breaker
   */
  private closeCircuit(_now: number): void {
    this.state = CircuitBreakerState.CLOSED;
    this.openedAt = null;
    this.consecutiveFailures = 0;
    this.logStateChange(
      'CLOSED',
      `Circuit closed after ${this.consecutiveSuccesses} consecutive successes`
    );
  }

  /**
   * Record successful operation
   */
  private onSuccess(): void {
    this.successes++;
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;
    this.lastSuccessTime = Date.now();
  }

  /**
   * Record failed operation
   */
  private onFailure(_error: unknown): void {
    this.failures++;
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = Date.now();

    // If in half-open state, immediately open on any failure
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.openCircuit(Date.now());
    }

    // Check if we should open the circuit due to consecutive failures
    if (
      this.state === CircuitBreakerState.CLOSED &&
      this.consecutiveFailures >= this.config.failureThreshold
    ) {
      this.openCircuit(Date.now());
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    // const now = Date.now();
    const uptime = Date.now() - this.createdAt;
    const failureRate = this.totalRequests > 0 ? this.failures / this.totalRequests : 0;

    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      openedAt: this.openedAt,
      totalRequests: this.totalRequests,
      circuitOpens: this.circuitOpens,
      failureRate,
      uptime,
    };
  }

  /**
   * Check if error is a circuit breaker error
   */
  private isCircuitBreakerError(error: unknown): error is CircuitBreakerError {
    return error instanceof Error && 'isCircuitBreakerError' in error;
  }

  /**
   * Log state changes
   */
  private logStateChange(newState: string, reason: string): void {
    const metrics = this.getMetrics();
    logger.warn(`State changed to ${newState}: ${reason}`, {
      metrics: {
        failureRate: metrics.failureRate.toFixed(3),
        totalRequests: metrics.totalRequests,
        failures: metrics.failures,
        successes: metrics.successes,
        consecutiveFailures: metrics.consecutiveFailures,
        uptime: `${(metrics.uptime / 1000).toFixed(1)}s`,
      },
    });
  }

  /**
   * Log errors with context
   */
  private logError(error: CircuitBreakerError, cause?: unknown): void {
    logger.error(`${error.message}`, {
      code: error.code,
      state: error.circuitState,
      cause:
        cause instanceof Error
          ? {
              name: cause.name,
              message: cause.message,
              stack: cause.stack?.substring(0, 500),
            }
          : String(cause).substring(0, 200),
      metrics: {
        failureRate: error.metrics.failureRate.toFixed(3),
        consecutiveFailures: error.metrics.consecutiveFailures,
        totalRequests: error.metrics.totalRequests,
      },
    });
  }

  /**
   * Reset circuit breaker to initial state (for testing)
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.openedAt = null;
    this.totalRequests = 0;
    this.circuitOpens = 0;
  }
}

/**
 * Default circuit breaker configuration for database operations
 */
export const DEFAULT_DB_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5, // Open after 5 consecutive failures
  timeout: 10000, // 10 second timeout
  maxTimeout: 60000, // Max 1 minute with backoff
  successThreshold: 3, // Close after 3 consecutive successes
  monitoringWindow: 60000, // 1 minute monitoring window
  name: 'database',
};

/**
 * Circuit breaker configuration for authentication operations (more lenient)
 */
export const AUTH_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 10, // Open after 10 failures (auth is critical)
  timeout: 5000, // 5 second timeout
  maxTimeout: 30000, // Max 30 seconds with backoff
  successThreshold: 2, // Close after 2 successes
  monitoringWindow: 30000, // 30 second monitoring window
  name: 'auth-database',
};

/**
 * Circuit breaker configuration for read operations (most lenient)
 */
export const READ_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3, // Open after 3 failures (reads can fail fast)
  timeout: 3000, // 3 second timeout
  maxTimeout: 15000, // Max 15 seconds with backoff
  successThreshold: 2, // Close after 2 successes
  monitoringWindow: 30000, // 30 second monitoring window
  name: 'read-database',
};
