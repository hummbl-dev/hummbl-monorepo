import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const TOTAL_REQUESTS = 200;
const CONCURRENCY = 10;

// Realistic user query patterns
const USER_PATTERNS = [
  { query: 'feedback', weight: 0.15 },
  { query: 'systems thinking', weight: 0.12 },
  { query: 'decision making', weight: 0.1 },
  { query: 'problem solving', weight: 0.1 },
  { query: 'complexity', weight: 0.08 },
  { query: 'innovation', weight: 0.08 },
  { query: 'strategy', weight: 0.07 },
  { query: 'learning', weight: 0.06 },
  { query: 'optimization', weight: 0.06 },
  { query: 'design', weight: 0.05 },
  { query: 'analysis', weight: 0.05 },
  { query: 'coordination', weight: 0.04 },
  { query: 'risk', weight: 0.04 },
];

const POPULAR_MODELS = ['P1', 'IN1', 'CO1', 'DE1', 'RE1', 'SY1', 'RE8', 'SY19', 'DE7', 'CO2'];

function getWeightedRandomQuery(): string {
  const rand = Math.random();
  let cumulative = 0;

  for (const pattern of USER_PATTERNS) {
    cumulative += pattern.weight;
    if (rand <= cumulative) {
      return pattern.query;
    }
  }

  return USER_PATTERNS[0].query;
}

async function runRealisticStressTest() {
  console.log('🚀 Starting Realistic User Pattern Stress Test...');
  console.log(`📊 Requests: ${TOTAL_REQUESTS}, Concurrency: ${CONCURRENCY}`);
  console.log(`🎯 Simulating real user search patterns\n`);

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['./dist/index.js'],
    env: { ...process.env, WORKER_URL: 'http://localhost:8787' },
  });

  const client = new Client(
    { name: 'realistic-stress-test', version: '1.0.0' },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    console.log('✅ Connected to MCP Server');

    const tools = await client.listTools();
    console.log(`🔧 Tools: ${tools.tools.map(t => t.name).join(', ')}\n`);

    const startTime = Date.now();
    let completed = 0;
    let errors = 0;
    const latencies: number[] = [];

    const tasks = Array.from({ length: TOTAL_REQUESTS }, (_, i) => async () => {
      const requestStart = Date.now();
      const requestType = Math.random();

      try {
        if (requestType < 0.6) {
          // 60% search queries (realistic user behavior)
          const query = getWeightedRandomQuery();
          await client.callTool({
            name: 'search_models',
            arguments: { query },
          });
        } else if (requestType < 0.85) {
          // 25% model details (popular models)
          const id = POPULAR_MODELS[Math.floor(Math.random() * POPULAR_MODELS.length)];
          await client.callTool({
            name: 'get_model_details',
            arguments: { id },
          });
        } else {
          // 15% transformation validation
          const codes = ['P', 'IN', 'CO', 'DE', 'RE', 'SY'];
          const code = codes[Math.floor(Math.random() * codes.length)];
          await client.callTool({
            name: 'get_transformation',
            arguments: { code },
          });
        }

        const latency = Date.now() - requestStart;
        latencies.push(latency);
      } catch (error) {
        errors++;
        // Sanitize error message to prevent log injection
        const sanitizedError = String(error)
          .replace(/[\r\n\t]/g, ' ')
          .substring(0, 200);
        console.error(`❌ Request ${i} failed: ${sanitizedError}`);
      } finally {
        completed++;
        if (completed % 40 === 0) {
          process.stdout.write(`📈 ${completed}/${TOTAL_REQUESTS} `);
        }
      }
    });

    // Concurrency pool with realistic timing
    async function runRealisticPool() {
      const results = [];
      const pool = new Set();

      for (const task of tasks) {
        // Add small random delay to simulate realistic user behavior
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));

        const promise = task();
        pool.add(promise);
        const clean = promise.finally(() => pool.delete(promise));
        results.push(clean);

        if (pool.size >= CONCURRENCY) {
          await Promise.race(pool);
        }
      }
      return Promise.all(results);
    }

    console.log('🏃‍♂️ Running realistic user simulation...\n');
    await runRealisticPool();

    const duration = Date.now() - startTime;
    const successRate = ((TOTAL_REQUESTS - errors) / TOTAL_REQUESTS) * 100;

    // Calculate latency statistics
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    console.log('\n\n📊 REALISTIC STRESS TEST RESULTS');
    console.log('================================');
    console.log(`⏱️  Total Time: ${duration}ms`);
    console.log(`🚀 Throughput: ${(TOTAL_REQUESTS / (duration / 1000)).toFixed(2)} req/sec`);
    console.log(`✅ Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`📈 Latency Stats:`);
    console.log(`   • Average: ${avgLatency.toFixed(2)}ms`);
    console.log(`   • P50: ${p50}ms`);
    console.log(`   • P95: ${p95}ms`);
    console.log(`   • P99: ${p99}ms`);

    if (errors > 0) {
      console.log(`❌ Errors: ${errors}`);
      process.exit(1);
    } else if (avgLatency > 50) {
      console.log(`⚠️  Average latency above 50ms threshold`);
      process.exit(1);
    } else {
      console.log(`\n🎉 Performance targets met!`);
      process.exit(0);
    }
  } catch (error) {
    // Sanitize error message to prevent log injection
    const sanitizedError = String(error)
      .replace(/[\r\n\t]/g, ' ')
      .substring(0, 200);
    console.error(`💥 Fatal Test Error: ${sanitizedError}`);
    process.exit(1);
  }
}

runRealisticStressTest();
