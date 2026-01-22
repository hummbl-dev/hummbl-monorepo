// Tests for apiClient

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiClient, createApiClient } from '../apiClient';

// Mock fetch
global.fetch = vi.fn();

// Mock response helpers
const createMockResponse = (status: number, data: any, headers: Record<string, string> = {}) => {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers
  });

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    headers: responseHeaders,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
};

describe('ApiClient', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = createApiClient({ baseURL: 'https://api.test.com' });
    vi.clearAllMocks();
  });

  describe('GET requests', () => {
    it('makes successful GET request', async () => {
      const mockData = { data: 'test' };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        createMockResponse(200, mockData)
      );

      const response = await apiClient.get<typeof mockData>('/test');

      expect(response.data).toEqual(mockData);
      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('POST requests', () => {
    it('makes successful POST request', async () => {
      const requestData = { name: 'Test' };
      const responseData = { id: '1' };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        createMockResponse(201, responseData)
      );

      const response = await apiClient.post<typeof responseData>('/test', requestData);

      expect(response.data).toEqual(responseData);
      expect(response.status).toBe(201);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('Error handling', () => {
    it('throws error on non-OK response', async () => {
      const errorMessage = 'Bad request';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ message: errorMessage }),
        text: async () => JSON.stringify({ message: errorMessage }),
      });

      await expect(apiClient.get('/test')).rejects.toThrow(errorMessage);
    });

    it('retries on network error', async () => {
      const responseData = { data: 'success' };
      
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockResolvedValueOnce(createMockResponse(200, responseData));

      const response = await apiClient.get('/test');

      expect(response.data).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Interceptors', () => {
    it('applies request interceptors', async () => {
      const interceptor = vi.fn((config) => ({
        ...config,
        headers: { ...config.headers, 'X-Test': 'test' },
      }));

      apiClient.addRequestInterceptor(interceptor);

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        createMockResponse(200, {})
      );

      await apiClient.get('/test');

      expect(interceptor).toHaveBeenCalled();
    });
  });
});
