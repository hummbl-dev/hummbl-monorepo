# Circuit Breaker Pattern Implementation for HUMMBL Workers API

## Overview

The HUMMBL Workers API implements a comprehensive circuit breaker pattern to protect against cascading failures during database outages. This implementation provides automatic failure detection, graceful degradation, and service recovery capabilities.

## Architecture

### Core Components

1. **CircuitBreaker Class** (`/src/lib/circuit-breaker.ts`)
   - Implements the classic circuit breaker pattern with three states: CLOSED, OPEN, HALF_OPEN
   - Configurable failure thresholds and timeouts
   - Exponential backoff for retry attempts
   - Comprehensive metrics tracking

2. **ProtectedDatabase Class** (`/src/lib/db-wrapper.ts`)
   - Wraps Cloudflare D1 database operations
   - Provides separate circuit breakers for different operation types
   - Handles fallback responses when circuits are open

3. **Monitoring Middleware** (`/src/middleware/circuit-breaker-monitoring.ts`)
   - Tracks circuit breaker state changes
   - Provides alerting capabilities
   - Exposes metrics endpoints

## Circuit Breaker States

### CLOSED (Normal Operation)
- All requests pass through to the database
- Failure count is tracked
- Transitions to OPEN when failure threshold is reached

### OPEN (Failing Fast)
- Requests fail immediately without calling the database
- Prevents cascading failures
- Transitions to HALF_OPEN after timeout period

### HALF_OPEN (Testing Recovery)
- Limited requests are allowed through to test service recovery
- Transitions to CLOSED after successful requests
- Transitions back to OPEN on any failure

## Configuration

### Pre-defined Configurations

```typescript
// Read operations (most lenient)
export const READ_CIRCUIT_CONFIG = {
  failureThreshold: 3,      // Open after 3 failures
  timeout: 3000,            // 3 second timeout
  maxTimeout: 15000,        // Max 15 seconds with backoff
  successThreshold: 2,      // Close after 2 successes
  monitoringWindow: 30000,  // 30 second monitoring window
  name: 'read-database'
};

// Write operations (balanced)
export const DEFAULT_DB_CIRCUIT_CONFIG = {
  failureThreshold: 5,      // Open after 5 consecutive failures
  timeout: 10000,           // 10 second timeout
  maxTimeout: 60000,        // Max 1 minute with backoff
  successThreshold: 3,      // Close after 3 consecutive successes
  monitoringWindow: 60000,  // 1 minute monitoring window
  name: 'database'
};

// Auth operations (most tolerant)
export const AUTH_CIRCUIT_CONFIG = {
  failureThreshold: 10,     // Open after 10 failures (auth is critical)
  timeout: 5000,            // 5 second timeout
  maxTimeout: 30000,        // Max 30 seconds with backoff
  successThreshold: 2,      // Close after 2 successes
  monitoringWindow: 30000,  // 30 second monitoring window
  name: 'auth-database'
};
```

### Custom Configuration

```typescript
const customConfig: CircuitBreakerConfig = {
  failureThreshold: 5,      // Number of failures before opening
  timeout: 10000,           // Base timeout in milliseconds
  maxTimeout: 60000,        // Maximum timeout with exponential backoff
  successThreshold: 3,      // Successes needed to close from half-open
  monitoringWindow: 60000,  // Time window for failure rate calculation
  name: 'custom-circuit'    // Name for logging and metrics
};

const circuitBreaker = new CircuitBreaker(customConfig);
```

## Usage Patterns

### Basic Database Operations

```typescript
import { createProtectedDatabase } from '../lib/db-wrapper';

// In your route handler
const protectedDb = createProtectedDatabase(c.env.DB);

// Read operation with circuit protection
const models = await protectedDb.prepare(
  'SELECT * FROM mental_models WHERE transformation = ?',
  {
    operation: 'read',
    table: 'mental_models',
    query: 'SELECT ... FROM mental_models WHERE ...'
  }
)
.bind(transformation)
.all();
```

### Error Handling with Fallbacks

```typescript
try {
  const models = await protectedDb.prepare(query, context).all();
  return Result.ok({ models: models.results });
} catch (error) {
  if (ProtectedDatabase.isCircuitBreakerError(error)) {
    // Circuit is open - provide fallback response
    console.warn('Circuit breaker active', {
      state: error.circuitState,
      operation: context.operation
    });

    return Result.ok({
      models: [], // Empty fallback
      message: 'Models temporarily unavailable'
    });
  }

  // Handle other errors normally
  throw error;
}
```

### Authentication with Circuit Protection

```typescript
// High-priority operations use auth circuit breaker
const user = await protectedDb.prepare(
  'SELECT * FROM users WHERE email = ? AND provider = ?',
  {
    operation: 'auth',
    table: 'users'
  }
)
.bind(email, 'email')
.first();

if (!user) {
  return c.json({ error: 'Invalid credentials' }, 401);
}
```

### Batch Operations

```typescript
const statements = [
  db.prepare('INSERT INTO user_progress VALUES (?, ?, ?)'),
  db.prepare('UPDATE users SET updated_at = ? WHERE id = ?')
];

const results = await protectedDb.batch(statements);
```

## Monitoring and Alerting

### Health Check Endpoint

The enhanced `/health` endpoint provides circuit breaker status:

```json
{
  "status": "healthy",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "database": {
    "status": "healthy",
    "circuits": {
      "read": {
        "state": "CLOSED",
        "failures": 0,
        "failureRate": 0,
        "uptime": 3600000
      },
      "write": {
        "state": "CLOSED",
        "failures": 1,
        "failureRate": 0.05,
        "uptime": 3600000
      },
      "auth": {
        "state": "CLOSED",
        "failures": 0,
        "failureRate": 0,
        "uptime": 3600000
      }
    }
  },
  "services": {
    "api": "healthy",
    "cache": "healthy",
    "circuitBreakers": {
      "read": "CLOSED",
      "write": "CLOSED",
      "auth": "CLOSED"
    }
  }
}
```

### Circuit Breaker Metrics Endpoint

Access detailed metrics at `/v1/circuit-breaker/metrics`:

```json
{
  "timestamp": "2023-01-01T00:00:00.000Z",
  "circuits": {
    "read": {
      "state": "CLOSED",
      "failures": 2,
      "successes": 38,
      "consecutiveFailures": 0,
      "consecutiveSuccesses": 5,
      "lastFailureTime": 1672531200000,
      "lastSuccessTime": 1672534800000,
      "openedAt": null,
      "totalRequests": 40,
      "circuitOpens": 1,
      "failureRate": 0.05,
      "uptime": 3600
    }
  },
  "summary": {
    "totalFailures": 3,
    "totalSuccesses": 97,
    "totalRequests": 100,
    "openCircuits": [],
    "averageFailureRate": "0.0300"
  }
}
```

### Manual Circuit Reset

Reset circuits manually for testing or emergency recovery:

```bash
curl -X POST /v1/circuit-breaker/reset/read
```

## Fallback Strategies

### Read Operations
- Return empty arrays for list endpoints
- Return cached data when available
- Provide "temporarily unavailable" messages

### Write Operations
- Return "operation queued" messages
- Log requests for later processing
- Maintain user experience with optimistic UI

### Authentication
- Allow cached token validation when possible
- Provide clear error messages about service availability
- Maintain security while degrading gracefully

## Error Types and Responses

### Circuit Open Error
```javascript
{
  code: 'CIRCUIT_OPEN',
  message: 'Circuit breaker is OPEN for database. Operations are failing fast.',
  circuitState: 'OPEN',
  metrics: { /* circuit metrics */ }
}
```

### Database Error
```javascript
{
  code: 'DB_ERROR',
  message: 'Database operation failed: Connection refused',
  circuitState: 'CLOSED',
  metrics: { /* circuit metrics */ }
}
```

### Timeout Error
```javascript
{
  code: 'TIMEOUT',
  message: 'Database operation timeout after 5000ms',
  circuitState: 'CLOSED',
  metrics: { /* circuit metrics */ }
}
```

## Best Practices

### 1. Operation Classification
Always specify the operation type for optimal circuit breaker selection:

```typescript
// Good - explicit operation type
const result = await protectedDb.prepare(query, {
  operation: 'read',
  table: 'mental_models'
}).all();

// Okay - will auto-detect from query
const result = await protectedDb.prepare('SELECT * FROM mental_models').all();
```

### 2. Graceful Degradation
Always provide meaningful fallbacks:

```typescript
if (ProtectedDatabase.isCircuitBreakerError(error)) {
  return {
    models: [],
    message: 'Service temporarily unavailable. Please try again shortly.',
    degraded: true
  };
}
```

### 3. Monitoring Integration
Use structured logging for better monitoring:

```typescript
logger.warn('Circuit breaker activated', {
  context: 'models-api',
  circuit: 'read',
  state: error.circuitState,
  path: c.req.path,
  timestamp: new Date().toISOString()
});
```

### 4. Testing Circuit Behavior
Use the circuit reset endpoint for testing:

```typescript
// In tests
protectedDb.resetCircuitBreakers();

// Or via HTTP
fetch('/v1/circuit-breaker/reset/read', { method: 'POST' });
```

## Performance Considerations

### 1. Circuit Breaker Overhead
- Minimal latency impact (< 1ms per operation)
- Memory usage scales with operation volume
- Exponential backoff prevents resource waste

### 2. Database Connection Pooling
- Circuit breakers work with D1's built-in connection management
- Failures are detected at the operation level, not connection level
- Multiple workers can have independent circuit states

### 3. Cache Integration
- Circuit breakers complement the existing KV cache layer
- Failed operations can trigger cache fallbacks
- Cache misses are not treated as circuit failures

## Alerting Configuration

### Recommended Alerts

1. **Circuit Open Alert** - Immediate notification
   ```javascript
   if (circuitState === 'OPEN') {
     alert('Database circuit breaker opened');
   }
   ```

2. **High Failure Rate** - Warning notification
   ```javascript
   if (failureRate > 0.1) {
     warn('Database failure rate above 10%');
   }
   ```

3. **Multiple Circuit Opens** - Critical notification
   ```javascript
   if (openCircuits.length > 1) {
     critical('Multiple database circuits open');
   }
   ```

### Integration Examples

#### Slack Webhook
```typescript
await fetch(SLACK_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: `🚨 Circuit Breaker Alert: ${circuit} circuit is ${state}`,
    blocks: [{
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Circuit:* ${circuit}` },
        { type: 'mrkdwn', text: `*State:* ${state}` },
        { type: 'mrkdwn', text: `*Failure Rate:* ${(failureRate * 100).toFixed(2)}%` }
      ]
    }]
  })
});
```

#### PagerDuty Integration
```typescript
await fetch('https://events.pagerduty.com/v2/enqueue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    routing_key: PAGERDUTY_KEY,
    event_action: 'trigger',
    payload: {
      summary: `Database circuit breaker opened: ${circuit}`,
      source: 'hummbl-workers-api',
      severity: 'critical'
    }
  })
});
```

## Troubleshooting

### Common Issues

1. **Circuit Opens Too Frequently**
   - Increase `failureThreshold`
   - Check database connection stability
   - Review query performance

2. **Circuit Doesn't Open When Expected**
   - Verify failure threshold configuration
   - Check operation classification
   - Review error handling in application code

3. **Slow Recovery**
   - Reduce `timeout` for faster testing
   - Adjust `successThreshold` for easier recovery
   - Check for continued underlying issues

### Debug Commands

```bash
# Check circuit status
curl /health

# Get detailed metrics
curl /v1/circuit-breaker/metrics

# Reset all circuits
curl -X POST /v1/circuit-breaker/reset/read
curl -X POST /v1/circuit-breaker/reset/write
curl -X POST /v1/circuit-breaker/reset/auth
```

### Logging Analysis

Look for these log patterns:

```
[CIRCUIT_BREAKER][database] State changed to OPEN: Circuit opened due to 5 consecutive failures
[MODELS] Circuit breaker active for model lookup: state=OPEN
[USER] Circuit breaker active for progress: providing fallback response
```

## Future Enhancements

### Planned Improvements

1. **Adaptive Thresholds** - Dynamic adjustment based on traffic patterns
2. **Circuit Breaker Coordination** - Cross-worker circuit state sharing
3. **Advanced Metrics** - Percentile response times and SLA tracking
4. **Custom Fallback Strategies** - Configurable fallback behavior per endpoint
5. **Integration Testing** - Automated circuit breaker behavior validation

### Extension Points

The circuit breaker implementation is designed to be extensible:

- Custom metrics collection
- Alternative alerting backends
- Different fallback strategies
- Integration with external health checks

## Conclusion

The circuit breaker implementation provides robust protection against database failures while maintaining excellent user experience through graceful degradation. The three-tier approach (read/write/auth) ensures appropriate tolerance levels for different operation types, while comprehensive monitoring enables quick detection and resolution of issues.

For questions or improvements, please refer to the test suites in `/src/lib/circuit-breaker.test.ts` and `/src/lib/db-wrapper.test.ts` for detailed usage examples.