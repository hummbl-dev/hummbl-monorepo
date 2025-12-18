import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const TOTAL_REQUESTS = 100;
const CONCURRENCY = 5;

async function runStressTest() {
  console.log('Starting MCP Stress Test...');
  console.log(`Target: Local MCP Server (dist/index.js)`);
  console.log(`Requests: ${TOTAL_REQUESTS}`);
  console.log(`Concurrency: ${CONCURRENCY}`);

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['./dist/index.js'],
    env: {
      ...process.env,
      WORKER_URL: 'http://localhost:8787',
    },
  });

  const client = new Client(
    {
      name: 'stress-test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    await client.connect(transport);
    console.log('✅ Connected to MCP Server');

    // List tools to verify connection
    const tools = await client.listTools();
    console.log(`✅ Tools discovered: ${tools.tools.map(t => t.name).join(', ')}`);

    const startTime = Date.now();
    let completed = 0;
    let errors = 0;

    // Mix of queries to test different paths
    const queries = ['inversion', 'complexity', 'entropy', 'feedback', 'systems'];
    const modelIds = ['P1', 'IN1', 'CO1', 'DE1', 'RE1'];

    const tasks = Array.from({ length: TOTAL_REQUESTS }, (_, i) => async () => {
      const type = i % 2 === 0 ? 'search' : 'details';

      try {
        if (type === 'search') {
          const query = queries[i % queries.length];
          await client.callTool({
            name: 'search_models',
            arguments: { query },
          });
        } else {
          const id = modelIds[i % modelIds.length];
          await client.callTool({
            name: 'get_model_details',
            arguments: { id },
          });
        }
      } catch (_e) {
        errors++;
        console.error(`Request ${i} failed:`, _e);
      } finally {
        completed++;
        if (completed % 20 === 0) {
          process.stdout.write(`.`);
        }
      }
    });

    // Simple concurrency pool
    async function runPool() {
      const results = [];
      const pool = new Set();

      for (const task of tasks) {
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

    console.log('\nRunning requests...');
    await runPool();

    const duration = Date.now() - startTime;
    console.log('\n\n--- RESULTS ---');
    console.log(`Total Time: ${duration}ms`);
    console.log(`Avg Latency: ${(duration / TOTAL_REQUESTS).toFixed(2)}ms per request (amortized)`);
    console.log(`Throughput: ${(TOTAL_REQUESTS / (duration / 1000)).toFixed(2)} req/sec`);
    console.log(
      `Success Rate: ${(((TOTAL_REQUESTS - errors) / TOTAL_REQUESTS) * 100).toFixed(1)}%`
    );

    if (errors > 0) {
      console.log(`Errors: ${errors}`);
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Fatal Test Error:', error);
    process.exit(1);
  }
}

runStressTest();
