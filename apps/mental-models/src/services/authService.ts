// Authentication service with JWT and OAuth2 support

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: number;
  updatedAt: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AUTH_STORAGE_KEY = 'hummbl_auth';
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

/**
 * Authentication Service
 */
export class AuthService {
  private baseUrl: string;
  private refreshTimer?: number;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await fetch(`${this.baseUrl}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }

    const result = await response.json();
    this.storeAuth(result.user, result.tokens);
    this.scheduleTokenRefresh(result.tokens.expiresIn);

    return result;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await fetch(`${this.baseUrl}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Invalid credentials');
    }

    const result = await response.json();
    this.storeAuth(result.user, result.tokens);
    this.scheduleTokenRefresh(result.tokens.expiresIn);

    return result;
  }

  /**
   * OAuth2 login (Google, GitHub, etc.)
   */
  async loginWithOAuth(
    provider: 'google' | 'github',
    code: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await fetch(`${this.baseUrl}/auth/oauth/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('OAuth login failed');
    }

    const result = await response.json();
    this.storeAuth(result.user, result.tokens);
    this.scheduleTokenRefresh(result.tokens.expiresIn);

    return result;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    const tokens = this.getStoredTokens();

    if (tokens) {
      try {
        await fetch(`${this.baseUrl}/user/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
      } catch (error) {
        console.warn('Logout request failed:', error);
      }
    }

    this.clearAuth();
    this.clearRefreshTimer();
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthTokens> {
    const tokens = this.getStoredTokens();

    if (!tokens) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (!response.ok) {
      this.clearAuth();
      throw new Error('Token refresh failed');
    }

    const newTokens = await response.json();
    const user = this.getStoredUser();

    if (user) {
      this.storeAuth(user, newTokens);
      this.scheduleTokenRefresh(newTokens.expiresIn);
    }

    return newTokens;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const tokens = this.getStoredTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseUrl}/user/profile`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        await this.refreshToken();
        return this.getCurrentUser();
      }
      throw new Error('Failed to fetch user profile');
    }

    const user = await response.json();
    this.storeUser(user);

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
    const tokens = this.getStoredTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseUrl}/user/profile`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const user = await response.json();
    this.storeUser(user);

    return user;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    const tokens = this.getStoredTokens();
    return tokens?.accessToken || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const tokens = this.getStoredTokens();
    return tokens !== null;
  }

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const auth = JSON.parse(stored);
        return auth.user || null;
      }
    } catch (error) {
      console.warn('Failed to load user:', error);
    }
    return null;
  }

  /**
   * Get stored tokens
   */
  private getStoredTokens(): AuthTokens | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const auth = JSON.parse(stored);
        return auth.tokens || null;
      }
    } catch (error) {
      console.warn('Failed to load tokens:', error);
    }
    return null;
  }

  /**
   * Store authentication data
   */
  private storeAuth(user: User, tokens: AuthTokens): void {
    try {
      const auth = { user, tokens };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } catch (error) {
      console.error('Failed to store auth:', error);
    }
  }

  /**
   * Store user only
   */
  private storeUser(user: User): void {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const auth = JSON.parse(stored);
        auth.user = user;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      }
    } catch (error) {
      console.error('Failed to store user:', error);
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(expiresIn: number): void {
    this.clearRefreshTimer();

    const refreshTime = expiresIn * 1000 - TOKEN_REFRESH_THRESHOLD;

    if (refreshTime > 0) {
      this.refreshTimer = window.setTimeout(() => {
        this.refreshToken().catch((error) => {
          console.error('Auto token refresh failed:', error);
          this.clearAuth();
        });
      }, refreshTime);
    }
  }

  /**
   * Clear refresh timer
   */
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.clearRefreshTimer();
  }
}

/**
 * Singleton instance
 */
let authServiceInstance: AuthService | null = null;

export function getAuthService(baseUrl?: string): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService(baseUrl);
  }
  return authServiceInstance;
}

export function resetAuthService(): void {
  if (authServiceInstance) {
    authServiceInstance.destroy();
    authServiceInstance = null;
  }
}
