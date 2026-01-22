import { validateContext } from '../cascade/context/validation/cvp';
import { performance } from 'perf_hooks';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Generate a random HUMMBL packet
function generateHummblPacket(id: number): any {
  const now = Date.now();
  return {
    id: `test-${id}`,
    timestamp: now - Math.floor(Math.random() * 1000 * 60 * 60 * 24), // Random timestamp within last 24h
    context: {
      userId: `user-${Math.floor(Math.random() * 1000)}`,
      sessionId: `session-${Math.floor(Math.random() * 10000)}`,
      environment: 'benchmark',
      version: '1.0.0',
    },
    payload: {
      type: 'test',
      data: `Test data for packet ${id}`,
      value: Math.random() * 1000,
    },
  };
}

async function runBenchmark() {
  const PACKET_COUNT = 10000;
  const BATCH_SIZE = 100;
  const results = {
    totalPackets: 0,
    successful: 0,
    failed: 0,
    latencies: [] as number[],
    errors: [] as string[],
  };

  console.log(`🚀 Starting CVP Benchmark (${PACKET_COUNT} packets, batch size: ${BATCH_SIZE})`);

  const startTime = performance.now();

  // Process packets in batches to avoid memory issues
  for (let batch = 0; batch < PACKET_COUNT / BATCH_SIZE; batch++) {
    const batchPromises = [];

    // Create a batch of validation promises
    for (let i = 0; i < BATCH_SIZE; i++) {
      const packet = generateHummblPacket(batch * BATCH_SIZE + i);
      const start = performance.now();

      batchPromises.push(
        validateContext(packet, { timeout: 5000 })
          .then((result) => {
            const latency = performance.now() - start;
            results.latencies.push(latency);

            if (result.isValid) {
              results.successful++;
            } else {
              results.failed++;
              if (result.errors.length > 0) {
                results.errors.push(`Packet ${packet.id} failed: ${result.errors[0]}`);
              }
            }
          })
          .catch((error) => {
            results.failed++;
            results.errors.push(`Error processing packet ${packet.id}: ${error.message}`);
          })
      );
    }

    // Wait for batch to complete
    await Promise.all(batchPromises);
    process.stdout.write(
      `\r✅ Processed batch ${batch + 1}/${Math.ceil(PACKET_COUNT / BATCH_SIZE)}`
    );
  }

  const totalTime = performance.now() - startTime;

  // Calculate statistics
  const sortedLatencies = [...results.latencies].sort((a, b) => a - b);
  const totalLatency = sortedLatencies.reduce((sum, lat) => sum + lat, 0);
  const meanLatency = totalLatency / results.latencies.length;
  const p95Latency = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)];
  const p99Latency = sortedLatencies[Math.floor(sortedLatencies.length * 0.99)];
  const maxLatency = sortedLatencies[sortedLatencies.length - 1];

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    packetCount: PACKET_COUNT,
    successful: results.successful,
    failed: results.failed,
    successRate: (results.successful / PACKET_COUNT) * 100,
    performance: {
      totalTimeMs: totalTime,
      packetsPerSecond: (PACKET_COUNT / (totalTime / 1000)).toFixed(2),
      meanLatencyMs: meanLatency.toFixed(2),
      p95LatencyMs: p95Latency.toFixed(2),
      p99LatencyMs: p99Latency.toFixed(2),
      maxLatencyMs: maxLatency.toFixed(2),
    },
    errors: results.errors.slice(0, 10), // Show first 10 errors if any
  };

  // Save report to file
  const reportPath = join(__dirname, '../reports/cvp-benchmark.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print summary
  console.log('\n\n📊 Benchmark Results:');
  console.log('----------------------------------------');
  console.log(`📦 Total Packets: ${report.packetCount}`);
  console.log(`✅ Successful: ${report.successful} (${report.successRate.toFixed(2)}%)`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log('\n⏱️  Performance:');
  console.log(`  Total Time: ${(report.performance.totalTimeMs / 1000).toFixed(2)}s`);
  console.log(`  Throughput: ${report.performance.packetsPerSecond} packets/sec`);
  console.log(`  Mean Latency: ${report.performance.meanLatencyMs}ms`);
  console.log(`  95th Percentile: ${report.performance.p95LatencyMs}ms`);
  console.log(`  99th Percentile: ${report.performance.p99LatencyMs}ms`);
  console.log(`  Max Latency: ${report.performance.maxLatencyMs}ms`);

  if (report.errors.length > 0) {
    console.log('\n⚠️  First few errors:');
    report.errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
    if (report.errors.length < results.errors.length) {
      console.log(`  ... and ${results.errors.length - report.errors.length} more`);
    }
  }

  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

// Run the benchmark
runBenchmark().catch(console.error);
