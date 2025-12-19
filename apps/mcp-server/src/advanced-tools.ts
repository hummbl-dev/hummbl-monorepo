#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

// Usage analytics
const usageStats = {
  requests: [] as Array<{ tool: string; timestamp: number; args: Record<string, unknown> }>,
  modelAccess: new Map<string, number>(),
  cacheHits: 0,
  cacheMisses: 0,
};

// Simple cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function logUsage(tool: string, args: Record<string, unknown>) {
  usageStats.requests.push({ tool, timestamp: Date.now(), args });

  if (args.id && typeof args.id === 'string') {
    usageStats.modelAccess.set(args.id, (usageStats.modelAccess.get(args.id) || 0) + 1);
  }
  if (args.ids && Array.isArray(args.ids)) {
    args.ids.forEach((id: string) => {
      usageStats.modelAccess.set(id, (usageStats.modelAccess.get(id) || 0) + 1);
    });
  }
}

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    usageStats.cacheHits++;
    return cached.data as T;
  }
  cache.delete(key);
  usageStats.cacheMisses++;
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function getUsageAnalytics(timeframe: string) {
  const now = Date.now();
  const timeframes = {
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
  };

  const cutoff = now - (timeframes[timeframe as keyof typeof timeframes] || timeframes.day);
  const recentRequests = usageStats.requests.filter(r => r.timestamp > cutoff);

  const toolCounts = new Map<string, number>();
  recentRequests.forEach(r => {
    toolCounts.set(r.tool, (toolCounts.get(r.tool) || 0) + 1);
  });

  const topModels = Array.from(usageStats.modelAccess.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  const topTools = Array.from(toolCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tool]) => tool);

  const totalCacheRequests = usageStats.cacheHits + usageStats.cacheMisses;
  const cacheHitRate = totalCacheRequests > 0 ? usageStats.cacheHits / totalCacheRequests : 0;

  return {
    totalRequests: recentRequests.length,
    topModels,
    topTools,
    cacheHitRate,
  };
}

const WORKER_URL = process.env.WORKER_URL ?? 'http://localhost:8787';

const server = new Server(
  { name: 'hummbl-advanced', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'batch_get_models',
      description: 'Get details for multiple models in a single request',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of model IDs to retrieve (max 10)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'compare_models',
      description: 'Compare 2-5 mental models side by side',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of model IDs to compare (2-5 models)',
          },
        },
        required: ['ids'],
      },
    },
    {
      name: 'get_usage_analytics',
      description: 'Get usage statistics and analytics',
      inputSchema: {
        type: 'object',
        properties: {
          timeframe: {
            type: 'string',
            enum: ['hour', 'day', 'week', 'month'],
            description: 'Time period for analytics',
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  if (request.params.name === 'batch_get_models') {
    const { ids } = request.params.arguments as { ids: string[] };

    if (ids.length > 10) {
      return {
        content: [
          {
            type: 'text',
            text: 'Batch size limited to 10 models. Please reduce the number of IDs.',
          },
        ],
      };
    }

    const cacheKey = `batch:${ids.sort().join(',')}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      logUsage('batch_get_models', { requestedCount: ids.length, cached: true });
      return { content: [{ type: 'text', text: cached }] };
    }

    try {
      const promises = ids.map(async id => {
        const response = await fetch(`${WORKER_URL}/v1/models/${id}`);
        if (response.ok) {
          const data = (await response.json()) as { value: unknown };
          return data.value;
        }
        return null;
      });

      const models = await Promise.all(promises);
      const validModels = models.filter(Boolean);

      const result = `# Batch Results (${validModels.length}/${ids.length} found)\n\n${validModels
        .map((model: unknown) => {
          const m = model as Record<string, unknown>;
          return `## ${m.code}: ${m.name}\n${m.definition}\n*Priority: ${m.base_level}*`;
        })
        .join('\n\n')}`;

      setCachedData(cacheKey, result);
      logUsage('batch_get_models', { requestedCount: ids.length, foundCount: validModels.length });

      return { content: [{ type: 'text', text: result }] };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Batch request failed: ${String(error)}` }],
        isError: true,
      };
    }
  }

  if (request.params.name === 'compare_models') {
    const { ids } = request.params.arguments as { ids: string[] };

    if (ids.length < 2 || ids.length > 5) {
      return {
        content: [
          {
            type: 'text',
            text: 'Comparison requires 2-5 model IDs.',
          },
        ],
      };
    }

    const cacheKey = `compare:${ids.sort().join(',')}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      logUsage('compare_models', { modelCount: ids.length, cached: true });
      return { content: [{ type: 'text', text: cached }] };
    }

    try {
      const promises = ids.map(async id => {
        const response = await fetch(`${WORKER_URL}/v1/models/${id}`);
        if (response.ok) {
          const data = (await response.json()) as { value: unknown };
          return data.value;
        }
        return null;
      });

      const models = await Promise.all(promises);
      const validModels = models.filter(Boolean);

      if (validModels.length < 2) {
        return {
          content: [
            {
              type: 'text',
              text: 'Need at least 2 valid models for comparison.',
            },
          ],
        };
      }

      const comparison = `# Model Comparison\n\n| Aspect | ${validModels.map((m: unknown) => (m as Record<string, unknown>).code).join(' | ')} |\n|--------|${validModels.map(() => '---').join('|')}|\n| **Name** | ${validModels.map((m: unknown) => (m as Record<string, unknown>).name).join(' | ')} |\n| **Transformation** | ${validModels.map((m: unknown) => (m as Record<string, unknown>).transformation_code).join(' | ')} |\n| **Level** | ${validModels.map((m: unknown) => (m as Record<string, unknown>).base_level).join(' | ')} |\n\n## Definitions\n\n${validModels.map((m: unknown) => `**${(m as Record<string, unknown>).code}:** ${(m as Record<string, unknown>).definition}`).join('\n\n')}`;

      setCachedData(cacheKey, comparison);
      logUsage('compare_models', { modelCount: validModels.length });

      return { content: [{ type: 'text', text: comparison }] };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Comparison failed: ${String(error)}` }],
        isError: true,
      };
    }
  }

  if (request.params.name === 'get_usage_analytics') {
    const { timeframe = 'day' } = request.params.arguments as { timeframe?: string };
    const analytics = getUsageAnalytics(timeframe);

    const result = `# Usage Analytics (${timeframe})\n\n**Total Requests:** ${analytics.totalRequests}\n**Most Popular Models:** ${analytics.topModels.join(', ') || 'None'}\n**Most Used Tools:** ${analytics.topTools.join(', ') || 'None'}\n**Cache Hit Rate:** ${(analytics.cacheHitRate * 100).toFixed(1)}%`;

    return {
      content: [{ type: 'text', text: result }],
    };
  }

  return { content: [{ type: 'text', text: 'Tool not found' }], isError: true };
});

const transport = new StdioServerTransport();
await server.connect(transport);
