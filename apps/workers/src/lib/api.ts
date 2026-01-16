import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { Env } from '../env';
import type { Result } from '@hummbl/core';
import { createLogger, logError } from '@hummbl/core';

// Create logger instance for API operations
const logger = createLogger('api');

export interface ApiError {
  code: string;
  message: string;
  status: ContentfulStatusCode;
  details?: unknown;
}

export const createApiError = (
  code: string,
  message: string,
  status: ContentfulStatusCode,
  details?: unknown
): ApiError => {
  try {
    // Validate and sanitize inputs
    const sanitizedCode =
      typeof code === 'string' ? code.replace(/[<>"'&]/g, '').substring(0, 50) : 'unknown_error';
    const sanitizedMessage =
      typeof message === 'string'
        ? message.replace(/[<>"'&]/g, '').substring(0, 200)
        : 'An error occurred';
    const validStatus = typeof status === 'number' && status >= 400 && status < 600 ? status : 500;

    const error: ApiError = {
      code: sanitizedCode,
      message: sanitizedMessage,
      status: validStatus,
    };

    // Only include details if they exist and are safe to expose
    if (details !== undefined && details !== null) {
      error.details = sanitizeErrorDetails(details);
    }

    return error;
  } catch (error) {
    logError(error, { context: 'api-error-creation', timestamp: new Date().toISOString() });
    return {
      code: 'error_creation_failed',
      message: 'Failed to create error response',
      status: 500,
    };
  }
};

export const respondWithResult = <T>(
  c: Context<{ Bindings: Env }>,
  result: Result<T, ApiError>,
  successStatus = 200 as const
) => {
  try {
    if (result.ok) {
      // Sanitize success response
      let sanitizedValue;
      try {
        sanitizedValue = sanitizeResponseData(result.value);
      } catch (error) {
        logError(error, {
          context: 'api-response-sanitization',
          timestamp: new Date().toISOString(),
        });
        return c.json(
          {
            ok: false,
            error: {
              code: 'sanitization_error',
              message: 'Failed to process response data',
              details: null,
            },
          },
          500
        );
      }

      return c.json(
        {
          ok: true,
          value: sanitizedValue,
        },
        successStatus
      );
    }

    // Sanitize error response
    const sanitizedError = {
      code:
        typeof result.error.code === 'string'
          ? result.error.code.substring(0, 50)
          : 'unknown_error',
      message:
        typeof result.error.message === 'string'
          ? result.error.message.substring(0, 200)
          : 'An error occurred',
      details: sanitizeErrorDetails(result.error.details),
    };

    const status =
      typeof result.error.status === 'number' &&
      result.error.status >= 400 &&
      result.error.status < 600
        ? result.error.status
        : 500;

    return c.json(
      {
        ok: false,
        error: sanitizedError,
      },
      status
    );
  } catch (error) {
    logError(error, { context: 'api-respond-with-result', timestamp: new Date().toISOString() });
    return c.json(
      {
        ok: false,
        error: {
          code: 'response_error',
          message: 'Failed to generate response',
          details: null,
        },
      },
      500
    );
  }
};

// Helper function to sanitize response data
function sanitizeResponseData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return data.replace(/[<>"'&]/g, '').substring(0, 10000);
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.slice(0, 1000).map(item => sanitizeResponseData(item));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    let count = 0;
    for (const [key, value] of Object.entries(data)) {
      if (count >= 100) break; // Limit object size
      const sanitizedKey = String(key)
        .replace(/[<>"'&]/g, '')
        .substring(0, 100);
      if (sanitizedKey.length > 0) {
        sanitized[sanitizedKey] = sanitizeResponseData(value);
        count++;
      }
    }
    return sanitized;
  }

  return String(data)
    .replace(/[<>"'&]/g, '')
    .substring(0, 1000);
}

// Helper function to sanitize error details
function sanitizeErrorDetails(details: unknown): unknown {
  if (!details) {
    return null;
  }

  // Don't expose sensitive error details in production
  if (typeof details === 'object' && details !== null) {
    const sanitized: Record<string, unknown> = {};
    const allowedKeys = ['field', 'expected', 'received', 'path', 'code'];

    for (const [key, value] of Object.entries(details)) {
      if (allowedKeys.includes(key) && typeof value === 'string') {
        sanitized[key] = value.substring(0, 100);
      }
    }

    return Object.keys(sanitized).length > 0 ? sanitized : null;
  }

  if (typeof details === 'string') {
    return details.substring(0, 200);
  }

  return null;
}

export const logCacheError = (message: string, error: unknown) => {
  try {
    const sanitizedMessage =
      typeof message === 'string' ? message.substring(0, 200) : 'Cache error';

    // Sanitize error for logging to prevent log injection
    let sanitizedError;
    if (error instanceof Error) {
      sanitizedError = {
        name: error.name.substring(0, 100),
        message: error.message.substring(0, 500),
        stack: error.stack ? error.stack.substring(0, 2000) : undefined,
      };
    } else if (typeof error === 'string') {
      sanitizedError = error.substring(0, 500);
    } else {
      sanitizedError = 'Unknown error type';
    }

    logger.warn(sanitizedMessage, {
      context: 'cache-error-logging',
      ...(typeof sanitizedError === 'object' && sanitizedError !== null ? sanitizedError : {}),
      timestamp: new Date().toISOString(),
    });
  } catch (logError) {
    logger.error('Error logging cache error', {
      context: 'cache-error-logging-failure',
      error: logError,
      timestamp: new Date().toISOString(),
    });
  }
};
