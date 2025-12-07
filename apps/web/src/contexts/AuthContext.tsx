import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'google' | 'github' | 'email';
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refresh_token?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (
    provider: 'google' | 'github' | 'email',
    credentials?: { email: string; password: string }
  ) => Promise<LoginResponse | { user: null; token: null }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<LoginResponse | { user: null; token: null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  verifyEmail: (token: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
