import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AuthContext,
  type AuthContextType,
  type User,
  type ApiError,
  type AuthResponse,
  type AuthTokens,
} from './AuthContext';
import { api } from '../lib';
import { toast } from 'sonner';

const AUTH_TOKEN_KEY = 'hummbl_auth_token';
const REFRESH_TOKEN_KEY = 'hummbl_refresh_token';
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRefreshing = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Set auth token in axios headers when it changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, [token]);

  // Clear auth state
  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  }, []);

  // Handle login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post<AuthResponse>('/auth/login', { email, password });

      if (response.data) {
        const { user, token, refreshToken } = response.data;
        setUser(user);
        setToken(token);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        toast.success('Logged in successfully');
        return { success: true };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      const message = (error as ApiError).response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle registration
  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post<{ success: boolean }>('/auth/register', {
        name,
        email,
        password,
      });

      if (response.data.success) {
        toast.success('Registration successful! Please check your email to verify your account.');
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      const message = (error as ApiError).response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle logout
  const logout = useCallback(
    async (options?: { silent?: boolean; returnTo?: string }) => {
      const { silent = false, returnTo } = options || {};

      try {
        // Try to call the logout endpoint if we have a token
        if (token) {
          try {
            await api.post('/auth/logout');
          } catch (error) {
            // If the server is unreachable, still clear local auth
            console.error('Error during logout:', error);
          }
        }

        clearAuth();

        if (!silent) {
          toast.success('You have been logged out successfully');
        }

        // Redirect to login or specified path
        navigate(returnTo || '/login', {
          state: { from: location.pathname !== '/logout' ? location.pathname : undefined },
        });
      } catch (error) {
        console.error('Logout error:', error);
        if (!silent) {
          toast.error('An error occurred during logout');
        }
      }
    },
    [token, clearAuth, navigate, location.pathname]
  );

  // Verify email
  const verifyEmail = useCallback(async (token: string) => {
    try {
      await api.post('/auth/verify-email', { token });
      return { success: true };
    } catch (error) {
      const message = (error as ApiError).response?.data?.message || 'Email verification failed';
      return { success: false, error: message };
    }
  }, []);

  // Resend verification email
  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      await api.post('/auth/resend-verification', { email });
      return { success: true };
    } catch (error) {
      const message =
        (error as ApiError).response?.data?.message || 'Failed to resend verification email';
      return { success: false, error: message };
    }
  }, []);

  // Refresh token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshing.current) {
      return null;
    }

    try {
      isRefreshing.current = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        return null;
      }

      const response = await api.post<AuthTokens>('/auth/refresh-token', { refreshToken });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      setToken(newToken);
      if (newRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      }

      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      clearAuth();
      return null;
    } finally {
      isRefreshing.current = false;
    }
  }, [clearAuth]);

  // Set up token refresh
  useEffect(() => {
    const checkTokenExpiry = async () => {
      if (!token) return;

      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = decoded.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD) {
          await refreshToken();
        }
      } catch (error) {
        console.error('Error checking token expiry:', error);
      }
    };

    // Check token expiry on mount and set up interval
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [token, refreshToken]);

  // Initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get<{ user: User }>('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token, clearAuth]);

  // Context value
  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    clearError: () => setError(null),
    verifyEmail,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={contextValue}>{!isLoading && children}</AuthContext.Provider>;
};
