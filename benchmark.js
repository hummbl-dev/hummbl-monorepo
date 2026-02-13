#!/usr/bin/env node
/**
 * Simple performance benchmark for HUMMBL Workers API
 * Measures response times for key endpoints
 */

import { performance } from 'perf_hooks';

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8787';

const endpoints = [
  { path: '/health', method: 'GET', name: 'Health Check' },
  { path: '/v1/models', method: 'GET', name: 'List Models' },
  { path: '/v1/transformations', method: 'GET', name: 'List Transformations' },
];

async function benchmarkEndpoint(endpoint, iterations = 10) {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      const response = await fetch(`${WORKER_URL}${endpoint.path}`, {
        method: endpoint.method,
      });
      const end = performance.now();
      times.push(end - start);

      if (!response.ok) {
        console.warn(`  Warning: ${endpoint.path} returned ${response.status}`);
      }
    } catch (error) {
      console.error(`  Error: ${endpoint.path} - ${error.message}`);
      times.push(null);
    }
  }

  const validTimes = times.filter(t => t !== null);
  if (validTimes.length === 0) return null;

  const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
  const min = Math.min(...validTimes);
  const max = Math.max(...validTimes);

  return { avg, min, max, success: validTimes.length };
}

async function runBenchmarks() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           HUMMBL Workers API Performance Benchmark         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nWorker URL: ${WORKER_URL}\n`);

  for (const endpoint of endpoints) {
    console.log(`📊 ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
    const result = await benchmarkEndpoint(endpoint, 10);

    if (result) {
      console.log(`   Avg: ${result.avg.toFixed(2)}ms`);
      console.log(`   Min: ${result.min.toFixed(2)}ms`);
      console.log(`   Max: ${result.max.toFixed(2)}ms`);
      console.log(`   Success: ${result.success}/10`);
    } else {
      console.log('   Failed to benchmark');
    }
    console.log();
  }

  console.log('✅ Benchmark complete');
}

runBenchmarks().catch(console.error);
