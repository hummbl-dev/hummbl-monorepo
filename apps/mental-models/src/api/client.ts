// API client for HUMMBL Framework

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || '/api';
const ENABLE_CACHING = (import.meta.env?.VITE_ENABLE_CACHING as string) === 'true';
const CACHE_TTL = parseInt((import.meta.env?.VITE_CACHE_TTL as string) || '300000', 10);

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class APIClient {
  private cache: Map<string, CacheEntry<any>> = new Map();

  private async fetchWithCache<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;

    // Check cache
    if (ENABLE_CACHING) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }
    }

    // Fetch data
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Cache result
    if (ENABLE_CACHING) {
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.fetchWithCache<T>(endpoint, { method: 'GET' });
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

export const apiClient = new APIClient();
