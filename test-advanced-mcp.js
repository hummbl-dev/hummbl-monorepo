#!/usr/bin/env node

import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testAdvancedMCP() {
  console.log('🧪 Testing Advanced MCP Features\n');

  // Build first
  console.log('🔨 Building MCP server...');
  const buildProcess = spawn('pnpm', ['--filter', '@hummbl/mcp-server', 'build'], {
    stdio: 'inherit',
  });

  await new Promise((resolve, reject) => {
    buildProcess.on('close', code => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`Build failed with code ${code}`));
    });
  });

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['./apps/mcp-server/dist/advanced-tools.js'],
    env: {
      ...process.env,
      WORKER_URL: 'https://hummbl-workers.hummbl.workers.dev',
    },
  });

  const client = new Client(
    { name: 'advanced-test-client', version: '1.0.0' },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    console.log('✅ Connected to Advanced MCP Server');

    // Test 1: Batch get models
    console.log('\n📦 Testing batch_get_models...');
    const batchResult = await client.callTool({
      name: 'batch_get_models',
      arguments: { ids: ['P1', 'IN1', 'CO1'] },
    });
    console.log('✅ Batch operation successful');

    // Test 2: Compare models
    console.log('\n🔍 Testing compare_models...');
    const compareResult = await client.callTool({
      name: 'compare_models',
      arguments: { ids: ['RE1', 'RE2'] },
    });
    console.log('✅ Model comparison successful');

    // Test 3: Usage analytics
    console.log('\n📊 Testing get_usage_analytics...');
    const analyticsResult = await client.callTool({
      name: 'get_usage_analytics',
      arguments: { timeframe: 'day' },
    });
    console.log('✅ Analytics retrieval successful');

    console.log('\n🎉 All advanced features working!');

    await client.close();
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

const success = await testAdvancedMCP();
process.exit(success ? 0 : 1);
