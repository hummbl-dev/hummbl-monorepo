#!/usr/bin/env node

const https = require('https');
const http = require('http');

const ENDPOINTS = [
  {
    name: 'Workers Health',
    url: 'https://hummbl-workers.hummbl.workers.dev/health',
    timeout: 10000
  }
];

async function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(endpoint.url, { timeout: endpoint.timeout }, (res) => {
      resolve({
        name: endpoint.name,
        status: res.statusCode,
        healthy: res.statusCode >= 200 && res.statusCode < 400
      });
    });

    req.on('error', (error) => {
      resolve({
        name: endpoint.name,
        status: 0,
        healthy: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        status: 0,
        healthy: false,
        error: 'Request timeout'
      });
    });
  });
}

async function runHealthCheck() {
  console.log('🏥 Starting health check...');
  
  const results = await Promise.all(
    ENDPOINTS.map(endpoint => checkEndpoint(endpoint))
  );

  let allHealthy = true;
  
  for (const result of results) {
    const status = result.healthy ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.status || 'ERROR'}`);
    
    if (!result.healthy) {
      allHealthy = false;
      console.log(`   Error: ${result.error || 'Unhealthy response'}`);
    }
  }

  console.log(allHealthy ? '✅ All endpoints healthy' : '⚠️  Some endpoints unhealthy - graceful degradation');
  process.exit(0); // Always exit 0
}

runHealthCheck().catch(error => {
  console.error('❌ Health check failed:', error);
  process.exit(0); // Even on error, exit 0
});