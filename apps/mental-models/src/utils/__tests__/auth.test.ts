// Tests for authentication and authorization

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  authenticate,
  hasRole,
  getSession,
  clearSession,
  isAuthenticated,
  getCurrentRole,
  extendSession,
  getSessionTimeRemaining,
  type Role,
} from '../auth';

describe('Authentication', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock environment variable
    vi.stubEnv('VITE_ADMIN_PASSWORD', 'test_password');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('authenticate', () => {
    it('authenticates with correct password', () => {
      const result = authenticate('test_password', 'admin');
      expect(result).toBe(true);
      expect(isAuthenticated()).toBe(true);
    });

    it('rejects incorrect password', () => {
      const result = authenticate('wrong_password', 'admin');
      expect(result).toBe(false);
      expect(isAuthenticated()).toBe(false);
    });

    it('creates session with correct role', () => {
      authenticate('test_password', 'analyst');
      const session = getSession();

      expect(session).toBeTruthy();
      expect(session?.role).toBe('analyst');
      expect(session?.authenticated).toBe(true);
    });

    it('sets session expiration', () => {
      authenticate('test_password', 'admin');
      const session = getSession();

      expect(session).toBeTruthy();
      expect(session?.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe('hasRole', () => {
    it('returns true for matching role', () => {
      authenticate('test_password', 'admin');
      expect(hasRole('admin')).toBe(true);
    });

    it('returns false for higher required role', () => {
      authenticate('test_password', 'content_editor');
      expect(hasRole('admin')).toBe(false);
    });

    it('returns true for lower required role (hierarchy)', () => {
      authenticate('test_password', 'admin');
      expect(hasRole('analyst')).toBe(true);
      expect(hasRole('content_editor')).toBe(true);
      expect(hasRole('user')).toBe(true);
    });

    it('returns false when not authenticated', () => {
      expect(hasRole('user')).toBe(false);
    });

    it('returns false for expired session', () => {
      authenticate('test_password', 'admin');

      // Manually expire session
      const session = getSession();
      if (session) {
        session.expiresAt = Date.now() - 1000;
        localStorage.setItem('hummbl_auth_session', JSON.stringify(session));
      }

      expect(hasRole('admin')).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('retrieves current session', () => {
      authenticate('test_password', 'admin');
      const session = getSession();

      expect(session).toBeTruthy();
      expect(session?.userId).toBe('admin');
    });

    it('returns null when no session', () => {
      const session = getSession();
      expect(session).toBeNull();
    });

    it('clears session on logout', () => {
      authenticate('test_password', 'admin');
      expect(isAuthenticated()).toBe(true);

      clearSession();
      expect(isAuthenticated()).toBe(false);
      expect(getSession()).toBeNull();
    });

    it('extends session expiration', () => {
      authenticate('test_password', 'admin');
      const originalSession = getSession();
      const originalExpiry = originalSession?.expiresAt;

      // Wait a bit
      setTimeout(() => {
        extendSession();
        const extendedSession = getSession();

        expect(extendedSession?.expiresAt).toBeGreaterThan(originalExpiry!);
      }, 100);
    });

    it('returns current role', () => {
      authenticate('test_password', 'analyst');
      expect(getCurrentRole()).toBe('analyst');
    });

    it('returns null role when not authenticated', () => {
      expect(getCurrentRole()).toBeNull();
    });

    it('formats time remaining', () => {
      authenticate('test_password', 'admin');
      const timeRemaining = getSessionTimeRemaining();

      expect(timeRemaining).toContain('h');
      expect(timeRemaining).toContain('m');
    });

    it('shows expired for past sessions', () => {
      authenticate('test_password', 'admin');

      // Manually expire
      const session = getSession();
      if (session) {
        session.expiresAt = Date.now() - 1000;
        localStorage.setItem('hummbl_auth_session', JSON.stringify(session));
      }

      // When session is expired but not yet cleared
      const timeRemaining = getSessionTimeRemaining();
      expect(['Expired', 'No session']).toContain(timeRemaining);
    });
  });

  describe('Role Hierarchy', () => {
    const roles: Role[] = ['admin', 'analyst', 'content_editor', 'user'];

    it('admin has all permissions', () => {
      authenticate('test_password', 'admin');

      roles.forEach((role) => {
        expect(hasRole(role)).toBe(true);
      });
    });

    it('analyst has analyst and user permissions', () => {
      authenticate('test_password', 'analyst');

      expect(hasRole('admin')).toBe(false);
      expect(hasRole('analyst')).toBe(true);
      expect(hasRole('content_editor')).toBe(true);
      expect(hasRole('user')).toBe(true);
    });

    it('content_editor has content_editor and user permissions', () => {
      authenticate('test_password', 'content_editor');

      expect(hasRole('admin')).toBe(false);
      expect(hasRole('analyst')).toBe(false);
      expect(hasRole('content_editor')).toBe(true);
      expect(hasRole('user')).toBe(true);
    });

    it('user has only user permissions', () => {
      authenticate('test_password', 'user');

      expect(hasRole('admin')).toBe(false);
      expect(hasRole('analyst')).toBe(false);
      expect(hasRole('content_editor')).toBe(false);
      expect(hasRole('user')).toBe(true);
    });
  });
});
