// API client with request/response interceptors

import { getAuthService } from './authService';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface RequestConfig extends RequestInit {
  url: string;
  retries?: number;
  skipAuth?: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = <T>(
  response: ApiResponse<T>
) => ApiResponse<T> | Promise<ApiResponse<T>>;
type ErrorInterceptor = (error: Error) => Error | Promise<Error>;

/**
 * API Client with interceptors
 */
export class ApiClient {
  private config: Required<ApiClientConfig>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
    };

    // Add default interceptors
    this.addDefaultInterceptors();
  }

  /**
   * Add default interceptors
   */
  private addDefaultInterceptors(): void {
    // Request: Add auth token
    this.addRequestInterceptor((config) => {
      if (!config.skipAuth) {
        const authService = getAuthService();
        const token = authService.getAccessToken();

        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      }

      // Add content-type if not present
      if (
        !config.headers ||
        !Object.keys(config.headers).some((k) => k.toLowerCase() === 'content-type')
      ) {
        config.headers = {
          ...config.headers,
          'Content-Type': 'application/json',
        };
      }

      return config;
    });

    // Response: Handle 401 and retry with refresh
    this.addErrorInterceptor(async (error) => {
      if (error.message.includes('401')) {
        try {
          const authService = getAuthService();
          await authService.refreshToken();
          // Token refreshed, original request will be retried
        } catch (refreshError) {
          // Refresh failed, user needs to re-login
          console.error('Token refresh failed:', refreshError);
        }
      }
      return error;
    });
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let modifiedConfig = config;

    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }

    return modifiedConfig;
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let modifiedResponse = response;

    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }

    return modifiedResponse;
  }

  /**
   * Apply error interceptors
   */
  private async applyErrorInterceptors(error: Error): Promise<Error> {
    let modifiedError = error;

    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError);
    }

    return modifiedError;
  }

  /**
   * Make HTTP request
   */
  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const maxRetries = config.retries ?? this.config.retries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Apply request interceptors
        const modifiedConfig = await this.applyRequestInterceptors(config);

        // Build URL
        const url = modifiedConfig.url.startsWith('http')
          ? modifiedConfig.url
          : `${this.config.baseURL}${modifiedConfig.url}`;

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        // Make request
        const response = await fetch(url, {
          ...modifiedConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse response
        const data = await this.parseResponse<T>(response);

        const apiResponse: ApiResponse<T> = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };

        // Apply response interceptors
        return await this.applyResponseInterceptors(apiResponse);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Request failed');

        // Apply error interceptors
        lastError = await this.applyErrorInterceptors(lastError);

        // Retry logic
        if (attempt < maxRetries && this.shouldRetry(lastError)) {
          await this.delay(this.config.retryDelay * (attempt + 1));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new Error('Request failed');
  }

  /**
   * Parse response body
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: Error): boolean {
    // Retry on network errors or 5xx errors
    return (
      error.message.includes('Failed to fetch') ||
      error.message.includes('500') ||
      error.message.includes('502') ||
      error.message.includes('503') ||
      error.message.includes('504')
    );
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Convenience methods
   */

  async get<T>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }
}

/**
 * Create default API client
 */
export function createApiClient(config?: Partial<ApiClientConfig>): ApiClient {
  return new ApiClient({
    baseURL: config?.baseURL || '/api',
    timeout: config?.timeout,
    retries: config?.retries,
    retryDelay: config?.retryDelay,
  });
}

/**
 * Default singleton instance
 */
let defaultClient: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!defaultClient) {
    defaultClient = createApiClient();
  }
  return defaultClient;
}

export function resetApiClient(): void {
  defaultClient = null;
}
