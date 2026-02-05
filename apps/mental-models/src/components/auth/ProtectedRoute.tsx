// Protected route wrapper with RBAC

import React, { useState, useEffect } from 'react';
import { hasRole } from '../../utils/auth';
import { LoginModal } from './LoginModal';
import type { Role } from '../../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

interface AuthState {
  authorized: boolean;
  showLogin: boolean;
  checked: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'admin',
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    authorized: false,
    showLogin: false,
    checked: false,
  });

  useEffect(() => {
    const isAuthorized = hasRole(requiredRole);
    setAuthState({
      authorized: isAuthorized,
      showLogin: !isAuthorized,
      checked: true,
    });
  }, [requiredRole]);

  const { authorized, showLogin, checked } = authState;

  const handleLoginSuccess = () => {
    setAuthState((prev) => ({ ...prev, authorized: true, showLogin: false }));
  };

  const handleLoginCancel = () => {
    setAuthState((prev) => ({ ...prev, showLogin: false }));
    // Redirect to home or show access denied
    window.location.href = '/';
  };

  if (!checked) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Checking authorization...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Access Restricted</h2>
          <p>This page requires admin access.</p>
          <button onClick={() => setAuthState((prev) => ({ ...prev, showLogin: true }))}>
            Login
          </button>
        </div>

        {showLogin && (
          <LoginModal
            isOpen={showLogin}
            onClose={handleLoginCancel}
            onSuccess={handleLoginSuccess}
          />
        )}
      </>
    );
  }

  return <>{children}</>;
};
