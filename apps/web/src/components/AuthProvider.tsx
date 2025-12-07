import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'google' | 'github' | 'email';
}

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE = 'https://hummbl-workers.hummbl.workers.dev';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem('hummbl_token');
    if (savedToken) {
      verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/v1/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(token);
      } else {
        localStorage.removeItem('hummbl_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('hummbl_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    provider: 'google' | 'github' | 'email',
    credentials?: { email: string; password: string }
  ) => {
    try {
      let response;

      if (provider === 'google') {
        // In a real app, you'd use Google's OAuth flow
        // For now, we'll simulate with a token
        const token = prompt('Enter Google access token (for testing):');
        if (!token) return;

        response = await fetch(`${API_BASE}/v1/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } else if (provider === 'github') {
        // In a real app, you'd use GitHub's OAuth flow
        const code = prompt('Enter GitHub authorization code (for testing):');
        if (!code) return;

        response = await fetch(`${API_BASE}/v1/auth/github`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
      } else if (provider === 'email' && credentials) {
        response = await fetch(`${API_BASE}/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
      } else {
        throw new Error('Invalid credentials for email login');
      }

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('hummbl_token', data.token);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('hummbl_token', data.token);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hummbl_token');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
