// Environment-based auth for internal tool
// In production, replace with proper auth provider

import { createLogger } from '@hummbl/core';

const logger = createLogger('dashboard:auth');

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface AuthContext {
  authenticated: boolean;
  role: UserRole;
  userId: string;
}

// Role permissions for governance operations
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['freeze', 'unfreeze', 'incident', 'resolve', 'view', 'check'],
  operator: ['incident', 'resolve', 'view', 'check'],
  viewer: ['view', 'check'],
};

export function canPerform(role: UserRole, action: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}

// Simple env-based auth for internal dashboard
export function getAuthContext(): AuthContext {
  const secret = import.meta.env.VITE_DASHBOARD_SECRET;
  const role = (import.meta.env.VITE_DASHBOARD_ROLE as UserRole) || 'viewer';

  // In dev mode without secret, allow viewer access
  if (import.meta.env.DEV && !secret) {
    return {
      authenticated: true,
      role: 'admin', // Dev mode gets admin
      userId: 'dev-user',
    };
  }

  // In production, require secret
  if (!secret || secret.length < 32) {
    return {
      authenticated: false,
      role: 'viewer',
      userId: 'anonymous',
    };
  }

  return {
    authenticated: true,
    role,
    userId: `user-${secret.slice(0, 8)}`,
  };
}

// Audit logging for dashboard actions
export function logDashboardAction(
  action: string,
  details: Record<string, unknown>,
  auth: AuthContext
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    userId: auth.userId,
    role: auth.role,
    details,
  };

  // Log audit event
  logger.info('Dashboard action', entry);
}
