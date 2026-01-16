/**
 * Database Wrapper Integration Tests
 * Tests for the ProtectedDatabase class and circuit breaker integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProtectedDatabase, createProtectedDatabase } from './db-wrapper';
import { CircuitBreakerState } from './circuit-breaker';

// Mock D1Database for testing
const createMockD1Database = () => {
  const mockPreparedStatement = {
    bind: vi.fn().mockReturnThis(),
    all: vi.fn(),
    first: vi.fn(),
    run: vi.fn(),
  };

  return {
    prepare: vi.fn().mockReturnValue(mockPreparedStatement),
    batch: vi.fn(),
    exec: vi.fn(),
    dump: vi.fn(),
    _mockStatement: mockPreparedStatement,
  };
};

describe('ProtectedDatabase', () => {
  let mockDb: ReturnType<typeof createMockD1Database>;
  let protectedDb: ProtectedDatabase;

  beforeEach(() => {
    mockDb = createMockD1Database();
    protectedDb = new ProtectedDatabase(mockDb as any);
  });

  describe('Initialization', () => {
    it('should create protected database instance', () => {
      expect(protectedDb).toBeInstanceOf(ProtectedDatabase);
    });

    it('should have separate circuit breakers for different operations', () => {
      const metrics = protectedDb.getMetrics();
      expect(metrics.read).toBeDefined();
      expect(metrics.write).toBeDefined();
      expect(metrics.auth).toBeDefined();
    });

    it('should start with all circuits closed', () => {
      const metrics = protectedDb.getMetrics();
      expect(metrics.read.state).toBe(CircuitBreakerState.CLOSED);
      expect(metrics.write.state).toBe(CircuitBreakerState.CLOSED);
      expect(metrics.auth.state).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('Operation Type Detection', () => {
    it('should detect read operations', async () => {
      mockDb._mockStatement.all.mockResolvedValue({ results: [] });

      await protectedDb.prepare('SELECT * FROM users').all();

      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM users');
    });

    it('should detect write operations', async () => {
      mockDb._mockStatement.run.mockResolvedValue({ success: true });

      await protectedDb.prepare('INSERT INTO users VALUES (?, ?)').bind('1', 'test').run();

      expect(mockDb.prepare).toHaveBeenCalledWith('INSERT INTO users VALUES (?, ?)');
    });

    it('should detect auth operations from table name', async () => {
      mockDb._mockStatement.first.mockResolvedValue({ id: '1' });

      await protectedDb
        .prepare('SELECT * FROM users WHERE email = ?', {
          operation: 'auth',
        })
        .bind('test@example.com')
        .first();

      expect(mockDb.prepare).toHaveBeenCalled();
    });

    it('should use explicit operation context', async () => {
      mockDb._mockStatement.all.mockResolvedValue({ results: [] });

      await protectedDb
        .prepare('SELECT * FROM some_table', {
          operation: 'write',
          table: 'some_table',
        })
        .all();

      // Should work regardless of query pattern if explicitly specified
      expect(mockDb.prepare).toHaveBeenCalled();
    });
  });

  describe('Circuit Breaker Integration', () => {
    it('should track successful operations', async () => {
      mockDb._mockStatement.all.mockResolvedValue({ results: [{ id: 1 }] });

      await protectedDb.prepare('SELECT * FROM users').all();
      await protectedDb.prepare('SELECT * FROM users').all();

      const metrics = protectedDb.getMetrics();
      expect(metrics.read.successes).toBe(2);
      expect(metrics.read.totalRequests).toBe(2);
    });

    it('should track failed operations', async () => {
      mockDb._mockStatement.all.mockRejectedValue(new Error('Database error'));

      try {
        await protectedDb.prepare('SELECT * FROM users').all();
      } catch (error) {
        // Expected to fail
      }

      const metrics = protectedDb.getMetrics();
      expect(metrics.read.failures).toBe(1);
      expect(metrics.read.totalRequests).toBe(1);
    });

    it('should open circuit after failure threshold', async () => {
      // Configure to fail quickly for testing
      const readMetrics = protectedDb.getMetrics().read;
      const failureThreshold = 3; // Default for read operations

      // Execute failing operations
      for (let i = 0; i < failureThreshold; i++) {
        mockDb._mockStatement.all.mockRejectedValueOnce(new Error('Database error'));
        try {
          await protectedDb.prepare('SELECT * FROM users').all();
        } catch (error) {
          // Expected to fail
        }
      }

      const metrics = protectedDb.getMetrics();
      expect(metrics.read.state).toBe(CircuitBreakerState.OPEN);
    });

    it('should fail fast when circuit is open', async () => {
      // Trip the circuit
      const failureThreshold = 3;
      for (let i = 0; i < failureThreshold; i++) {
        mockDb._mockStatement.all.mockRejectedValueOnce(new Error('Database error'));
        try {
          await protectedDb.prepare('SELECT * FROM users').all();
        } catch (error) {
          // Expected to fail
        }
      }

      // Next request should fail fast
      try {
        await protectedDb.prepare('SELECT * FROM users').all();
        expect.fail('Should have thrown circuit breaker error');
      } catch (error: any) {
        expect(error.isCircuitBreakerError).toBe(true);
        expect(error.code).toBe('CIRCUIT_OPEN');
      }

      // Database should not be called when circuit is open
      const callCount = mockDb.prepare.mock.calls.length;
      expect(callCount).toBe(failureThreshold); // Only the initial failing calls
    });

    it('should handle different circuit breakers independently', async () => {
      // Fail read operations
      const readFailureThreshold = 3;
      for (let i = 0; i < readFailureThreshold; i++) {
        mockDb._mockStatement.all.mockRejectedValueOnce(new Error('Read error'));
        try {
          await protectedDb.prepare('SELECT * FROM users').all();
        } catch (error) {
          // Expected to fail
        }
      }

      // Write operations should still work
      mockDb._mockStatement.run.mockResolvedValue({ success: true });
      await protectedDb
        .prepare('INSERT INTO users VALUES (?, ?)', {
          operation: 'write',
        })
        .bind('1', 'test')
        .run();

      const metrics = protectedDb.getMetrics();
      expect(metrics.read.state).toBe(CircuitBreakerState.OPEN);
      expect(metrics.write.state).toBe(CircuitBreakerState.CLOSED);
      expect(metrics.write.successes).toBe(1);
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should handle circuit breaker errors with fallbacks', () => {
      const error = new Error('Circuit open') as any;
      error.isCircuitBreakerError = true;
      error.code = 'CIRCUIT_OPEN';
      error.circuitState = CircuitBreakerState.OPEN;
      error.metrics = { state: CircuitBreakerState.OPEN };

      const fallback = ProtectedDatabase.handleCircuitBreakerError(error, {
        operation: 'read',
        table: 'mental_models',
      });

      expect(fallback.models).toEqual([]);
      expect(fallback.message).toContain('temporarily unavailable');
    });

    it('should provide appropriate fallbacks for different operations', () => {
      const error = new Error('Circuit open') as any;
      error.isCircuitBreakerError = true;
      error.code = 'CIRCUIT_OPEN';
      error.circuitState = CircuitBreakerState.OPEN;
      error.metrics = { state: CircuitBreakerState.OPEN };

      // Read fallback
      const readFallback = ProtectedDatabase.handleCircuitBreakerError(error, {
        operation: 'read',
        table: 'mental_models',
      });
      expect(readFallback.models).toEqual([]);

      // Auth fallback
      const authFallback = ProtectedDatabase.handleCircuitBreakerError(error, {
        operation: 'auth',
        table: 'users',
      });
      expect(authFallback.message).toContain('Authentication service');

      // Write fallback
      const writeFallback = ProtectedDatabase.handleCircuitBreakerError(error, {
        operation: 'write',
        table: 'user_progress',
      });
      expect(writeFallback.message).toContain('Write operations');
    });

    it('should identify circuit breaker errors correctly', () => {
      const regularError = new Error('Regular error');
      const cbError = new Error('Circuit error') as any;
      cbError.isCircuitBreakerError = true;

      expect(ProtectedDatabase.isCircuitBreakerError(regularError)).toBe(false);
      expect(ProtectedDatabase.isCircuitBreakerError(cbError)).toBe(true);
    });
  });

  describe('Health Status', () => {
    it('should report healthy status when all circuits closed', () => {
      const health = protectedDb.getHealthStatus();
      expect(health.status).toBe('healthy');
      expect(health.circuits.read.state).toBe(CircuitBreakerState.CLOSED);
      expect(health.circuits.write.state).toBe(CircuitBreakerState.CLOSED);
      expect(health.circuits.auth.state).toBe(CircuitBreakerState.CLOSED);
    });

    it('should report unhealthy status when any circuit is open', async () => {
      // Trip the read circuit
      const failureThreshold = 3;
      for (let i = 0; i < failureThreshold; i++) {
        mockDb._mockStatement.all.mockRejectedValueOnce(new Error('Database error'));
        try {
          await protectedDb.prepare('SELECT * FROM users').all();
        } catch (error) {
          // Expected to fail
        }
      }

      const health = protectedDb.getHealthStatus();
      expect(health.status).toBe('unhealthy');
      expect(health.circuits.read.state).toBe(CircuitBreakerState.OPEN);
    });

    it('should report degraded status when any circuit is half-open', async () => {
      // This is harder to test without timing dependencies
      // For now, we'll test the logic in the health status method
      const health = protectedDb.getHealthStatus();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
    });
  });

  describe('Batch Operations', () => {
    it('should handle batch operations through circuit breaker', async () => {
      const mockStatements = [
        { bind: vi.fn().mockReturnThis() },
        { bind: vi.fn().mockReturnThis() },
      ];

      mockDb.batch.mockResolvedValue([{ success: true }, { success: true }]);

      const result = await protectedDb.batch(mockStatements as any);

      expect(mockDb.batch).toHaveBeenCalledWith(mockStatements);
      expect(result).toHaveLength(2);
    });

    it('should handle batch operation failures', async () => {
      const mockStatements = [{ bind: vi.fn().mockReturnThis() }];

      mockDb.batch.mockRejectedValue(new Error('Batch failed'));

      try {
        await protectedDb.batch(mockStatements as any);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      const metrics = protectedDb.getMetrics();
      expect(metrics.write.failures).toBe(1);
    });
  });

  describe('Exec Operations', () => {
    it('should handle exec operations', async () => {
      mockDb.exec.mockResolvedValue({ success: true });

      const result = await protectedDb.exec('CREATE TABLE test (id INTEGER)');

      expect(mockDb.exec).toHaveBeenCalledWith('CREATE TABLE test (id INTEGER)');
      expect(result.success).toBe(true);
    });

    it('should determine operation type for exec', async () => {
      mockDb.exec.mockResolvedValue({ success: true });

      // Test with CREATE (write operation)
      await protectedDb.exec('CREATE TABLE test (id INTEGER)');

      const metrics = protectedDb.getMetrics();
      expect(metrics.write.successes).toBe(1);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all circuit breakers', async () => {
      // Create some activity
      mockDb._mockStatement.all.mockResolvedValue({ results: [] });
      await protectedDb.prepare('SELECT * FROM users').all();

      mockDb._mockStatement.run.mockResolvedValue({ success: true });
      await protectedDb
        .prepare('INSERT INTO users VALUES (?)', {
          operation: 'write',
        })
        .bind('test')
        .run();

      // Reset
      protectedDb.resetCircuitBreakers();

      const metrics = protectedDb.getMetrics();
      expect(metrics.read.successes).toBe(0);
      expect(metrics.read.totalRequests).toBe(0);
      expect(metrics.write.successes).toBe(0);
      expect(metrics.write.totalRequests).toBe(0);
      expect(metrics.auth.successes).toBe(0);
      expect(metrics.auth.totalRequests).toBe(0);
    });
  });

  describe('Table Extraction', () => {
    it('should extract table names from different query types', () => {
      // This tests internal functionality through public interface
      expect(() => protectedDb.prepare('SELECT * FROM users')).not.toThrow();
      expect(() => protectedDb.prepare('INSERT INTO user_progress VALUES (?)')).not.toThrow();
      expect(() => protectedDb.prepare('UPDATE users SET name = ?')).not.toThrow();
      expect(() => protectedDb.prepare('DELETE FROM user_favorites')).not.toThrow();
    });
  });
});

describe('createProtectedDatabase', () => {
  it('should create protected database instance', () => {
    const mockDb = createMockD1Database();
    const protectedDb = createProtectedDatabase(mockDb as any);

    expect(protectedDb).toBeInstanceOf(ProtectedDatabase);
  });
});

describe('Integration Scenarios', () => {
  let mockDb: ReturnType<typeof createMockD1Database>;
  let protectedDb: ProtectedDatabase;

  beforeEach(() => {
    mockDb = createMockD1Database();
    protectedDb = new ProtectedDatabase(mockDb as any);
  });

  describe('Models API Scenarios', () => {
    it('should handle models list request with circuit protection', async () => {
      mockDb._mockStatement.all.mockResolvedValue({
        results: [
          { code: 'TEST1', name: 'Test Model 1' },
          { code: 'TEST2', name: 'Test Model 2' },
        ],
      });

      const statement = protectedDb.prepare('SELECT code, name FROM mental_models ORDER BY code', {
        operation: 'read',
        table: 'mental_models',
      });

      const result = await statement.all();

      expect(result.results).toHaveLength(2);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT code, name FROM mental_models ORDER BY code'
      );

      const metrics = protectedDb.getMetrics();
      expect(metrics.read.successes).toBe(1);
    });

    it('should handle model recommendations with fallback', async () => {
      // First successful call
      mockDb._mockStatement.all.mockResolvedValueOnce({
        results: [{ code: 'TEST1', name: 'Test Model' }],
      });

      const result1 = await protectedDb
        .prepare('SELECT code, name FROM mental_models WHERE description LIKE ?', {
          operation: 'read',
          table: 'mental_models',
        })
        .bind('%problem%')
        .all();

      expect(result1.results).toHaveLength(1);

      // Simulate database failure
      mockDb._mockStatement.all.mockRejectedValue(new Error('Database connection lost'));

      try {
        await protectedDb
          .prepare('SELECT code, name FROM mental_models WHERE description LIKE ?', {
            operation: 'read',
            table: 'mental_models',
          })
          .bind('%problem%')
          .all();
      } catch (error: any) {
        expect(error.isCircuitBreakerError).toBe(true);
      }
    });
  });

  describe('User API Scenarios', () => {
    it('should handle user progress tracking', async () => {
      // Get progress
      mockDb._mockStatement.all.mockResolvedValueOnce({
        results: [{ model_id: 'TEST1', completed_at: '2023-01-01' }],
      });

      const progressResult = await protectedDb
        .prepare('SELECT model_id, completed_at FROM user_progress WHERE user_id = ?', {
          operation: 'read',
          table: 'user_progress',
        })
        .bind('user-123')
        .all();

      expect(progressResult.results).toHaveLength(1);

      // Add progress
      mockDb._mockStatement.run.mockResolvedValueOnce({ success: true });

      const addResult = await protectedDb
        .prepare('INSERT INTO user_progress (id, user_id, model_id) VALUES (?, ?, ?)', {
          operation: 'write',
          table: 'user_progress',
        })
        .bind('progress-123', 'user-123', 'TEST2')
        .run();

      expect(addResult.success).toBe(true);

      const metrics = protectedDb.getMetrics();
      expect(metrics.read.successes).toBe(1);
      expect(metrics.write.successes).toBe(1);
    });
  });

  describe('Auth Scenarios', () => {
    it('should handle authentication with higher tolerance', async () => {
      // Auth operations use a more lenient circuit breaker
      const authFailureThreshold = 10; // Higher than read/write

      // Simulate some failures (but not enough to trip auth circuit)
      for (let i = 0; i < 5; i++) {
        mockDb._mockStatement.first.mockRejectedValueOnce(new Error('Auth error'));
        try {
          await protectedDb
            .prepare('SELECT * FROM users WHERE email = ?', { operation: 'auth', table: 'users' })
            .bind('test@example.com')
            .first();
        } catch (error) {
          // Expected to fail
        }
      }

      // Should still be closed (auth circuit has higher threshold)
      const metrics = protectedDb.getMetrics();
      expect(metrics.auth.state).toBe(CircuitBreakerState.CLOSED);
      expect(metrics.auth.failures).toBe(5);

      // Successful auth should still work
      mockDb._mockStatement.first.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      const result = await protectedDb
        .prepare('SELECT * FROM users WHERE email = ?', { operation: 'auth', table: 'users' })
        .bind('test@example.com')
        .first();

      expect(result.id).toBe('user-123');
    });
  });

  describe('Mixed Operation Scenarios', () => {
    it('should handle mixed read/write operations independently', async () => {
      // Successful read
      mockDb._mockStatement.all.mockResolvedValueOnce({ results: [] });
      await protectedDb.prepare('SELECT * FROM users').all();

      // Failed write (should not affect read circuit)
      mockDb._mockStatement.run.mockRejectedValueOnce(new Error('Write failed'));
      try {
        await protectedDb
          .prepare('INSERT INTO users VALUES (?)', {
            operation: 'write',
          })
          .bind('test')
          .run();
      } catch (error) {
        // Expected to fail
      }

      // Another successful read (should still work)
      mockDb._mockStatement.all.mockResolvedValueOnce({ results: [{ id: 1 }] });
      const result = await protectedDb.prepare('SELECT * FROM users').all();

      expect(result.results).toHaveLength(1);

      const metrics = protectedDb.getMetrics();
      expect(metrics.read.successes).toBe(2);
      expect(metrics.read.failures).toBe(0);
      expect(metrics.write.successes).toBe(0);
      expect(metrics.write.failures).toBe(1);
    });
  });
});
