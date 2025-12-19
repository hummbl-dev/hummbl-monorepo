#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { TransformationBuilder, TRANSFORMATION_TEMPLATES } from '@hummbl/core';

const server = new Server(
  { name: 'hummbl-transformation-builder', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'create_transformation',
      description: 'Create a custom transformation with models',
      inputSchema: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Transformation code (max 3 chars)' },
          name: { type: 'string', description: 'Transformation name' },
          description: { type: 'string', description: 'Transformation description' },
          author: { type: 'string', description: 'Author name (optional)' },
          models: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                name: { type: 'string' },
                definition: { type: 'string' },
                whenToUse: { type: 'string' },
                priority: { type: 'number' },
              },
              required: ['code', 'name', 'definition', 'whenToUse', 'priority'],
            },
          },
        },
        required: ['code', 'name', 'description', 'models'],
      },
    },
    {
      name: 'get_transformation_templates',
      description: 'Get available transformation templates for inspiration',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  if (request.params.name === 'create_transformation') {
    const { code, name, description, author, models } = request.params.arguments as {
      code: string;
      name: string;
      description: string;
      author?: string;
      models: Array<{
        code: string;
        name: string;
        definition: string;
        whenToUse: string;
        priority: number;
      }>;
    };

    try {
      const builder = TransformationBuilder.create()
        .withCode(code)
        .withName(name)
        .withDescription(description);

      if (author) builder.withAuthor(author);

      models.forEach(model => {
        try {
          builder.addModel(model);
        } catch (error) {
          throw new Error(`Invalid model ${model.code}: ${String(error)}`);
        }
      });

      const result = builder.build();

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: `Validation Error: ${result.error}` }],
          isError: true,
        };
      }

      const buildResult = builder.build();

      if (!buildResult.ok) {
        return {
          content: [{ type: 'text', text: `Validation Error: ${buildResult.error}` }],
          isError: true,
        };
      }

      const transformation = buildResult.value;
      const output = `# Custom Transformation Created: ${transformation.name} (${transformation.code})

## Description
${transformation.description}

## Models (${transformation.models.length})
${transformation.models
  .map(
    m =>
      `### ${m.code}: ${m.name}
**Definition**: ${m.definition}
**When to Use**: ${m.whenToUse}
**Priority**: ${m.priority}`
  )
  .join('\n\n')}

## Metadata
- **Created**: ${transformation.created.toISOString()}
${transformation.author ? `- **Author**: ${transformation.author}` : ''}

✅ Transformation successfully created and validated!`;

      return { content: [{ type: 'text', text: output }] };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Build Error: ${String(error)}` }],
        isError: true,
      };
    }
  }

  if (request.params.name === 'get_transformation_templates') {
    const templates = TRANSFORMATION_TEMPLATES.map(
      (t: any) => `## ${t.name}
**Description**: ${t.description}
**Suggested Models**: ${t.modelCount}
**Examples**: ${t.examples.join(', ')}`
    ).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `# Transformation Templates\n\n${templates}\n\n💡 Use these as inspiration for creating custom transformations!`,
        },
      ],
    };
  }

  return { content: [{ type: 'text', text: 'Tool not found' }], isError: true };
});

try {
  const transport = new StdioServerTransport();
  await server.connect(transport);
} catch (error) {
  console.error(`Failed to start transformation builder server: ${String(error)}`);
  process.exit(1);
}
