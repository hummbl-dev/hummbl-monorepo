import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireEmailVerification?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireEmailVerification = false,
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show loading state while checking authentication
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireEmailVerification && !user.email_verified) {
    // Redirect to email verification page if email is not verified
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
