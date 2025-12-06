#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

// ============================================================================
// TRANSFORMATION MAP - HUMMBL Base120 Core Reference
// ============================================================================
// Added per HUMMBL-TRANSFORM-001 fix: Prevent fabrication of transformation names
// Always validate transformation references against this authoritative source
// ============================================================================

const TRANSFORMATIONS = {
  P: {
    code: 'P',
    name: 'Perspective',
    description: 'Frame and name what is. Anchor or shift point of view.',
    modelCount: 20,
  },
  IN: {
    code: 'IN',
    name: 'Inversion',
    description: 'Reverse assumptions. Examine opposites, edges, negations.',
    modelCount: 20,
  },
  CO: {
    code: 'CO',
    name: 'Composition',
    description: 'Combine parts into coherent wholes.',
    modelCount: 20,
  },
  DE: {
    code: 'DE',
    name: 'Decomposition',
    description: 'Break systems into components.',
    modelCount: 20,
  },
  RE: {
    code: 'RE',
    name: 'Recursion',
    description: 'Apply operations iteratively, with outputs becoming inputs.',
    modelCount: 20,
  },
  SY: {
    code: 'SY',
    name: 'Meta-Systems',
    description: 'Understand systems of systems, coordination, and emergent dynamics.',
    modelCount: 20,
  },
} as const;

type TransformationCode = keyof typeof TRANSFORMATIONS;

// ============================================================================

type SearchArgs = {
  query: string;
  transformation?: string;
};

type DetailArgs = {
  id: string;
};

type TransformationArgs = {
  code: TransformationCode;
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
    {
      name: 'get_transformation',
      description:
        'Get authoritative definition for a HUMMBL transformation (P, IN, CO, DE, RE, SY). ' +
        'ALWAYS use this to validate transformation references before asserting meaning. ' +
        'Added per HUMMBL-TRANSFORM-001: Prevents fabrication of transformation names.',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            enum: ['P', 'IN', 'CO', 'DE', 'RE', 'SY'],
            description: 'Transformation code to look up.',
          },
        },
        required: ['code'],
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

  if (request.params.name === 'get_transformation') {
    const { code } = request.params.arguments as TransformationArgs;

    const transformation = TRANSFORMATIONS[code];

    if (!transformation) {
      return {
        content: [{ type: 'text', text: `Invalid transformation code: ${code}` }],
        isError: true,
      };
    }

    const report = `# TRANSFORMATION: ${transformation.name} (${transformation.code})

## Description
${transformation.description}

## Model Count
${transformation.modelCount} models in this transformation

## Validation Note
This definition is authoritative. Always validate transformation references against this source.
Reference: HUMMBL-TRANSFORM-001 validation protocol.

## Usage
Use search_models with transformation filter to find specific models within this transformation.
Example: search_models(query="feedback", transformation="${code}")
`;

    return { content: [{ type: 'text', text: report }] };
  }

  return { content: [{ type: 'text', text: 'Tool not found' }], isError: true };
});

const transport = new StdioServerTransport();
await server.connect(transport);
