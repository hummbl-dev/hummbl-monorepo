// Tests for authService

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthService } from '../authService';

// Mock fetch
global.fetch = vi.fn();

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService('/api');
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    authService.destroy();
  });

  describe('register', () => {
    it('registers a new user', async () => {
      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test',
          role: 'user' as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        tokens: { accessToken: 'token', refreshToken: 'refresh', expiresIn: 3600 },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password',
        name: 'Test',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBe('token');
    });

    it('throws error on registration failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email already exists' }),
      });

      await expect(
        authService.register({ email: 'test@example.com', password: 'pass', name: 'Test' })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('logs in successfully', async () => {
      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test',
          role: 'user' as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        tokens: { accessToken: 'token', refreshToken: 'refresh', expiresIn: 3600 },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('clears authentication', async () => {
      // Setup authenticated state
      localStorage.setItem(
        'hummbl_auth',
        JSON.stringify({
          user: { id: '1', email: 'test@example.com' },
          tokens: { accessToken: 'token', refreshToken: 'refresh' },
        })
      );

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      await authService.logout();

      expect(authService.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('hummbl_auth')).toBeNull();
    });
  });

  describe('token management', () => {
    it('gets access token', () => {
      localStorage.setItem(
        'hummbl_auth',
        JSON.stringify({
          user: { id: '1' },
          tokens: { accessToken: 'test-token', refreshToken: 'refresh' },
        })
      );

      expect(authService.getAccessToken()).toBe('test-token');
    });

    it('returns null when no token', () => {
      expect(authService.getAccessToken()).toBeNull();
    });
  });
});
