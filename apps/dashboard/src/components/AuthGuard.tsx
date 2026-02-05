import * as React from 'react';
import { getAuthContext, type AuthContext } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'operator' | 'viewer';
}

export const AuthContextValue = React.createContext<AuthContext | null>(null);

export function useAuth(): AuthContext {
  const context = React.useContext(AuthContextValue);
  if (!context) {
    throw new Error('useAuth must be used within AuthGuard');
  }
  return context;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole = 'viewer' }) => {
  const [auth, setAuth] = React.useState<AuthContext | null>(null);

  React.useEffect(() => {
    setAuth(getAuthContext());
  }, []);

  if (!auth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!auth.authenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">Access Denied</h1>
          <p className="text-zinc-400">
            Set VITE_DASHBOARD_SECRET environment variable to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  const roleHierarchy = { admin: 3, operator: 2, viewer: 1 };
  if (roleHierarchy[auth.role] < roleHierarchy[requiredRole]) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">Insufficient Permissions</h1>
          <p className="text-zinc-400">
            This page requires {requiredRole} role. You have {auth.role} role.
          </p>
        </div>
      </div>
    );
  }

  return <AuthContextValue.Provider value={auth}>{children}</AuthContextValue.Provider>;
};
