/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * Circuit Breaker Monitoring Middleware
 *
 * Provides monitoring capabilities for circuit breaker health and metrics
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { createProtectedDatabase } from '../lib/db-wrapper';
import { CircuitBreakerState } from '../lib/circuit-breaker';
import { createLogger, logError } from '@hummbl/core';

const logger = createLogger('circuit-breaker-monitoring');

/**
 * Circuit Breaker monitoring middleware
 * Logs circuit state changes and alerts
 */
export const circuitBreakerMonitoring = () => {
  return async (c: any, next: any) => {
    const startTime = Date.now();

    try {
      await next();
    } catch (error) {
      // Log circuit breaker related errors
      if (error instanceof Error && 'isCircuitBreakerError' in error) {
        const cbError = error as any;

        logger.warn('Circuit breaker error detected', {
          context: 'circuit-breaker-monitoring',
          code: cbError.code,
          state: cbError.circuitState,
          path: c.req.path,
          method: c.req.method,
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime,
        });

        // Send alerts for circuit opens
        if (cbError.circuitState === CircuitBreakerState.OPEN) {
          await sendCircuitBreakerAlert(c.env, {
            circuit: cbError.metrics?.name || 'unknown',
            state: cbError.circuitState,
            path: c.req.path,
            failureRate: cbError.metrics?.failureRate || 0,
            totalRequests: cbError.metrics?.totalRequests || 0,
            timestamp: new Date().toISOString(),
          });
        }
      }
      throw error;
    }

    // Log successful requests through circuit breaker
    const responseTime = Date.now() - startTime;
    if (responseTime > 5000) {
      // Log slow requests
      logger.warn('Slow request detected', {
        context: 'performance-monitoring',
        path: c.req.path,
        method: c.req.method,
        responseTime,
        timestamp: new Date().toISOString(),
      });
    }
  };
};

/**
 * Circuit breaker metrics endpoint
 */
export const createCircuitBreakerMetricsRouter = () => {
  const router = new Hono<{ Bindings: Env }>();

  // GET /metrics - Detailed circuit breaker metrics
  router.get('/metrics', async c => {
    try {
      const protectedDb = createProtectedDatabase(c.env.DB);
      const metrics = protectedDb.getMetrics();

      return c.json({
        timestamp: new Date().toISOString(),
        circuits: {
          read: {
            ...metrics.read,
            failureRate: Number(metrics.read.failureRate.toFixed(4)),
            uptime: Math.round(metrics.read.uptime / 1000), // Convert to seconds
          },
          write: {
            ...metrics.write,
            failureRate: Number(metrics.write.failureRate.toFixed(4)),
            uptime: Math.round(metrics.write.uptime / 1000),
          },
          auth: {
            ...metrics.auth,
            failureRate: Number(metrics.auth.failureRate.toFixed(4)),
            uptime: Math.round(metrics.auth.uptime / 1000),
          },
        },
        summary: {
          totalFailures: metrics.read.failures + metrics.write.failures + metrics.auth.failures,
          totalSuccesses: metrics.read.successes + metrics.write.successes + metrics.auth.successes,
          totalRequests:
            metrics.read.totalRequests + metrics.write.totalRequests + metrics.auth.totalRequests,
          openCircuits: [
            metrics.read.state === CircuitBreakerState.OPEN ? 'read' : null,
            metrics.write.state === CircuitBreakerState.OPEN ? 'write' : null,
            metrics.auth.state === CircuitBreakerState.OPEN ? 'auth' : null,
          ].filter(Boolean),
          averageFailureRate: (
            (metrics.read.failureRate + metrics.write.failureRate + metrics.auth.failureRate) /
            3
          ).toFixed(4),
        },
      });
    } catch (error) {
      logError(error, {
        context: 'circuit-breaker-metrics-endpoint',
        timestamp: new Date().toISOString(),
      });
      return c.json({ error: 'Failed to retrieve circuit breaker metrics' }, 500);
    }
  });

  // GET /alerts - Recent circuit breaker alerts
  router.get('/alerts', async c => {
    try {
      // In a real implementation, you would fetch from a logging service or database
      // For now, return a placeholder structure
      return c.json({
        alerts: [],
        message: 'Circuit breaker alerts would be retrieved from your logging/monitoring service',
      });
    } catch (error) {
      logError(error, {
        context: 'circuit-breaker-alerts-endpoint',
        timestamp: new Date().toISOString(),
      });
      return c.json({ error: 'Failed to retrieve alerts' }, 500);
    }
  });

  // POST /reset/:circuit - Reset a specific circuit breaker (admin endpoint)
  router.post('/reset/:circuit', async c => {
    try {
      const circuit = c.req.param('circuit');

      if (!['read', 'write', 'auth'].includes(circuit)) {
        return c.json({ error: 'Invalid circuit name. Must be: read, write, or auth' }, 400);
      }

      const protectedDb = createProtectedDatabase(c.env.DB);

      // Note: This is a manual reset - in production you might want additional authorization
      protectedDb.resetCircuitBreakers();

      logger.info('Circuit breakers manually reset', {
        context: 'circuit-breaker-manual-reset',
        circuit,
        timestamp: new Date().toISOString(),
      });

      return c.json({
        message: `Circuit breakers reset successfully`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logError(error, {
        context: 'circuit-breaker-reset-endpoint',
        timestamp: new Date().toISOString(),
      });
      return c.json({ error: 'Failed to reset circuit breakers' }, 500);
    }
  });

  return router;
};

/**
 * Send circuit breaker alert
 * In production, integrate with your alerting system (PagerDuty, Slack, etc.)
 */
async function sendCircuitBreakerAlert(
  // env: Env,
  alert: {
    circuit: string;
    state: CircuitBreakerState;
    path: string;
    failureRate: number;
    totalRequests: number;
    timestamp: string;
  }
) {
  try {
    // Log the alert
    logger.error('CIRCUIT BREAKER ALERT', {
      context: 'circuit-breaker-alert',
      ...alert,
    });

    // In production, send to your alerting service:
    // - PagerDuty API
    // - Slack webhook
    // - Email service
    // - Discord webhook
    // - Custom webhook

    console.error(`🚨 CIRCUIT BREAKER ALERT: ${alert.circuit} circuit is ${alert.state}`, {
      path: alert.path,
      failureRate: `${(alert.failureRate * 100).toFixed(2)}%`,
      totalRequests: alert.totalRequests,
      timestamp: alert.timestamp,
    });

    // Example Slack webhook (commented out)
    /*
    if (env.SLACK_WEBHOOK_URL) {
      await fetch(env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Circuit Breaker Alert: ${alert.circuit} circuit is ${alert.state}`,
          blocks: [
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Circuit:* ${alert.circuit}` },
                { type: 'mrkdwn', text: `*State:* ${alert.state}` },
                { type: 'mrkdwn', text: `*Path:* ${alert.path}` },
                { type: 'mrkdwn', text: `*Failure Rate:* ${(alert.failureRate * 100).toFixed(2)}%` }
              ]
            }
          ]
        })
      });
    }
    */
  } catch (error) {
    logError(error, {
      context: 'circuit-breaker-alert-sending',
      alertInfo: alert,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Performance monitoring for database operations
 */
export const performanceMonitoring = () => {
  return async (c: any, next: any) => {
    const startTime = Date.now();
    const path = c.req.path;
    const method = c.req.method;

    try {
      await next();

      const responseTime = Date.now() - startTime;
      const status = c.res.status;

      // Log performance metrics
      if (responseTime > 3000) {
        // Log requests over 3 seconds
        logger.warn('Slow database operation detected', {
          context: 'performance-monitoring',
          path,
          method,
          responseTime,
          status,
          timestamp: new Date().toISOString(),
        });
      }

      // Track successful operations
      if (status >= 200 && status < 400) {
        logger.debug('Successful operation', {
          context: 'performance-monitoring',
          path,
          method,
          responseTime,
          status,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;

      logError(error, {
        context: 'performance-monitoring-error',
        path,
        method,
        responseTime,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  };
};
