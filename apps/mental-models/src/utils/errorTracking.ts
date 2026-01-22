import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/browser';

/**
 * Initialize error tracking with Sentry
 * @param config Configuration options for Sentry
 */
export function initErrorTracking(config: {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  release: string;
  debug?: boolean;
  tracesSampleRate?: number;
}) {
  if (!config.dsn) {
    console.warn('Sentry DSN not provided. Error tracking will be disabled.');
    return;
  }

  try {
    const integrations: any[] = [];
    
    // Only add BrowserTracing in production
    if (process.env.NODE_ENV === 'production') {
      integrations.push(
        new BrowserTracing({
          tracingOrigins: ['localhost', /^https?:\/\/api\.hummbl\.io/],
        })
      );
    }

    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      debug: config.debug || process.env.NODE_ENV === 'development',
      integrations,
      tracesSampleRate: config.tracesSampleRate ?? 0.1, // 10% of transactions for performance monitoring
      beforeSend(event) {
        // Filter out common non-actionable errors
        const ignoreErrors = [
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed with undelivered notifications',
          'ChunkLoadError',
        ];

        if (event.message) {
          for (const error of ignoreErrors) {
            if (event.message.includes(error)) {
              return null;
            }
          }
        }

        return event;
      },
    });

    // Add user context when available
    const setUser = (user: { id: string; email?: string; username?: string }) => {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    };

    // Clear user context on logout
    const clearUser = () => {
      Sentry.setUser(null);
    };

    return { setUser, clearUser };
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

/**
 * Report an error to Sentry
 * @param error The error to report
 * @param context Additional context data
 */
export function captureError(
  error: Error,
  context?: Record<string, unknown>
) {
  if (!Sentry.getClient()) {
    console.error('Sentry not initialized. Error:', error, 'Context:', context);
    return;
  }

  const eventId = Sentry.captureException(error, {
    contexts: {
      ...(context && { context }),
    },
  });

  return eventId;
}

/**
 * Report a message to Sentry
 * @param message The message to report
 * @param level The severity level
 * @param context Additional context data
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'error',
  context?: Record<string, unknown>
) {
  if (!Sentry.getClient()) {
    console[level === 'warning' ? 'warn' : 'error'](
      `[${level.toUpperCase()}] ${message}`,
      'Context:',
      context
    );
    return;
  }

  const eventId = Sentry.captureMessage(message, {
    level,
    contexts: {
      ...(context && { context }),
    },
  });

  return eventId;
}

/**
 * Wraps a React component with ErrorBoundary
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

export default {
  init: initErrorTracking,
  captureError,
  captureMessage,
  ErrorBoundary,
};
