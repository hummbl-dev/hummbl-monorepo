#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

type SearchArgs = {
  query: string;
  transformation?: string;
};

type DetailArgs = {
  id: string;
};

const WORKER_URL = process.env.WORKER_URL ?? 'http://localhost:8787';

const server = new Server(
  { name: 'hummbl-base120', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_models',
      description:
        'Search the HUMMBL Base120 framework for mental models. Use when the user requests strategic frameworks or prompts.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Keywords, e.g., "complexity", "inversion", "feedback".',
          },
          transformation: {
            type: 'string',
            enum: ['P', 'IN', 'CO', 'DE', 'RE', 'SY'],
            description: 'Filter by transformation code.',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_model_details',
      description: 'Fetch full definition + system prompt for a mental model ID (e.g., P1, IN12).',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Model ID such as P1 or DE05.' },
        },
        required: ['id'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  if (request.params.name === 'search_models') {
    const { query, transformation } = request.params.arguments as SearchArgs;
    const searchParams = new URLSearchParams({ search: query });
    if (transformation) {
      searchParams.append('transformation', transformation);
    }

    try {
      const response = await fetch(`${WORKER_URL}/v1/models?${searchParams.toString()}`);
      const payload = await response.json();
      const items = payload?.value?.models ?? [];
      const summary = items
        .map(
          (model: any) =>
            `[${model.code}] ${model.name} (${model.transformation_code}): ${model.definition}`
        )
        .join('\n\n');

      return {
        content: [{ type: 'text', text: summary || 'No matching models found.' }],
      };
    } catch (error) {
      return { content: [{ type: 'text', text: `API Error: ${String(error)}` }], isError: true };
    }
  }

  if (request.params.name === 'get_model_details') {
    const { id } = request.params.arguments as DetailArgs;
    try {
      const response = await fetch(`${WORKER_URL}/v1/models/${id}`);
      const payload = await response.json();

      if (!payload?.ok) {
        throw new Error('Model not found');
      }

      const model = payload.value;
      const report = `# MENTAL MODEL: ${model.name} (${model.code})\nType: ${model.transformation_name}\nBase Level: ${model.base_level}\n\n## DEFINITION\n${model.definition}\n\n## SYSTEM INSTRUCTION\n${model.system_prompt}\n\n## TAGS\n${model.tags?.join(', ') ?? 'n/a'}\n`;

      return { content: [{ type: 'text', text: report }] };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error fetching model ${id}: ${String(error)}` }],
        isError: true,
      };
    }
  }

  return { content: [{ type: 'text', text: 'Tool not found' }], isError: true };
});

const transport = new StdioServerTransport();
await server.connect(transport);
