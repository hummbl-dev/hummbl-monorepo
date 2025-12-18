#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

const today = new Date().toISOString().split('T')[0];
const benchmarkPath = `reports/benchmark-${today}.json`;

if (!fs.existsSync('reports')) fs.mkdirSync('reports');

async function runBenchmarks() {
  const results = { timestamp: new Date().toISOString(), tests: {} };

  // Build benchmark
  console.log('🔨 Running build benchmark...');
  const buildStart = Date.now();
  try {
    execSync('pnpm build', { stdio: 'ignore' });
    results.tests.build = { time: Date.now() - buildStart, status: 'pass' };
  } catch {
    results.tests.build = { time: Date.now() - buildStart, status: 'fail' };
  }

  // Test benchmark
  console.log('🧪 Running test benchmark...');
  const testStart = Date.now();
  try {
    execSync('pnpm test', { stdio: 'ignore' });
    results.tests.test = { time: Date.now() - testStart, status: 'pass' };
  } catch {
    results.tests.test = { time: Date.now() - testStart, status: 'fail' };
  }

  // Lint benchmark
  console.log('🔍 Running lint benchmark...');
  const lintStart = Date.now();
  try {
    execSync('pnpm lint', { stdio: 'ignore' });
    results.tests.lint = { time: Date.now() - lintStart, status: 'pass' };
  } catch {
    results.tests.lint = { time: Date.now() - lintStart, status: 'fail' };
  }

  // MCP stress test (if available)
  console.log('⚡ Running MCP benchmark...');
  try {
    const mcpOutput = execSync(
      'cd apps/mcp-server && pnpm build && timeout 30s node src/stress-client.ts 2>&1 || true',
      { encoding: 'utf8' }
    );
    const throughputMatch = mcpOutput.match(/Throughput: ([\d.]+) req\/sec/);
    const latencyMatch = mcpOutput.match(/Avg Latency: ([\d.]+)ms/);

    results.tests.mcp = {
      throughput: throughputMatch ? parseFloat(throughputMatch[1]) : 0,
      latency: latencyMatch ? parseFloat(latencyMatch[1]) : 0,
      status: throughputMatch ? 'pass' : 'fail',
    };
  } catch {
    results.tests.mcp = { throughput: 0, latency: 0, status: 'fail' };
  }

  // Calculate overall score
  const passCount = Object.values(results.tests).filter(t => t.status === 'pass').length;
  results.score = Math.round((passCount / Object.keys(results.tests).length) * 100);

  fs.writeFileSync(benchmarkPath, JSON.stringify(results, null, 2));

  console.log('\n📊 Benchmark Results:');
  console.log(`Build: ${results.tests.build.time}ms (${results.tests.build.status})`);
  console.log(`Test: ${results.tests.test.time}ms (${results.tests.test.status})`);
  console.log(`Lint: ${results.tests.lint.time}ms (${results.tests.lint.status})`);
  console.log(
    `MCP: ${results.tests.mcp.throughput} req/s, ${results.tests.mcp.latency}ms (${results.tests.mcp.status})`
  );
  console.log(`Overall Score: ${results.score}%`);

  return results;
}

runBenchmarks().catch(console.error);
