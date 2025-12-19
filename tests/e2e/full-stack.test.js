import { test, expect } from 'vitest';
import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const WORKER_URL = 'https://hummbl-workers.hummbl.workers.dev';

test('E2E: Full Stack Integration', async () => {
  // Test 1: MCP Server → Workers API → Response
  const response = await fetch(`${WORKER_URL}/v1/models?search=feedback`);
  expect(response.ok).toBe(true);
  
  const data = await response.json();
  expect(data.models).toBeDefined();
  expect(data.models.length).toBeGreaterThan(0);
  
  // Test 2: Model Details Retrieval
  const detailResponse = await fetch(`${WORKER_URL}/v1/models/RE2`);
  expect(detailResponse.ok).toBe(true);
  
  const model = await detailResponse.json();
  expect(model.code).toBe('RE2');
  expect(model.name).toBe('Feedback Loops');
  
  // Test 3: Transformation Validation
  const transformResponse = await fetch(`${WORKER_URL}/v1/transformations/RE`);
  expect(transformResponse.ok).toBe(true);
  
  const transform = await transformResponse.json();
  expect(transform.code).toBe('RE');
  expect(transform.name).toBe('Recursion');
}, 30000);

test('E2E: MCP Server Direct Integration', async () => {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['./apps/mcp-server/dist/index.js'],
    env: { WORKER_URL }
  });

  const client = new Client({ name: 'e2e-test', version: '1.0.0' }, { capabilities: {} });
  
  await client.connect(transport);
  
  // Test search functionality
  const searchResult = await client.callTool({
    name: 'search_models',
    arguments: { query: 'systems' }
  });
  
  expect(searchResult.content[0].text).toContain('models found');
  
  // Test model details
  const detailResult = await client.callTool({
    name: 'get_model_details', 
    arguments: { id: 'SY1' }
  });
  
  expect(detailResult.content[0].text).toContain('Leverage Points');
  
  await client.close();
}, 15000);

test('E2E: Performance Regression', async () => {
  const start = Date.now();
  
  const promises = Array.from({ length: 10 }, () =>
    fetch(`${WORKER_URL}/v1/models?search=complexity`)
  );
  
  const responses = await Promise.all(promises);
  const duration = Date.now() - start;
  
  // All requests should succeed
  responses.forEach(response => expect(response.ok).toBe(true));
  
  // Performance threshold: 10 concurrent requests in under 5 seconds
  expect(duration).toBeLessThan(5000);
  
  // Average response time should be reasonable
  expect(duration / 10).toBeLessThan(500);
}, 10000);