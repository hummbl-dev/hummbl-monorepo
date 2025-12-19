#!/usr/bin/env node

const endpoints = [
  'https://hummbl-workers.hummbl.workers.dev/health',
  'https://hummbl-workers.hummbl.workers.dev/v1/models/P1',
  'https://hummbl-workers.hummbl.workers.dev/v1/transformations/RE',
];

async function healthCheck() {
  console.log('🏥 HUMMBL Health Check\n');

  const results = [];

  for (const endpoint of endpoints) {
    const start = Date.now();
    try {
      const response = await fetch(endpoint);
      const duration = Date.now() - start;
      const status = response.ok ? '✅' : '❌';

      console.log(`${status} ${endpoint} (${response.status}) - ${duration}ms`);

      results.push({
        endpoint,
        status: response.status,
        ok: response.ok,
        duration,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`❌ ${endpoint} - ERROR: ${error.message} - ${duration}ms`);

      results.push({
        endpoint,
        status: 0,
        ok: false,
        duration,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  const allHealthy = results.every(r => r.ok);
  const avgResponseTime = results.length > 0 ? results.reduce((sum, r) => sum + r.duration, 0) / results.length : 0;

  console.log(`\n📊 Summary:`);
  console.log(`Status: ${allHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
  console.log(`Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  // Save results
  try {
    const fs = await import('fs');
    const today = new Date().toISOString().split('T')[0];
    const logPath = `monitoring/health-${today}.json`;

    let logs = [];
    try {
      const data = fs.readFileSync(logPath, 'utf8');
      logs = JSON.parse(data);
      if (!Array.isArray(logs)) logs = [];
    } catch {
      logs = [];
    }

    logs.push({
      timestamp: new Date().toISOString(),
      healthy: allHealthy,
      avgResponseTime,
      results,
    });

    // Keep only last 100 entries
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error(`⚠️  Failed to save health check results: ${error.message}`);
  }

  return allHealthy;
}

try {
  const healthy = await healthCheck();
  process.exit(healthy ? 0 : 1);
} catch (error) {
  console.error(`💥 Health check failed: ${error.message}`);
  process.exit(1);
}
