/**
 * Circuit Breaker Pattern Demo
 *
 * This file demonstrates how the circuit breaker pattern protects
 * the HUMMBL Workers API against database failures.
 */

import { CircuitBreaker, DEFAULT_DB_CIRCUIT_CONFIG } from '../lib/circuit-breaker';
import { createProtectedDatabase, ProtectedDatabase } from '../lib/db-wrapper';

// ===================================================================
// Example 1: Basic Circuit Breaker Usage
// ===================================================================

async function basicCircuitBreakerExample() {
  console.log('🔧 Basic Circuit Breaker Example\n');

  // Create a circuit breaker with custom config
  const circuitBreaker = new CircuitBreaker({
    failureThreshold: 3, // Open after 3 failures
    timeout: 2000, // 2 second timeout
    maxTimeout: 10000, // Max 10 seconds with backoff
    successThreshold: 2, // Close after 2 successes
    monitoringWindow: 30000, // 30 second window
    name: 'demo-circuit',
  });

  // Simulate a database operation function
  const databaseOperation = async (shouldFail: boolean) => {
    if (shouldFail) {
      throw new Error('Database connection failed');
    }
    return { data: 'Success!' };
  };

  console.log('Initial circuit state:', circuitBreaker.getMetrics().state);

  // Execute successful operations
  console.log('\n📝 Executing successful operations...');
  for (let i = 0; i < 3; i++) {
    try {
      const result = await circuitBreaker.execute(() => databaseOperation(false));
      console.log(`✅ Operation ${i + 1}: ${result.data}`);
    } catch (error: any) {
      console.log(`❌ Operation ${i + 1}: ${error.message}`);
    }
  }

  console.log('\nMetrics after successful operations:');
  console.log(JSON.stringify(circuitBreaker.getMetrics(), null, 2));

  // Execute failing operations to trip the circuit
  console.log('\n💥 Executing failing operations...');
  for (let i = 0; i < 3; i++) {
    try {
      const result = await circuitBreaker.execute(() => databaseOperation(true));
      console.log(`✅ Operation ${i + 1}: ${result.data}`);
    } catch (error: any) {
      console.log(`❌ Operation ${i + 1}: ${error.message}`);
    }
  }

  console.log('\nCircuit state after failures:', circuitBreaker.getMetrics().state);

  // Try to execute when circuit is open (should fail fast)
  console.log('\n⚡ Trying operation when circuit is OPEN...');
  try {
    await circuitBreaker.execute(() => databaseOperation(false));
  } catch (error: any) {
    console.log(`🚨 Circuit breaker error: ${error.message}`);
    console.log(`Code: ${error.code}, State: ${error.circuitState}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// ===================================================================
// Example 2: Database Wrapper with Multiple Circuit Types
// ===================================================================

async function databaseWrapperExample() {
  console.log('🗄️  Database Wrapper Example\n');

  // Mock D1Database for demonstration
  const mockDatabase = {
    prepare: (query: string) => ({
      bind: (...values: any[]) => ({
        all: async () => {
          // Simulate different failure scenarios
          if (query.includes('failing_table')) {
            throw new Error('Table does not exist');
          }
          if (query.includes('slow_operation')) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          return { results: [{ id: 1, name: 'Test Data' }] };
        },
        first: async () => {
          if (query.includes('user_auth_fail')) {
            throw new Error('Authentication database unavailable');
          }
          return { id: 1, email: 'user@example.com' };
        },
        run: async () => {
          if (query.includes('write_fail')) {
            throw new Error('Write operation failed');
          }
          return { success: true, meta: { changes: 1 } };
        },
      }),
    }),
    batch: async () => [{ success: true }],
    exec: async () => ({ success: true }),
    dump: async () => new ArrayBuffer(0),
  };

  const protectedDb = createProtectedDatabase(mockDatabase as any);

  console.log('Initial health status:');
  console.log(JSON.stringify(protectedDb.getHealthStatus(), null, 2));

  // Example 1: Successful read operations
  console.log('\n📖 Read Operations:');
  try {
    const models = await protectedDb
      .prepare('SELECT * FROM mental_models ORDER BY code', {
        operation: 'read',
        table: 'mental_models',
      })
      .all();
    console.log(`✅ Read operation successful: ${models.results.length} records`);
  } catch (error: any) {
    console.log(`❌ Read operation failed: ${error.message}`);
  }

  // Example 2: Write operations
  console.log('\n✍️  Write Operations:');
  try {
    const result = await protectedDb
      .prepare('INSERT INTO user_progress (id, user_id, model_id) VALUES (?, ?, ?)', {
        operation: 'write',
        table: 'user_progress',
      })
      .bind('progress-123', 'user-123', 'MODEL1')
      .run();
    console.log(`✅ Write operation successful: ${result.success}`);
  } catch (error: any) {
    console.log(`❌ Write operation failed: ${error.message}`);
  }

  // Example 3: Authentication operations
  console.log('\n🔐 Authentication Operations:');
  try {
    const user = await protectedDb
      .prepare('SELECT * FROM users WHERE email = ?', { operation: 'auth', table: 'users' })
      .bind('user@example.com')
      .first();
    console.log(`✅ Auth operation successful: ${user?.email}`);
  } catch (error: any) {
    console.log(`❌ Auth operation failed: ${error.message}`);
  }

  console.log('\nHealth status after operations:');
  console.log(JSON.stringify(protectedDb.getHealthStatus(), null, 2));

  console.log('\n' + '='.repeat(60) + '\n');
}

// ===================================================================
// Example 3: Failure Scenarios and Fallback Strategies
// ===================================================================

async function failureScenarioExample() {
  console.log('💥 Failure Scenarios and Fallback Strategies\n');

  const mockFailingDatabase = {
    prepare: (query: string) => ({
      bind: (...values: any[]) => ({
        all: async () => {
          throw new Error('Database connection timeout');
        },
        first: async () => {
          throw new Error('Database connection refused');
        },
        run: async () => {
          throw new Error('Database write failed');
        },
      }),
    }),
    batch: async () => {
      throw new Error('Batch operation failed');
    },
    exec: async () => {
      throw new Error('Database not available');
    },
    dump: async () => {
      throw new Error('Dump operation failed');
    },
  };

  const protectedDb = createProtectedDatabase(mockFailingDatabase as any);

  // Simulate API endpoint behavior with fallbacks
  const getModelsWithFallback = async (transformation?: string) => {
    try {
      const models = await protectedDb
        .prepare('SELECT code, name, transformation FROM mental_models WHERE transformation = ?', {
          operation: 'read',
          table: 'mental_models',
        })
        .bind(transformation || 'DECOMPOSITION')
        .all();

      return {
        ok: true,
        data: {
          models: models.results,
          count: models.results.length,
          transformation,
        },
      };
    } catch (error: any) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        console.log(`🔄 Circuit breaker active (${error.circuitState}), providing fallback`);

        // Return fallback response
        return {
          ok: true,
          data: {
            models: [],
            count: 0,
            transformation,
            message: 'Models temporarily unavailable. Please try again shortly.',
            fallback: true,
          },
        };
      }

      // Re-throw non-circuit-breaker errors
      throw error;
    }
  };

  const addUserProgressWithFallback = async (userId: string, modelId: string) => {
    try {
      const result = await protectedDb
        .prepare('INSERT INTO user_progress (id, user_id, model_id) VALUES (?, ?, ?)', {
          operation: 'write',
          table: 'user_progress',
        })
        .bind(`progress-${Date.now()}`, userId, modelId)
        .run();

      return {
        ok: true,
        data: { success: result.success, progressId: `progress-${Date.now()}` },
      };
    } catch (error: any) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        console.log(`🔄 Write circuit breaker active (${error.circuitState})`);

        // For writes, we might queue the operation or provide optimistic response
        return {
          ok: true,
          data: {
            success: false,
            message: 'Progress tracking temporarily unavailable. Your progress has been noted.',
            queued: true,
            fallback: true,
          },
        };
      }

      throw error;
    }
  };

  // Test the fallback scenarios
  console.log('🔍 Testing models endpoint with fallback:');
  for (let i = 0; i < 5; i++) {
    const result = await getModelsWithFallback('DECOMPOSITION');
    console.log(`Attempt ${i + 1}:`, {
      ok: result.ok,
      count: result.data.count,
      fallback: result.data.fallback,
      message: result.data.message?.substring(0, 50) + '...',
    });

    // Add delay to see circuit breaker behavior change
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n✍️  Testing progress endpoint with fallback:');
  for (let i = 0; i < 3; i++) {
    const result = await addUserProgressWithFallback('user-123', 'MODEL1');
    console.log(`Attempt ${i + 1}:`, {
      ok: result.ok,
      success: result.data.success,
      fallback: result.data.fallback,
      queued: result.data.queued,
    });
  }

  console.log('\nFinal circuit states:');
  const healthStatus = protectedDb.getHealthStatus();
  console.log(`Overall status: ${healthStatus.status}`);
  console.log(`Read circuit: ${healthStatus.circuits.read.state}`);
  console.log(`Write circuit: ${healthStatus.circuits.write.state}`);
  console.log(`Auth circuit: ${healthStatus.circuits.auth.state}`);

  console.log('\n' + '='.repeat(60) + '\n');
}

// ===================================================================
// Example 4: Recovery and Metrics Monitoring
// ===================================================================

async function recoveryAndMonitoringExample() {
  console.log('📊 Recovery and Metrics Monitoring\n');

  let dbFailureMode = true;
  const mockRecoveringDatabase = {
    prepare: (query: string) => ({
      bind: (...values: any[]) => ({
        all: async () => {
          if (dbFailureMode) {
            throw new Error('Database temporarily unavailable');
          }
          return { results: [{ id: 1, name: 'Recovered data' }] };
        },
        first: async () => {
          if (dbFailureMode) {
            throw new Error('Database connection failed');
          }
          return { id: 1, recovered: true };
        },
        run: async () => {
          if (dbFailureMode) {
            throw new Error('Write operation failed');
          }
          return { success: true, meta: { changes: 1 } };
        },
      }),
    }),
    batch: async () => [{ success: !dbFailureMode }],
    exec: async () => ({ success: !dbFailureMode }),
    dump: async () => new ArrayBuffer(0),
  };

  const protectedDb = createProtectedDatabase(mockRecoveringDatabase as any);

  // Function to print metrics
  const printMetrics = (label: string) => {
    const metrics = protectedDb.getMetrics();
    console.log(`\n📈 ${label}:`);
    console.log(
      `Read - State: ${metrics.read.state}, Failures: ${metrics.read.failures}, Successes: ${metrics.read.successes}`
    );
    console.log(
      `Write - State: ${metrics.write.state}, Failures: ${metrics.write.failures}, Successes: ${metrics.write.successes}`
    );
  };

  // Phase 1: Cause failures to trip circuits
  console.log('🚨 Phase 1: Simulating database outage');
  for (let i = 0; i < 5; i++) {
    try {
      await protectedDb.prepare('SELECT * FROM users', { operation: 'read' }).all();
    } catch (error) {
      console.log(`Read attempt ${i + 1} failed`);
    }

    try {
      await protectedDb
        .prepare('INSERT INTO log VALUES (?)', { operation: 'write' })
        .bind('test')
        .run();
    } catch (error) {
      console.log(`Write attempt ${i + 1} failed`);
    }
  }

  printMetrics('After failure phase');

  // Phase 2: Simulate service recovery
  console.log('\n🔧 Phase 2: Simulating database recovery');
  dbFailureMode = false; // Database is now working

  // Wait for circuit to potentially transition to half-open
  console.log('Waiting for circuit timeout...');
  await new Promise(resolve => setTimeout(resolve, 3100)); // Wait longer than read timeout

  // Try operations again
  for (let i = 0; i < 5; i++) {
    try {
      const result = await protectedDb.prepare('SELECT * FROM users', { operation: 'read' }).all();
      console.log(`✅ Read attempt ${i + 1} succeeded: ${result.results.length} results`);
    } catch (error: any) {
      console.log(`❌ Read attempt ${i + 1} failed: ${error.message}`);
    }

    try {
      const result = await protectedDb
        .prepare('INSERT INTO log VALUES (?)', { operation: 'write' })
        .bind('test')
        .run();
      console.log(`✅ Write attempt ${i + 1} succeeded: ${result.success}`);
    } catch (error: any) {
      console.log(`❌ Write attempt ${i + 1} failed: ${error.message}`);
    }

    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  printMetrics('After recovery phase');

  // Show final health status
  console.log('\n🏥 Final Health Status:');
  console.log(JSON.stringify(protectedDb.getHealthStatus(), null, 2));

  console.log('\n' + '='.repeat(60) + '\n');
}

// ===================================================================
// Example 5: Real-World API Integration
// ===================================================================

async function realWorldApiExample() {
  console.log('🌍 Real-World API Integration Example\n');

  // This simulates how circuit breakers are used in actual API routes
  const mockEnv = {
    DB: {
      prepare: (query: string) => ({
        bind: (...values: any[]) => ({
          all: async () => {
            // Simulate intermittent failures
            if (Math.random() < 0.3) {
              throw new Error('Database timeout');
            }
            return {
              results: [
                {
                  code: 'DEC1',
                  name: 'First Principles Thinking',
                  transformation: 'DECOMPOSITION',
                },
                { code: 'DEC2', name: 'Root Cause Analysis', transformation: 'DECOMPOSITION' },
              ],
            };
          },
          first: async () => {
            if (Math.random() < 0.2) {
              throw new Error('User lookup failed');
            }
            return { id: 'user-123', email: 'user@example.com' };
          },
          run: async () => {
            if (Math.random() < 0.25) {
              throw new Error('Insert failed');
            }
            return { success: true, meta: { changes: 1 } };
          },
        }),
      }),
      batch: async () => [{ success: true }],
      exec: async () => ({ success: true }),
      dump: async () => new ArrayBuffer(0),
    },
  };

  // Simulate the models API endpoint
  const getModels = async (transformation?: string) => {
    const protectedDb = createProtectedDatabase(mockEnv.DB as any);

    try {
      const query = transformation
        ? 'SELECT code, name, transformation FROM mental_models WHERE transformation = ?'
        : 'SELECT code, name, transformation FROM mental_models ORDER BY code';

      const context = {
        operation: 'read' as const,
        table: 'mental_models',
        query: query.substring(0, 50) + '...',
      };

      const statement = transformation
        ? protectedDb.prepare(query, context).bind(transformation)
        : protectedDb.prepare(query, context);

      const result = await statement.all();

      return {
        ok: true,
        value: {
          models: result.results,
          count: result.results.length,
          transformation: transformation || null,
        },
      };
    } catch (error: any) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        console.log(`⚡ Circuit breaker triggered for models API: ${error.circuitState}`);

        // Graceful fallback
        return {
          ok: true,
          value: {
            models: [],
            count: 0,
            transformation: transformation || null,
            message: 'Model data temporarily unavailable. Please refresh the page.',
            degraded: true,
          },
        };
      }

      return {
        ok: false,
        error: {
          code: 'DB_ERROR',
          message: 'Failed to fetch models',
          status: 500,
        },
      };
    }
  };

  // Simulate the user progress API
  const addUserProgress = async (userId: string, modelId: string) => {
    const protectedDb = createProtectedDatabase(mockEnv.DB as any);

    try {
      // First verify model exists
      const modelExists = await protectedDb
        .prepare('SELECT code FROM mental_models WHERE code = ?', {
          operation: 'read',
          table: 'mental_models',
        })
        .bind(modelId)
        .first();

      if (!modelExists) {
        return {
          ok: false,
          error: { code: 'NOT_FOUND', message: 'Model not found', status: 404 },
        };
      }

      // Add progress
      const progressId = `progress-${Date.now()}`;
      const result = await protectedDb
        .prepare('INSERT INTO user_progress (id, user_id, model_id) VALUES (?, ?, ?)', {
          operation: 'write',
          table: 'user_progress',
        })
        .bind(progressId, userId, modelId)
        .run();

      return {
        ok: true,
        value: { success: result.success, progressId },
      };
    } catch (error: any) {
      if (ProtectedDatabase.isCircuitBreakerError(error)) {
        console.log(`⚡ Circuit breaker triggered for progress API: ${error.circuitState}`);

        // For progress tracking, we might want to be optimistic
        return {
          ok: true,
          value: {
            success: true,
            progressId: `queued-${Date.now()}`,
            message: 'Progress tracked locally. Will sync when service is available.',
            queued: true,
          },
        };
      }

      return {
        ok: false,
        error: {
          code: 'DB_ERROR',
          message: 'Failed to add progress',
          status: 500,
        },
      };
    }
  };

  // Simulate API usage
  console.log('🎯 Simulating API requests with circuit breaker protection:\n');

  // Test models API with various scenarios
  for (let i = 0; i < 10; i++) {
    const result = await getModels('DECOMPOSITION');
    if (result.ok) {
      const data = result.value;
      console.log(
        `Models API ${i + 1}: ${data.count} models${data.degraded ? ' (degraded)' : ''}${data.message ? ` - ${data.message}` : ''}`
      );
    } else {
      console.log(`Models API ${i + 1}: Error - ${result.error.message}`);
    }

    // Add some delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n');

  // Test progress API
  for (let i = 0; i < 5; i++) {
    const result = await addUserProgress('user-123', 'DEC1');
    if (result.ok) {
      const data = result.value;
      console.log(
        `Progress API ${i + 1}: Success ${data.success}${data.queued ? ' (queued)' : ''}${data.message ? ` - ${data.message}` : ''}`
      );
    } else {
      console.log(`Progress API ${i + 1}: Error - ${result.error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// ===================================================================
// Main Demo Function
// ===================================================================

async function runCircuitBreakerDemo() {
  console.log('🎪 HUMMBL Workers API - Circuit Breaker Pattern Demo\n');
  console.log('This demo shows how circuit breakers protect against database failures\n');
  console.log('=' + '='.repeat(60) + '\n');

  try {
    await basicCircuitBreakerExample();
    await databaseWrapperExample();
    await failureScenarioExample();
    await recoveryAndMonitoringExample();
    await realWorldApiExample();

    console.log('✅ Demo completed successfully!');
    console.log('\n📚 Key Takeaways:');
    console.log('   • Circuit breakers prevent cascading failures');
    console.log('   • Different operation types have different tolerance levels');
    console.log('   • Fallback responses maintain user experience during outages');
    console.log('   • Automatic recovery handles intermittent issues');
    console.log('   • Comprehensive monitoring enables quick issue resolution');
    console.log('\n🔗 For more details, see: /src/docs/circuit-breaker.md');
  } catch (error) {
    console.error('❌ Demo failed with error:', error);
  }
}

// Export the demo function for potential use in tests or manual execution
export { runCircuitBreakerDemo };

// If this file is run directly, execute the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runCircuitBreakerDemo();
}
