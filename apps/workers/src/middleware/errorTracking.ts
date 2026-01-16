/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * Error Tracking Middleware for Cloudflare Workers
 * Integrates with the centralized error tracking system
 */

import type { Context, Next } from 'hono';
import {
  trackError,
  addBreadcrumb,
  ErrorSeverity,
  ErrorCategory,
  classifyError,
  type ErrorMetadata,
} from '@hummbl/core';

interface RequestContext {
  requestId: string;
  userId?: string;
  path: string;
  method: string;
  userAgent?: string;
  ip?: string;
  startTime: number;
}

export function errorTrackingMiddleware() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const requestId = generateRequestId();

    // Build request context
    const requestContext: RequestContext = {
      requestId,
      path: c.req.path,
      method: c.req.method,
      userAgent: c.req.header('User-Agent'),
      ip: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown',
      startTime,
    };

    // Extract user ID from auth header if available
    const authHeader = c.req.header('Authorization');
    if (authHeader) {
      try {
        // This would depend on your auth implementation
        // For now, we'll extract from a hypothetical JWT or session
        requestContext.userId = extractUserIdFromAuth(authHeader);
      } catch (err) {
        // Ignore auth extraction errors
      }
    }

    // Add breadcrumb for the request
    addBreadcrumb('http-request', `${requestContext.method} ${requestContext.path}`, 'info', {
      requestId,
      userAgent: requestContext.userAgent,
      ip: requestContext.ip,
    });

    // Store request context for error handling
    c.set('requestContext', requestContext);

    try {
      await next();

      // Track successful response metrics
      const responseTime = Date.now() - startTime;
      const status = c.res.status;

      // Log slow requests as performance issues
      if (responseTime > 2000) {
        trackError(
          new Error(`Slow request: ${responseTime}ms`),
          buildErrorMetadata(ErrorCategory.PERFORMANCE, ErrorSeverity.MEDIUM, requestContext, {
            responseTime,
            httpStatus: status,
          }),
          {
            responseTime,
            httpStatus: status,
            type: 'slow-request',
          }
        );
      }

      // Track 4xx errors as user input issues
      if (status >= 400 && status < 500) {
        const category =
          status === 401 || status === 403
            ? ErrorCategory.AUTHENTICATION
            : ErrorCategory.USER_INPUT;

        trackError(
          new Error(`HTTP ${status}: ${c.res.statusText || getStatusText(status)}`),
          buildErrorMetadata(category, ErrorSeverity.LOW, requestContext, {
            responseTime: Date.now() - startTime,
            httpStatus: status,
          }),
          {
            httpStatus: status,
            responseTime: Date.now() - startTime,
            type: 'client-error',
          }
        );
      }
    } catch (err) {
      const responseTime = Date.now() - startTime;

      // Classify and track the error
      const classification = classifyError(err instanceof Error ? error : new Error(String(err)));

      const errorId = trackError(
        err instanceof Error ? error : new Error(String(err)),
        buildErrorMetadata(classification.category, classification.severity, requestContext, {
          responseTime,
        }),
        {
          stack: err instanceof Error ? err.stack : undefined,
          responseTime,
          type: 'request-handler-error',
        }
      );

      // Add error ID to response headers for debugging
      c.res.headers.set('X-Error-ID', errorId);

      // Rethrow to let the global error handler deal with it
      throw err;
    }
  };
}

export function enhancedErrorHandler() {
  return async (error: Error, c: Context) => {
    const requestContext = c.get('requestContext') as RequestContext | undefined;
    const responseTime = requestContext ? Date.now() - requestContext.startTime : 0;

    // Add breadcrumb for the error
    addBreadcrumb('error-handler', `Unhandled error: ${error.message}`, 'error', {
      requestId: requestContext?.requestId,
      path: requestContext?.path,
      method: requestContext?.method,
    });

    // Classify the error
    const classification = classifyError(error);

    // Track the error if not already tracked
    const errorId = trackError(
      error,
      buildErrorMetadata(classification.category, classification.severity, requestContext, {
        responseTime,
      }),
      {
        stack: err.stack,
        responseTime,
        type: 'unhandled-error',
        handlerType: 'global-error-handler',
      }
    );

    // Determine response based on error type and severity
    const statusCode = getErrorStatusCode(error, classification);
    const responseBody = buildErrorResponse(error, errorId, classification);

    // Add error tracking headers
    c.res.headers.set('X-Error-ID', errorId);
    c.res.headers.set('X-Error-Category', classification.category);

    return c.json(responseBody, statusCode);
  };
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractUserIdFromAuth(authHeader: string): string | undefined {
  // This is a placeholder - implement based on your auth system
  // For JWT: decode and extract user ID
  // For API key: lookup user ID from key
  // For session: extract from session token

  if (authHeader.startsWith('Bearer ')) {
    // Placeholder for JWT decoding
    // const token = authHeader.substring(7);
    // const decoded = jwt.decode(token);
    // return decoded?.sub;
  }

  return undefined;
}

function buildErrorMetadata(
  category: ErrorCategory,
  severity: ErrorSeverity,
  requestContext?: RequestContext,
  performance?: { responseTime?: number; httpStatus?: number }
): ErrorMetadata {
  return {
    severity,
    category,
    userId: requestContext?.userId,
    requestId: requestContext?.requestId,
    endpoint: requestContext ? `${requestContext.method} ${requestContext.path}` : undefined,
    userAgent: requestContext?.userAgent,
    ip: requestContext?.ip,
    timestamp: new Date().toISOString(),
    performance: performance
      ? {
          responseTime: performance.responseTime,
          ...(performance.httpStatus && { httpStatus: performance.httpStatus }),
        }
      : undefined,
    tags: {
      environment: 'cloudflare-workers',
      source: 'backend',
      requestId: requestContext?.requestId || 'unknown',
    },
  };
}

function getErrorStatusCode(
  error: Error,
  classification: { category: ErrorCategory; severity: ErrorSeverity }
): number {
  // Map error types to HTTP status codes
  switch (classification.category) {
    case ErrorCategory.AUTHENTICATION:
      return 401;
    case ErrorCategory.AUTHORIZATION:
      return 403;
    case ErrorCategory.VALIDATION:
    case ErrorCategory.USER_INPUT:
      return 400;
    case ErrorCategory.RATE_LIMIT:
      return 429;
    case ErrorCategory.DATABASE:
    case ErrorCategory.NETWORK:
    case ErrorCategory.SYSTEM:
      return 500;
    case ErrorCategory.PERFORMANCE:
      return 503;
    default:
      return 500;
  }
}

function buildErrorResponse(
  error: Error,
  errorId: string,
  classification: { category: ErrorCategory; severity: ErrorSeverity }
): Record<string, unknown> {
  const baseResponse = {
    error: true,
    errorId,
    message: getPublicErrorMessage(error, classification),
    timestamp: new Date().toISOString(),
  };

  // Include additional details based on severity and environment
  if (classification.severity === ErrorSeverity.CRITICAL) {
    return {
      ...baseResponse,
      severity: 'critical',
      support: 'Please contact support with this error ID for immediate assistance.',
    };
  }

  // In development, include more details
  if (process.env.NODE_ENV === 'development') {
    return {
      ...baseResponse,
      details: {
        originalMessage: error.message,
        category: classification.category,
        severity: classification.severity,
        stack: err.stack?.split('\n').slice(0, 5), // Limit stack trace
      },
    };
  }

  return baseResponse;
}

function getPublicErrorMessage(
  error: Error,
  classification: { category: ErrorCategory; severity: ErrorSeverity }
): string {
  // Return user-friendly messages based on error category
  switch (classification.category) {
    case ErrorCategory.AUTHENTICATION:
      return 'Authentication failed. Please check your credentials.';
    case ErrorCategory.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ErrorCategory.VALIDATION:
    case ErrorCategory.USER_INPUT:
      return 'The request contains invalid data. Please check your input.';
    case ErrorCategory.RATE_LIMIT:
      return 'Too many requests. Please try again later.';
    case ErrorCategory.DATABASE:
      return 'A database error occurred. Please try again.';
    case ErrorCategory.NETWORK:
      return 'A network error occurred. Please check your connection.';
    case ErrorCategory.PERFORMANCE:
      return 'The service is experiencing high load. Please try again.';
    case ErrorCategory.MCP_TOOL:
      return 'An external tool error occurred. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return statusTexts[status] || 'Unknown Status';
}
