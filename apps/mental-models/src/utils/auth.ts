// Authentication and authorization utilities

export type Role = 'user' | 'admin' | 'content_editor' | 'analyst';

export interface AuthSession {
  userId: string;
  role: Role;
  authenticated: boolean;
  expiresAt: number;
}

const AUTH_SESSION_KEY = 'hummbl_auth_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if user has required role
 */
export function hasRole(requiredRole: Role): boolean {
  const session = getSession();

  if (!session || !session.authenticated) {
    return false;
  }

  // Check if session expired
  if (Date.now() > session.expiresAt) {
    clearSession();
    return false;
  }

  // Role hierarchy: admin > analyst > content_editor > user
  const roleHierarchy: Record<Role, number> = {
    admin: 3,
    analyst: 2,
    content_editor: 1,
    user: 0,
  };

  return roleHierarchy[session.role] >= roleHierarchy[requiredRole];
}

/**
 * Authenticate with password (basic auth)
 */
export function authenticate(password: string, role: Role = 'admin'): boolean {
  const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  if (password === expectedPassword) {
    const session: AuthSession = {
      userId: 'admin', // In production, this would come from backend
      role,
      authenticated: true,
      expiresAt: Date.now() + SESSION_DURATION,
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    return true;
  }

  return false;
}

/**
 * Get current session
 */
export function getSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(AUTH_SESSION_KEY);
    if (!stored) return null;

    const session: AuthSession = JSON.parse(stored);

    // Check expiration
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

/**
 * Clear session (logout)
 */
export function clearSession(): void {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const session = getSession();
  return session?.authenticated === true && Date.now() < session.expiresAt;
}

/**
 * Get current user role
 */
export function getCurrentRole(): Role | null {
  const session = getSession();
  return session?.role || null;
}

/**
 * Extend session expiration
 */
export function extendSession(): void {
  const session = getSession();
  if (session) {
    session.expiresAt = Date.now() + SESSION_DURATION;
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Format time until expiration
 */
export function getSessionTimeRemaining(): string {
  const session = getSession();
  if (!session) return 'No session';

  const remaining = session.expiresAt - Date.now();
  if (remaining <= 0) return 'Expired';

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  return `${hours}h ${minutes}m`;
}
