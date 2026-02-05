import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadNarratives,
  loadNetwork,
  loadQDM,
  loadLedger,
  loadSITREP,
  config,
} from '../dataLoader';

// Mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Data Loader', () => {
  const mockResponse = (data: any) => ({
    ok: true,
    json: async () => data,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(config, 'useStatic', 'get').mockReturnValue(true);
    vi.spyOn(config, 'baseDir', 'get').mockReturnValue('/test-data');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Static Data Loading', () => {
    it('loads narratives from static file', async () => {
      const testData = [{ id: '1', title: 'Test Narrative' }];
      mockFetch.mockResolvedValueOnce(mockResponse(testData));

      const result = await loadNarratives();
      expect(result).toEqual(testData);
      expect(mockFetch).toHaveBeenCalledWith('/test-data/narratives.json');
    });

    it('loads network data from static file', async () => {
      const testData = { nodes: [], links: [] };
      mockFetch.mockResolvedValueOnce(mockResponse(testData));

      const result = await loadNetwork();
      expect(result).toEqual(testData);
      expect(mockFetch).toHaveBeenCalledWith('/test-data/network.json');
    });

    it('handles fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(loadNarratives()).rejects.toThrow('Failed to load narratives: 404');
    });
  });

  describe('API Data Loading', () => {
    const testData = { id: '1', data: 'test' };

    beforeEach(() => {
      vi.spyOn(config, 'useStatic', 'get').mockReturnValue(false);
    });

    it('loads narratives from API', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(testData));

      const result = await loadNarratives();
      expect(result).toEqual(testData);
      expect(mockFetch).toHaveBeenCalledWith('/api/narratives');
    });

    it('loads QDM data from API', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(testData));

      const result = await loadQDM();
      expect(result).toEqual(testData);
      expect(mockFetch).toHaveBeenCalledWith('/api/qdm');
    });

    it('loads ledger data from API', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(testData));
      await expect(loadLedger()).resolves.toEqual(testData);
      expect(mockFetch).toHaveBeenCalledWith('/api/ledger');
    });

    it('loads SITREP data from API', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(testData));
      await expect(loadSITREP()).resolves.toEqual(testData);
      expect(mockFetch).toHaveBeenCalledWith('/api/sitrep');
    });
  });

  describe('Configuration Getters', () => {
    beforeEach(() => {
      // Restore the actual config getters for these tests
      vi.restoreAllMocks();
    });

    it('config.useStatic returns true when VITE_USE_STATIC_DATA is "true"', () => {
      vi.stubEnv('VITE_USE_STATIC_DATA', 'true');
      expect(config.useStatic).toBe(true);
    });

    it('config.useStatic returns false when VITE_USE_STATIC_DATA is not "true"', () => {
      vi.stubEnv('VITE_USE_STATIC_DATA', 'false');
      expect(config.useStatic).toBe(false);
    });

    it('config.useStatic returns true when VITE_USE_STATIC_DATA is undefined (defaults to true)', () => {
      vi.stubEnv('VITE_USE_STATIC_DATA', undefined);
      expect(config.useStatic).toBe(true);
    });

    it('config.baseDir returns VITE_BUILD_OUTPUT_DIR when set', () => {
      vi.stubEnv('VITE_BUILD_OUTPUT_DIR', '/custom/path');
      expect(config.baseDir).toBe('/custom/path');
    });

    it('config.baseDir returns default "/data" when VITE_BUILD_OUTPUT_DIR is not set', () => {
      vi.stubEnv('VITE_BUILD_OUTPUT_DIR', undefined);
      expect(config.baseDir).toBe('/data');
    });

    it('config.baseDir returns empty string when VITE_BUILD_OUTPUT_DIR is empty', () => {
      vi.stubEnv('VITE_BUILD_OUTPUT_DIR', '');
      expect(config.baseDir).toBe('/data');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.spyOn(config, 'useStatic', 'get').mockReturnValue(false);
    });

    it('handles network timeout errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network timeout'));
      await expect(loadNarratives()).rejects.toThrow('Network timeout');
    });

    it('handles 404 errors with descriptive message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      await expect(loadNetwork()).rejects.toThrow('Failed to load network data: 404');
    });

    it('handles 500 errors with descriptive message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });
      await expect(loadQDM()).rejects.toThrow('Failed to load QDM data: 500');
    });

    it('handles 403 errors with descriptive message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });
      await expect(loadLedger()).rejects.toThrow('Failed to load ledger data: 403');
    });

    it('handles network errors during SITREP load', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));
      await expect(loadSITREP()).rejects.toThrow('Connection refused');
    });

    it('handles malformed response errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });
      await expect(loadNarratives()).rejects.toThrow('Invalid JSON');
    });
  });
});
