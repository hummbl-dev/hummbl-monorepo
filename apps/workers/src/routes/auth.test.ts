import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { Hono } from 'hono';
import authRouter from './auth';
import type { Env } from '../env';

const createEnv = (): Env => ({
  DB: {} as D1Database,
  CACHE: {} as KVNamespace<string>,
  ASSETS: {} as R2Bucket,
  ENVIRONMENT: 'test',
  API_VERSION: 'v1',
  JWT_SECRET: '<test-jwt-secret>',
  PASSWORD_SALT: '<test-password-salt>',
  GITHUB_CLIENT_ID: '<test-github-client-id>',
  GITHUB_CLIENT_SECRET: '<test-github-client-secret>',
  GOOGLE_CLIENT_ID: '<test-google-client-id>',
  GOOGLE_CLIENT_SECRET: '<test-google-client-secret>',
});

const createApp = () => {
  const app = new Hono<{ Bindings: Env }>();
  app.route('/v1/auth', authRouter);
  return app;
};

describe('authRouter CSRF Protection', () => {
  it('rejects POST without CSRF token or origin', async () => {
    const app = createApp();
    const request = new Request('https://api.test/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const response = await app.fetch(request, createEnv());

    expect(response.status).toBe(403);
  });

  it('accepts POST with X-CSRF-Token header', async () => {
    const app = createApp();
    const request = new Request('https://api.test/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'valid-token-123',
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const response = await app.fetch(request, createEnv());

    // Should not be 403 (CSRF passed, other validation may fail)
    expect(response.status).not.toBe(403);
  });

  it('accepts POST with valid origin header', async () => {
    const app = createApp();
    const request = new Request('https://api.test/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://hummbl.dev',
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const response = await app.fetch(request, createEnv());

    // Should not be 403 (CSRF passed via origin)
    expect(response.status).not.toBe(403);
  });

  it('accepts POST with X-Requested-With header', async () => {
    const app = createApp();
    const request = new Request('https://api.test/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const response = await app.fetch(request, createEnv());

    // Should not be 403
    expect(response.status).not.toBe(403);
  });

  it('rejects invalid origin', async () => {
    const app = createApp();
    const request = new Request('https://api.test/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil.com',
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const response = await app.fetch(request, createEnv());

    expect(response.status).toBe(403);
  });

  it('rejects short CSRF token', async () => {
    const app = createApp();
    const request = new Request('https://api.test/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'short',
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const response = await app.fetch(request, createEnv());

    expect(response.status).toBe(403);
  });

  it('GET request bypasses CSRF check', async () => {
    const app = createApp();
    const request = new Request('https://api.test/v1/auth/providers');

    const response = await app.fetch(request, createEnv());

    // GET requests don't require CSRF protection
    expect(response.status).not.toBe(403);
  });
});
