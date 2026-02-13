import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiError, respondWithResult } from './api';
import type { Context } from 'hono';
import type { Env } from '../env';
import type { Result } from '@hummbl/core';

const createMockContext = (): Context<{ Bindings: Env }> => {
  const jsonMock = vi.fn();
  return {
    json: jsonMock,
  } as unknown as Context<{ Bindings: Env }>;
};

describe('createApiError', () => {
  it('creates a basic API error', () => {
    const error = createApiError('test_error', 'Test error message', 400);

    expect(error.code).toBe('test_error');
    expect(error.message).toBe('Test error message');
    expect(error.status).toBe(400);
  });

  it('sanitizes HTML characters in code', () => {
    const error = createApiError('<script>alert(1)</script>', 'Test message', 400);

    expect(error.code).not.toContain('<');
    expect(error.code).not.toContain('>');
  });

  it('sanitizes HTML characters in message', () => {
    const error = createApiError('test', '<script>alert(1)</script>', 400);

    expect(error.message).not.toContain('<');
    expect(error.message).not.toContain('>');
  });

  it('truncates long codes to 50 chars', () => {
    const longCode = 'a'.repeat(100);
    const error = createApiError(longCode, 'Test message', 400);

    expect(error.code.length).toBeLessThanOrEqual(50);
  });

  it('truncates long messages to 200 chars', () => {
    const longMessage = 'a'.repeat(500);
    const error = createApiError('test', longMessage, 400);

    expect(error.message.length).toBeLessThanOrEqual(200);
  });

  it('defaults to 500 for invalid status codes', () => {
    const error = createApiError('test', 'message', 200 as never);

    expect(error.status).toBe(500);
  });

  it('includes details when provided', () => {
    const details = { field: 'email', issue: 'invalid' };
    const error = createApiError('test', 'message', 400, details);

    expect(error.details).toBeDefined();
  });

  it('handles non-string code gracefully', () => {
    const error = createApiError(123 as never, 'message', 400);

    expect(error.code).toBe('unknown_error');
  });

  it('handles non-string message gracefully', () => {
    const error = createApiError('test', null as never, 400);

    expect(error.message).toBe('An error occurred');
  });
});

describe('respondWithResult', () => {
  it('returns success response for ok result', () => {
    const c = createMockContext();
    const result: Result<{ data: string }, never> = {
      ok: true,
      value: { data: 'test' },
    };

    respondWithResult(c, result, 200);

    expect(c.json).toHaveBeenCalledWith(
      {
        ok: true,
        value: { data: 'test' },
      },
      200
    );
  });

  it('returns error response for failed result', () => {
    const c = createMockContext();
    const error = createApiError('test_error', 'Test error', 400);
    const result: Result<never, typeof error> = {
      ok: false,
      error,
    };

    respondWithResult(c, result, 200);

    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({
          code: 'test_error',
          message: 'Test error',
        }),
      }),
      400
    );
  });

  it('uses custom success status', () => {
    const c = createMockContext();
    const result: Result<{ created: boolean }, never> = {
      ok: true,
      value: { created: true },
    };

    respondWithResult(c, result, 201);

    expect(c.json).toHaveBeenCalledWith(
      {
        ok: true,
        value: { created: true },
      },
      201
    );
  });
});
