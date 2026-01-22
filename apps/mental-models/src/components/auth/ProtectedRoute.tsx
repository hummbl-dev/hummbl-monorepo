// Protected route wrapper with RBAC

import React, { useState, useEffect } from 'react';
import { hasRole } from '../../utils/auth';
import { LoginModal } from './LoginModal';
import type { Role } from '../../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'admin',
}) => {
  const [authorized, setAuthorized] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [requiredRole]);

  const checkAuth = () => {
    const isAuthorized = hasRole(requiredRole);
    setAuthorized(isAuthorized);
    setShowLogin(!isAuthorized);
    setChecked(true);
  };

  const handleLoginSuccess = () => {
    setAuthorized(true);
    setShowLogin(false);
  };

  const handleLoginCancel = () => {
    setShowLogin(false);
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
          <button onClick={() => setShowLogin(true)}>Login</button>
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
