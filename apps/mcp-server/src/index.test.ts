import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================================
// Types
// ============================================================================

interface Model {
  code: string;
  name: string;
  transformation_code: string;
  definition: string;
  transformation_name?: string;
  base_level?: number;
  system_prompt?: string;
  tags?: string[];
}

interface Relationship {
  source_code: string;
  target_code: string;
  relationship_type: string;
  confidence: number;
  evidence?: string;
}

interface ToolResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

interface CallToolRequest {
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

// ============================================================================
// Test Helpers
// ============================================================================

const createMockModel = (overrides: Partial<Model> = {}): Model => ({
  code: 'P1',
  name: 'Test Model',
  transformation_code: 'P',
  definition: 'A test definition for the model',
  transformation_name: 'Perspective',
  base_level: 1,
  system_prompt: 'You are a helpful assistant',
  tags: ['test', 'example'],
  ...overrides,
});

const createMockRelationship = (overrides: Partial<Relationship> = {}): Relationship => ({
  source_code: 'P1',
  target_code: 'P2',
  relationship_type: 'builds_on',
  confidence: 9,
  evidence: 'Clear progression from basic to advanced',
  ...overrides,
});

// ============================================================================
// Mock Setup - Capture handlers from the module
// ============================================================================

const capturedHandlers: {
  callTool?: (request: CallToolRequest) => Promise<ToolResponse>;
  listTools?: () => Promise<{ tools: unknown[] }>;
} = {};

// Mock the MCP SDK modules before any imports
vi.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: class MockServer {
    constructor() {}
    setRequestHandler(_schema: unknown, handler: unknown) {
      // Determine which handler based on capture state
      if (typeof handler === 'function') {
        if (!capturedHandlers.listTools) {
          capturedHandlers.listTools = handler as () => Promise<{ tools: unknown[] }>;
        } else if (!capturedHandlers.callTool) {
          capturedHandlers.callTool = handler as (
            request: CallToolRequest
          ) => Promise<ToolResponse>;
        }
      }
    }
    connect() {
      return Promise.resolve();
    }
  },
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: class MockTransport {},
}));

vi.mock('@modelcontextprotocol/sdk/types.js', () => ({
  CallToolRequestSchema: { name: 'CallToolRequestSchema' },
  ListToolsRequestSchema: { name: 'ListToolsRequestSchema' },
}));

// ============================================================================
// Tests
// ============================================================================

describe('MCP Server Tools', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;
  const WORKER_URL = 'http://localhost:8787';

  beforeEach(async () => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;

    // Reset captured handlers
    capturedHandlers.callTool = undefined;
    capturedHandlers.listTools = undefined;

    // Set environment
    process.env.WORKER_URL = WORKER_URL;

    // Dynamic import to re-execute the module and capture handlers
    vi.resetModules();
    await import('./index.js');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // ========================================================================
  // search_models
  // ========================================================================

  describe('search_models', () => {
    const callSearchModels = async (args: {
      query: string;
      transformation?: string;
    }): Promise<ToolResponse> => {
      if (!capturedHandlers.callTool) {
        throw new Error('Call tool handler not captured');
      }
      return capturedHandlers.callTool({
        params: { name: 'search_models', arguments: args },
      });
    };

    it('returns successful search results', async () => {
      const mockModels = [
        createMockModel({ code: 'P1', name: 'First Principles', transformation_code: 'P' }),
        createMockModel({ code: 'P2', name: 'Second Order Thinking', transformation_code: 'P' }),
      ];

      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, value: { models: mockModels } }),
      });

      const result = await callSearchModels({ query: 'thinking' });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('[P1] First Principles');
      expect(result.content[0].text).toContain('[P2] Second Order Thinking');
      expect(mockFetch).toHaveBeenCalledWith(`${WORKER_URL}/v1/models?search=thinking`);
    });

    it('applies transformation filter when provided', async () => {
      const mockModels = [
        createMockModel({ code: 'IN1', name: 'Inversion Thinking', transformation_code: 'IN' }),
      ];

      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, value: { models: mockModels } }),
      });

      const result = await callSearchModels({ query: 'reverse', transformation: 'IN' });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('[IN1] Inversion Thinking');
      expect(mockFetch).toHaveBeenCalledWith(
        `${WORKER_URL}/v1/models?search=reverse&transformation=IN`
      );
    });

    it('handles empty results gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, value: { models: [] } }),
      });

      const result = await callSearchModels({ query: 'nonexistent' });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toBe('No matching models found.');
    });

    it('handles API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

      const result = await callSearchModels({ query: 'test' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('API Error');
      expect(result.content[0].text).toContain('Network timeout');
    });

    it('handles malformed API response', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: false, error: 'Server error' }),
      });

      const result = await callSearchModels({ query: 'test' });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toBe('No matching models found.');
    });

    it('handles response with undefined value', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true }),
      });

      const result = await callSearchModels({ query: 'test' });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toBe('No matching models found.');
    });
  });

  // ========================================================================
  // get_model_details
  // ========================================================================

  describe('get_model_details', () => {
    const callGetModelDetails = async (args: { id: string }): Promise<ToolResponse> => {
      if (!capturedHandlers.callTool) {
        throw new Error('Call tool handler not captured');
      }
      return capturedHandlers.callTool({
        params: { name: 'get_model_details', arguments: args },
      });
    };

    it('returns full model details for valid ID', async () => {
      const mockModel = createMockModel({
        code: 'P1',
        name: 'First Principles Thinking',
        transformation_code: 'P',
        transformation_name: 'Perspective',
        base_level: 1,
        definition: 'Break down problems to fundamental truths',
        system_prompt: 'Think from first principles',
        tags: ['fundamental', 'physics', 'innovation'],
      });

      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, value: mockModel }),
      });

      const result = await callGetModelDetails({ id: 'P1' });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('MENTAL MODEL: First Principles Thinking');
      expect(result.content[0].text).toContain('(P1)');
      expect(result.content[0].text).toContain('Perspective');
      expect(result.content[0].text).toContain('Base Level: 1');
      expect(result.content[0].text).toContain('Break down problems to fundamental truths');
      expect(result.content[0].text).toContain('Think from first principles');
      expect(result.content[0].text).toContain('fundamental, physics, innovation');
    });

    it('handles model without optional fields', async () => {
      const mockModel = createMockModel({
        tags: undefined,
      });

      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, value: mockModel }),
      });

      const result = await callGetModelDetails({ id: 'P1' });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('TAGS');
      expect(result.content[0].text).toContain('n/a');
    });

    it('rejects invalid ID format with special characters', async () => {
      const result = await callGetModelDetails({ id: 'P1<script>' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Invalid model ID format');
    });

    it('rejects empty ID', async () => {
      const result = await callGetModelDetails({ id: '' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Invalid model ID format');
    });

    it('rejects ID that only contains special characters', async () => {
      const result = await callGetModelDetails({ id: '@#$%' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Invalid model ID format');
    });

    it('handles model not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: false, error: 'Model not found' }),
      });

      const result = await callGetModelDetails({ id: 'NONEXISTENT' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error fetching model');
      expect(result.content[0].text).toContain('Model not found');
    });

    it('handles API network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await callGetModelDetails({ id: 'P1' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error fetching model');
      expect(result.content[0].text).toContain('Connection refused');
    });

    it('sanitizes ID before making request', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, value: createMockModel() }),
      });

      await callGetModelDetails({ id: 'P1_valid-ID' });

      expect(mockFetch).toHaveBeenCalledWith(`${WORKER_URL}/v1/models/P1_valid-ID`);
    });

    it('handles complex valid IDs', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, value: createMockModel({ code: 'DE05' }) }),
      });

      const result = await callGetModelDetails({ id: 'DE05' });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('(DE05)');
    });
  });

  // ========================================================================
  // get_transformation
  // ========================================================================

  describe('get_transformation', () => {
    const callGetTransformation = async (args: { code: string }): Promise<ToolResponse> => {
      if (!capturedHandlers.callTool) {
        throw new Error('Call tool handler not captured');
      }
      return capturedHandlers.callTool({
        params: { name: 'get_transformation', arguments: args },
      });
    };

    it.each([
      ['P', 'Perspective', 'Frame and name what is'],
      ['IN', 'Inversion', 'Reverse assumptions'],
      ['CO', 'Composition', 'Combine parts into wholes'],
      ['DE', 'Decomposition', 'Break into components'],
      ['RE', 'Recursion', 'Apply iteratively'],
      ['SY', 'Meta-Systems', 'Systems of systems'],
    ])('returns definition for valid code %s', async (code, name, description) => {
      const result = await callGetTransformation({ code });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain(`TRANSFORMATION: ${name}`);
      expect(result.content[0].text).toContain(`(${code})`);
      expect(result.content[0].text).toContain(description);
      expect(result.content[0].text).toContain('20 models in this transformation');
      expect(result.content[0].text).toContain('HUMMBL-TRANSFORM-001');
    });

    it('includes usage example in response', async () => {
      const result = await callGetTransformation({ code: 'P' });

      expect(result.content[0].text).toContain('Use search_models with transformation filter');
      expect(result.content[0].text).toContain(
        'search_models(query="feedback", transformation="P")'
      );
    });

    it('rejects invalid transformation code', async () => {
      const result = await callGetTransformation({ code: 'INVALID' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Invalid transformation code: INVALID');
    });

    it('rejects empty transformation code', async () => {
      const result = await callGetTransformation({ code: '' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Invalid transformation code: ');
    });

    it('rejects lowercase transformation codes', async () => {
      const result = await callGetTransformation({ code: 'p' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Invalid transformation code: p');
    });

    it('rejects numeric transformation code', async () => {
      const result = await callGetTransformation({ code: '123' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Invalid transformation code: 123');
    });
  });

  // ========================================================================
  // get_related_models
  // ========================================================================

  describe('get_related_models', () => {
    const callGetRelatedModels = async (args: { code: string }): Promise<ToolResponse> => {
      if (!capturedHandlers.callTool) {
        throw new Error('Call tool handler not captured');
      }
      return capturedHandlers.callTool({
        params: { name: 'get_related_models', arguments: args },
      });
    };

    it('returns relationships successfully', async () => {
      const mockRelationships = [
        createMockRelationship({ source_code: 'P1', target_code: 'P2', confidence: 10 }),
        createMockRelationship({ source_code: 'P3', target_code: 'P1', confidence: 7 }),
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          value: {
            model: 'First Principles Thinking',
            relationships: mockRelationships,
            count: 2,
          },
        }),
      });

      const result = await callGetRelatedModels({ code: 'P1' });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('RELATIONSHIPS: First Principles Thinking');
      expect(result.content[0].text).toContain('Found 2 relationship(s)');
      expect(result.content[0].text).toContain('→ **P2**');
      expect(result.content[0].text).toContain('← **P3**');
      expect(result.content[0].text).toContain('confidence: High');
      expect(result.content[0].text).toContain('confidence: Medium');
    });

    it('handles model with no relationships', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          value: {
            model: 'Isolated Model',
            relationships: [],
            count: 0,
          },
        }),
      });

      const result = await callGetRelatedModels({ code: 'P99' });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toBe('Model P99 has no documented relationships yet.');
    });

    it('includes evidence when available', async () => {
      const mockRelationships = [
        createMockRelationship({ evidence: 'Strong theoretical connection' }),
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          value: {
            model: 'Test Model',
            relationships: mockRelationships,
            count: 1,
          },
        }),
      });

      const result = await callGetRelatedModels({ code: 'P1' });

      expect(result.content[0].text).toContain('Evidence: Strong theoretical connection');
    });

    it('handles relationships without evidence', async () => {
      const mockRelationships = [createMockRelationship({ evidence: undefined })];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          value: {
            model: 'Test Model',
            relationships: mockRelationships,
            count: 1,
          },
        }),
      });

      const result = await callGetRelatedModels({ code: 'P1' });

      expect(result.content[0].text).not.toContain('Evidence:');
    });

    it('categorizes confidence levels correctly', async () => {
      const mockRelationships = [
        createMockRelationship({ target_code: 'HIGH', confidence: 10 }),
        createMockRelationship({ target_code: 'MED1', confidence: 7 }),
        createMockRelationship({ target_code: 'MED2', confidence: 8 }),
        createMockRelationship({ target_code: 'LOW', confidence: 5 }),
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          value: {
            model: 'Test Model',
            relationships: mockRelationships,
            count: 4,
          },
        }),
      });

      const result = await callGetRelatedModels({ code: 'P1' });

      expect(result.content[0].text).toContain('confidence: High');
      expect(result.content[0].text).toContain('confidence: Medium');
      expect(result.content[0].text).toContain('confidence: Low');
    });

    it('rejects invalid code format with special characters', async () => {
      const result = await callGetRelatedModels({ code: 'P1<script>' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Invalid model code format');
    });

    it('rejects empty code', async () => {
      const result = await callGetRelatedModels({ code: '' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Invalid model code format');
    });

    it('normalizes code to uppercase', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          value: {
            model: 'Test Model',
            relationships: [],
            count: 0,
          },
        }),
      });

      const result = await callGetRelatedModels({ code: 'p1' });

      expect(result.isError).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(`${WORKER_URL}/v1/models/P1/relationships`);
    });

    it('handles HTTP error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await callGetRelatedModels({ code: 'P1' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error fetching relationships');
      expect(result.content[0].text).toContain('API returned 404: Not Found');
    });

    it('handles API not ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: false,
          error: 'Model not found',
        }),
      });

      const result = await callGetRelatedModels({ code: 'NONEXISTENT' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error fetching relationships');
      expect(result.content[0].text).toContain(
        'Model NONEXISTENT not found or has no relationships'
      );
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const result = await callGetRelatedModels({ code: 'P1' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error fetching relationships');
      expect(result.content[0].text).toContain('Network failure');
    });

    it('sanitizes code before making request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          value: {
            model: 'Test',
            relationships: [],
            count: 0,
          },
        }),
      });

      await callGetRelatedModels({ code: 'P1_valid' });

      expect(mockFetch).toHaveBeenCalledWith(`${WORKER_URL}/v1/models/P1_VALID/relationships`);
    });
  });

  // ========================================================================
  // Unknown tool
  // ========================================================================

  describe('unknown tool', () => {
    it('returns error for unknown tool name', async () => {
      if (!capturedHandlers.callTool) {
        throw new Error('Call tool handler not captured');
      }

      const result = await capturedHandlers.callTool({
        params: { name: 'unknown_tool', arguments: {} },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Tool not found');
    });
  });

  // ========================================================================
  // List Tools
  // ========================================================================

  describe('list_tools', () => {
    it('returns all 4 tools', async () => {
      if (!capturedHandlers.listTools) {
        throw new Error('List tools handler not captured');
      }

      const result = await capturedHandlers.listTools();

      expect(result.tools).toHaveLength(4);
      expect(result.tools.map((t: unknown) => (t as { name: string }).name)).toEqual([
        'search_models',
        'get_model_details',
        'get_transformation',
        'get_related_models',
      ]);
    });
  });
});

// ============================================================================
// SSRF Protection Tests
// ============================================================================

describe('SSRF Protection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.WORKER_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('accepts localhost URL', async () => {
    process.env.WORKER_URL = 'http://localhost:8787';

    await expect(import('./index.js')).resolves.toBeDefined();
  });

  it('accepts 127.0.0.1 URL', async () => {
    process.env.WORKER_URL = 'http://127.0.0.1:8787';

    await expect(import('./index.js')).resolves.toBeDefined();
  });

  it('accepts allowed production URL', async () => {
    process.env.WORKER_URL = 'https://hummbl-workers.hummbl.workers.dev';

    await expect(import('./index.js')).resolves.toBeDefined();
  });

  it('throws error for file:// protocol', async () => {
    process.env.WORKER_URL = 'file:///etc/passwd';

    await expect(import('./index.js')).rejects.toThrow('Invalid WORKER_URL');
  });

  it('throws error for malicious host', async () => {
    process.env.WORKER_URL = 'http://evil.com/api';

    await expect(import('./index.js')).rejects.toThrow('Invalid WORKER_URL');
  });

  it('throws error for invalid URL format', async () => {
    process.env.WORKER_URL = 'not-a-valid-url';

    await expect(import('./index.js')).rejects.toThrow('Invalid WORKER_URL');
  });

  it('defaults to localhost when WORKER_URL is not set', async () => {
    delete process.env.WORKER_URL;

    await expect(import('./index.js')).resolves.toBeDefined();
  });
});
