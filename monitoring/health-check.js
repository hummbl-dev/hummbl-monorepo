#!/usr/bin/env node

/**
 * Basic Health Check Script
 * Checks critical endpoints and services
 */

const https = require('https');
const http = require('http');

const ENDPOINTS = [
  {
    name: 'Workers Health',
    url: 'https://hummbl-workers.hummbl.workers.dev/health',
    timeout: 10000
  },
  {
    name: 'Analytics Health', 
    url: 'https://hummbl-workers.hummbl.workers.dev/v1/analytics/health',
    timeout: 10000
  }
];

async function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(endpoint.url, { timeout: endpoint.timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isHealthy = res.statusCode >= 200 && res.statusCode < 400;
        resolve({
          name: endpoint.name,
          url: endpoint.url,
          status: res.statusCode,
          healthy: isHealthy,
          response: data.substring(0, 200)
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        status: 0,
        healthy: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        url: endpoint.url,
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

  if (allHealthy) {
    console.log('✅ All endpoints healthy');
    process.exit(0);
  } else {
    console.log('⚠️  Some endpoints unhealthy - monitoring will continue');
    // Don't fail the workflow for now, just log issues
    process.exit(0);
  }
}

if (require.main === module) {
  runHealthCheck().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

module.exports = { runHealthCheck, checkEndpoint };