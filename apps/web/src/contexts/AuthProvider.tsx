import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType, type User } from './AuthContext';
import { api } from '../lib';

export interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
}

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (storedToken) {
          // Set the token in the API client
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

          // Verify token and fetch user data
          const response = await api.get('/auth/me');

          if (response.data) {
            setUser(response.data.user);
            setToken(storedToken);
          } else {
            // Invalid token, clear storage
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Clear auth state and storage
  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
  };

  // Handle successful authentication
  const handleAuthSuccess = (data: { user: User; token: string; refresh_token?: string }) => {
    setUser(data.user);
    setToken(data.token);
    setError(null);

    // Store tokens
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    if (data.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    }

    // Set default auth header
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

    return { user: data.user, token: data.token };
  };

  // Handle authentication errors
  const handleAuthError = (error: unknown, defaultMessage: string) => {
    console.error('Auth error:', error);

    // Handle Axios errors
    const axiosError = error as {
      response?: {
        data?: {
          error?: string;
          message?: string;
          details?: string;
          code?: string;
        };
        status?: number;
      };
      message?: string;
    };

    // Try to get the most specific error message
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      (error as Error)?.message ||
      defaultMessage;

    // Additional details if available
    const errorDetails = axiosError.response?.data?.details || '';
    const errorCode = axiosError.response?.data?.code || '';

    // Set the error message with details if available
    const fullErrorMessage = [
      errorMessage,
      errorCode && `(Code: ${errorCode})`,
      errorDetails && `\n\n${errorDetails}`,
    ]
      .filter(Boolean)
      .join(' ');

    setError(fullErrorMessage);
    return { user: null, token: null };
  };

  const login = useCallback(
    async (
      provider: 'google' | 'github' | 'email',
      credentials?: { email: string; password: string }
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        // Handle social login redirects
        if ((provider === 'google' || provider === 'github') && !credentials) {
          window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/${provider}`;
          return { user: null, token: null };
        }

        // Handle email/password login
        if (provider === 'email' && credentials) {
          const response = await api.post('/auth/login', {
            email: credentials.email,
            password: credentials.password,
          });

          const { access_token, refresh_token, user } = response.data;
          localStorage.setItem('auth_token', access_token);
          if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token);
          }
          setToken(access_token);
          setUser(user);
          return { user, token: access_token };
        } else {
          // Redirect to OAuth provider
          window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider}`;
          return { user: null, token: null };
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Attempting to register with:', { email, name });
      const response = await api
        .post('/auth/register', {
          email,
          password,
          name,
        })
        .catch(
          (error: {
            response?: {
              status?: number;
              data?: {
                error?: string;
                message?: string;
                details?: string;
                code?: string;
              };
            };
            message: string;
          }) => {
            console.error('Registration API error:', {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            });
            throw error;
          }
        );

      console.log('Registration successful:', response.data);
      if (response.data) {
        return handleAuthSuccess(response.data);
      }

      return { user: null, token: null };
    } catch (error) {
      return handleAuthError(
        error,
        'Failed to log in. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(
    async (token: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.post('/auth/verify-email', { token });

        if (response.data) {
          // If user is logged in, update their verified status
          if (user) {
            setUser({ ...user, email_verified: true });
          }
          return true;
        }

        return false;
      } catch (error) {
        handleAuthError(error, 'Failed to verify email. The link may have expired or is invalid.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Handle social login callback
  const handleSocialCallback = useCallback(async (provider: 'google' | 'github', code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/auth/${provider}/callback?code=${code}`);

      if (response.data) {
        return handleAuthSuccess(response.data);
      }

      return { user: null, token: null };
    } catch (error) {
      return handleAuthError(error, `Failed to authenticate with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for social login callback on mount
  useEffect(() => {
    const checkSocialLogin = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const provider = window.location.pathname.includes('google')
        ? 'google'
        : window.location.pathname.includes('github')
          ? 'github'
          : null;

      if (code && provider) {
        handleSocialCallback(provider, code).then(() => {
          // Clean up URL after successful login
          window.history.replaceState({}, document.title, '/dashboard');
          navigate('/dashboard');
        });
      }
    };

    checkSocialLogin();
  }, [handleSocialCallback, navigate]);

  const logout = useCallback(async () => {
    try {
      // Call the logout endpoint if we have a token
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear auth state
      clearAuth();
      // Redirect to login
      navigate('/login');
    }
  }, [token, navigate]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data) {
        setUser(response.data.user);
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If we get a 401, the token is invalid, so clear auth
      if ((error as ApiError)?.response?.status === 401) {
        clearAuth();
      }
      return null;
    }
  }, []);

  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    verifyEmail,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
