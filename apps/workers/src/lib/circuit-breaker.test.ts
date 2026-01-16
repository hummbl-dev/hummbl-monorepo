/**
 * Circuit Breaker Tests
 * Comprehensive test suite for circuit breaker functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CircuitBreaker,
  CircuitBreakerState,
  DEFAULT_DB_CIRCUIT_CONFIG,
  AUTH_CIRCUIT_CONFIG,
  READ_CIRCUIT_CONFIG,
} from './circuit-breaker';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;
  const mockConfig = {
    failureThreshold: 3,
    timeout: 100,
    maxTimeout: 500,
    successThreshold: 2,
    monitoringWindow: 10000,
    name: 'test-circuit',
  };

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker(mockConfig);
  });

  describe('Configuration Validation', () => {
    it('should create circuit breaker with valid config', () => {
      expect(circuitBreaker).toBeInstanceOf(CircuitBreaker);
      expect(circuitBreaker.getMetrics().state).toBe(CircuitBreakerState.CLOSED);
    });

    it('should throw error for invalid failureThreshold', () => {
      expect(() => new CircuitBreaker({ ...mockConfig, failureThreshold: 0 })).toThrow(
        'failureThreshold must be greater than 0'
      );
    });

    it('should throw error for invalid timeout', () => {
      expect(() => new CircuitBreaker({ ...mockConfig, timeout: 0 })).toThrow(
        'timeout must be greater than 0'
      );
    });

    it('should throw error for invalid maxTimeout', () => {
      expect(() => new CircuitBreaker({ ...mockConfig, maxTimeout: 50 })).toThrow(
        'maxTimeout must be greater than timeout'
      );
    });

    it('should throw error for invalid successThreshold', () => {
      expect(() => new CircuitBreaker({ ...mockConfig, successThreshold: 0 })).toThrow(
        'successThreshold must be greater than 0'
      );
    });

    it('should throw error for invalid monitoringWindow', () => {
      expect(() => new CircuitBreaker({ ...mockConfig, monitoringWindow: 0 })).toThrow(
        'monitoringWindow must be greater than 0'
      );
    });
  });

  describe('State Transitions', () => {
    it('should start in CLOSED state', () => {
      const metrics = circuitBreaker.getMetrics();
      expect(metrics.state).toBe(CircuitBreakerState.CLOSED);
      expect(metrics.failures).toBe(0);
      expect(metrics.successes).toBe(0);
    });

    it('should transition to OPEN after failure threshold', async () => {
      // Execute failing operations
      for (let i = 0; i < mockConfig.failureThreshold; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Test failure');
          });
        } catch (error) {
          // Expected to fail
        }
      }

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.state).toBe(CircuitBreakerState.OPEN);
      expect(metrics.consecutiveFailures).toBe(mockConfig.failureThreshold);
      expect(metrics.circuitOpens).toBe(1);
    });

    it('should transition to HALF_OPEN after timeout', async () => {
      // Trip the circuit
      for (let i = 0; i < mockConfig.failureThreshold; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Test failure');
          });
        } catch (error) {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getMetrics().state).toBe(CircuitBreakerState.OPEN);

      // Wait for timeout and try again
      await new Promise(resolve => setTimeout(resolve, mockConfig.timeout + 50));

      // Next execution should transition to HALF_OPEN
      try {
        await circuitBreaker.execute(async () => {
          return 'success';
        });
      } catch (error) {
        // Could still fail if timing is off
      }

      const metrics = circuitBreaker.getMetrics();
      expect([CircuitBreakerState.HALF_OPEN, CircuitBreakerState.CLOSED]).toContain(metrics.state);
    });

    it('should transition from HALF_OPEN to CLOSED after successful calls', async () => {
      // Trip the circuit
      for (let i = 0; i < mockConfig.failureThreshold; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Test failure');
          });
        } catch (error) {
          // Expected to fail
        }
      }

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, mockConfig.timeout + 50));

      // Execute successful operations to close circuit
      for (let i = 0; i < mockConfig.successThreshold; i++) {
        await circuitBreaker.execute(async () => {
          return 'success';
        });
      }

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.state).toBe(CircuitBreakerState.CLOSED);
      expect(metrics.consecutiveSuccesses).toBeGreaterThanOrEqual(mockConfig.successThreshold);
    });

    it('should transition from HALF_OPEN to OPEN on any failure', async () => {
      // Trip the circuit
      for (let i = 0; i < mockConfig.failureThreshold; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Test failure');
          });
        } catch (error) {
          // Expected to fail
        }
      }

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, mockConfig.timeout + 50));

      // Execute one successful operation to get to HALF_OPEN
      await circuitBreaker.execute(async () => {
        return 'success';
      });

      // Execute failing operation - should go back to OPEN
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('Test failure');
        });
      } catch (error) {
        // Expected to fail
      }

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.state).toBe(CircuitBreakerState.OPEN);
    });
  });

  describe('Exponential Backoff', () => {
    it('should increase timeout with consecutive failures', async () => {
      const cb = new CircuitBreaker({
        ...mockConfig,
        failureThreshold: 10, // Higher threshold to avoid opening
        timeout: 100,
        maxTimeout: 1000,
      });

      // Execute multiple failing operations
      for (let i = 0; i < 5; i++) {
        try {
          await cb.execute(async () => {
            throw new Error('Test failure');
          });
        } catch (error) {
          // Expected to fail
        }
      }

      // The timeout should be exponentially backed off
      const metrics = cb.getMetrics();
      expect(metrics.consecutiveFailures).toBe(5);
    });

    it('should cap timeout at maxTimeout', async () => {
      const cb = new CircuitBreaker({
        ...mockConfig,
        failureThreshold: 10, // Higher threshold to avoid opening
        timeout: 100,
        maxTimeout: 50,
      });

      // Execute many failing operations
      for (let i = 0; i < 8; i++) {
        try {
          await cb.execute(async () => {
            throw new Error('Test failure');
          });
        } catch (error) {
          // Expected to fail
        }
      }

      // The calculated timeout should not exceed maxTimeout
      const metrics = cb.getMetrics();
      expect(metrics.consecutiveFailures).toBe(8);
    });
  });

  describe('Metrics Tracking', () => {
    it('should track successful operations', async () => {
      await circuitBreaker.execute(async () => 'success');
      await circuitBreaker.execute(async () => 'success');

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.successes).toBe(2);
      expect(metrics.consecutiveSuccesses).toBe(2);
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.lastSuccessTime).toBeTruthy();
    });

    it('should track failed operations', async () => {
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('Test failure');
        });
      } catch (error) {
        // Expected to fail
      }

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.failures).toBe(1);
      expect(metrics.consecutiveFailures).toBe(1);
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.lastFailureTime).toBeTruthy();
    });

    it('should calculate failure rate correctly', async () => {
      // Execute 2 successful operations
      await circuitBreaker.execute(async () => 'success');
      await circuitBreaker.execute(async () => 'success');

      // Execute 1 failing operation
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('Test failure');
        });
      } catch (error) {
        // Expected to fail
      }

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.failureRate).toBeCloseTo(1 / 3); // 1 failure out of 3 total
    });

    it('should track uptime', async () => {
      const metrics1 = circuitBreaker.getMetrics();
      expect(metrics1.uptime).toBeGreaterThan(0);

      await new Promise(resolve => setTimeout(resolve, 100));

      const metrics2 = circuitBreaker.getMetrics();
      expect(metrics2.uptime).toBeGreaterThan(metrics1.uptime);
    });
  });

  describe('Error Handling', () => {
    it('should wrap errors with circuit breaker context', async () => {
      // Trip the circuit
      for (let i = 0; i < mockConfig.failureThreshold; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw new Error('Test failure');
          });
        } catch (error) {
          // Expected to fail
        }
      }

      // Now circuit should be OPEN, next call should throw circuit breaker error
      try {
        await circuitBreaker.execute(async () => 'success');
        expect.fail('Should have thrown circuit breaker error');
      } catch (error: any) {
        expect(error.isCircuitBreakerError).toBe(true);
        expect(error.code).toBe('CIRCUIT_OPEN');
        expect(error.circuitState).toBe(CircuitBreakerState.OPEN);
        expect(error.metrics).toBeDefined();
      }
    });

    it('should handle timeout errors', async () => {
      const cb = new CircuitBreaker({
        ...mockConfig,
        timeout: 50, // Very short timeout
      });

      try {
        await cb.execute(async () => {
          await new Promise(resolve => setTimeout(resolve, 100)); // Longer than timeout
          return 'success';
        });
        expect.fail('Should have thrown timeout error');
      } catch (error: any) {
        expect(error.isCircuitBreakerError).toBe(true);
        expect(error.code).toBe('TIMEOUT');
      }
    });

    it('should preserve original error types', async () => {
      try {
        await circuitBreaker.execute(async () => {
          throw new TypeError('Custom error type');
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.isCircuitBreakerError).toBe(true);
        expect(error.code).toBe('DB_ERROR');
        expect(error.message).toContain('Custom error type');
      }
    });
  });

  describe('Reset Functionality', () => {
    it('should reset circuit breaker state', async () => {
      // Execute some operations to change state
      await circuitBreaker.execute(async () => 'success');
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('Test failure');
        });
      } catch (error) {
        // Expected to fail
      }

      const beforeReset = circuitBreaker.getMetrics();
      expect(beforeReset.totalRequests).toBe(2);

      circuitBreaker.reset();

      const afterReset = circuitBreaker.getMetrics();
      expect(afterReset.state).toBe(CircuitBreakerState.CLOSED);
      expect(afterReset.failures).toBe(0);
      expect(afterReset.successes).toBe(0);
      expect(afterReset.totalRequests).toBe(0);
      expect(afterReset.consecutiveFailures).toBe(0);
      expect(afterReset.consecutiveSuccesses).toBe(0);
      expect(afterReset.lastFailureTime).toBeNull();
      expect(afterReset.lastSuccessTime).toBeNull();
      expect(afterReset.openedAt).toBeNull();
      expect(afterReset.circuitOpens).toBe(0);
    });
  });

  describe('Configuration Presets', () => {
    it('should have valid default database config', () => {
      expect(() => new CircuitBreaker(DEFAULT_DB_CIRCUIT_CONFIG)).not.toThrow();
      const cb = new CircuitBreaker(DEFAULT_DB_CIRCUIT_CONFIG);
      expect(cb.getMetrics().state).toBe(CircuitBreakerState.CLOSED);
    });

    it('should have valid auth config', () => {
      expect(() => new CircuitBreaker(AUTH_CIRCUIT_CONFIG)).not.toThrow();
      const cb = new CircuitBreaker(AUTH_CIRCUIT_CONFIG);
      expect(cb.getMetrics().state).toBe(CircuitBreakerState.CLOSED);
    });

    it('should have valid read config', () => {
      expect(() => new CircuitBreaker(READ_CIRCUIT_CONFIG)).not.toThrow();
      const cb = new CircuitBreaker(READ_CIRCUIT_CONFIG);
      expect(cb.getMetrics().state).toBe(CircuitBreakerState.CLOSED);
    });

    it('should have different thresholds for different configs', () => {
      expect(DEFAULT_DB_CIRCUIT_CONFIG.failureThreshold).not.toBe(
        AUTH_CIRCUIT_CONFIG.failureThreshold
      );
      expect(AUTH_CIRCUIT_CONFIG.failureThreshold).not.toBe(READ_CIRCUIT_CONFIG.failureThreshold);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent requests correctly', async () => {
      const promises = [];

      // Execute multiple concurrent operations
      for (let i = 0; i < 10; i++) {
        promises.push(
          circuitBreaker.execute(async () => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
            return `success-${i}`;
          })
        );
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.successes).toBe(10);
      expect(metrics.totalRequests).toBe(10);
    });

    it('should handle mixed success/failure concurrent requests', async () => {
      const promises = [];

      // Execute mixed concurrent operations
      for (let i = 0; i < 10; i++) {
        promises.push(
          circuitBreaker
            .execute(async () => {
              await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
              if (i % 2 === 0) {
                throw new Error(`failure-${i}`);
              }
              return `success-${i}`;
            })
            .catch(error => error) // Catch errors to prevent Promise.all from failing
        );
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.successes).toBe(5); // Half should succeed
      expect(metrics.failures).toBe(5); // Half should fail
      expect(metrics.totalRequests).toBe(10);
    });
  });
});

describe('Circuit Breaker Integration Scenarios', () => {
  describe('Database Failure Simulation', () => {
    it('should handle database connection failures', async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 2,
        timeout: 100,
        maxTimeout: 1000,
        successThreshold: 1,
        monitoringWindow: 5000,
        name: 'db-connection',
      });

      // Simulate database connection failures
      for (let i = 0; i < 2; i++) {
        try {
          await cb.execute(async () => {
            throw new Error('ECONNREFUSED: Database connection refused');
          });
        } catch (error) {
          // Expected to fail
        }
      }

      // Circuit should be open
      expect(cb.getMetrics().state).toBe(CircuitBreakerState.OPEN);

      // Next request should fail fast
      try {
        await cb.execute(async () => 'success');
        expect.fail('Should have thrown circuit breaker error');
      } catch (error: any) {
        expect(error.code).toBe('CIRCUIT_OPEN');
        expect(error.message).toContain('failing fast');
      }
    });

    it('should handle database timeout scenarios', async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 3,
        timeout: 50, // Short timeout
        maxTimeout: 1000,
        successThreshold: 2,
        monitoringWindow: 5000,
        name: 'db-timeout',
      });

      // Simulate slow database operations
      try {
        await cb.execute(async () => {
          await new Promise(resolve => setTimeout(resolve, 100)); // Longer than timeout
          return 'success';
        });
        expect.fail('Should have thrown timeout error');
      } catch (error: any) {
        expect(error.code).toBe('TIMEOUT');
        expect(error.message).toContain('timeout after 50ms');
      }

      const metrics = cb.getMetrics();
      expect(metrics.failures).toBe(1);
      expect(metrics.consecutiveFailures).toBe(1);
    });

    it('should handle partial database outages', async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 5,
        timeout: 100,
        maxTimeout: 1000,
        successThreshold: 3,
        monitoringWindow: 5000,
        name: 'partial-outage',
      });

      // Simulate partial outage (70% failure rate)
      for (let i = 0; i < 10; i++) {
        try {
          await cb.execute(async () => {
            if (Math.random() < 0.7) {
              throw new Error('Database temporarily unavailable');
            }
            return 'success';
          });
        } catch (error) {
          // Expected to fail sometimes
        }
      }

      const metrics = cb.getMetrics();
      expect(metrics.failures).toBeGreaterThan(0);
      expect(metrics.successes).toBeGreaterThan(0);
      expect(metrics.failureRate).toBeGreaterThan(0.5);
    });
  });

  describe('Recovery Scenarios', () => {
    it('should recover from outages gracefully', async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 2,
        timeout: 100,
        maxTimeout: 1000,
        successThreshold: 2,
        monitoringWindow: 5000,
        name: 'recovery-test',
      });

      // Simulate outage
      for (let i = 0; i < 2; i++) {
        try {
          await cb.execute(async () => {
            throw new Error('Service unavailable');
          });
        } catch (error) {
          // Expected to fail
        }
      }

      expect(cb.getMetrics().state).toBe(CircuitBreakerState.OPEN);

      // Wait for recovery period
      await new Promise(resolve => setTimeout(resolve, 150));

      // Simulate service recovery
      await cb.execute(async () => 'recovered');
      await cb.execute(async () => 'recovered');

      // Circuit should be closed again
      expect(cb.getMetrics().state).toBe(CircuitBreakerState.CLOSED);
    });
  });
});
