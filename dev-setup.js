#!/usr/bin/env node

import { spawn } from 'child_process';
import { execSync } from 'child_process';

const services = [
  {
    name: 'MCP Server',
    cmd: 'pnpm',
    args: ['--filter', '@hummbl/mcp-server', 'dev'],
    color: '\x1b[36m',
  },
  { name: 'Web App', cmd: 'pnpm', args: ['--filter', '@hummbl/web', 'dev'], color: '\x1b[32m' },
  { name: 'Workers', cmd: 'pnpm', args: ['--filter', '@hummbl/workers', 'dev'], color: '\x1b[33m' },
];

console.log('🚀 Starting HUMMBL Full Stack Development Environment\n');

// Environment validation
console.log('🔍 Validating environment...');
try {
  execSync('node --version', { stdio: 'ignore' });
  execSync('pnpm --version', { stdio: 'ignore' });
  console.log('✅ Node.js and pnpm available\n');
} catch {
  console.error('❌ Missing Node.js or pnpm');
  process.exit(1);
}

// Start all services
const processes = services.map(service => {
  console.log(`${service.color}🟢 Starting ${service.name}...`);

  const proc = spawn(service.cmd, service.args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  proc.stdout.on('data', data => {
    process.stdout.write(`${service.color}[${service.name}] ${data}\x1b[0m`);
  });

  proc.stderr.on('data', data => {
    process.stderr.write(`${service.color}[${service.name}] ${data}\x1b[0m`);
  });

  proc.on('close', code => {
    console.log(`${service.color}[${service.name}] exited with code ${code}\x1b[0m`);
  });

  return proc;
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all services...');
  processes.forEach(proc => proc.kill('SIGTERM'));
  setTimeout(() => process.exit(0), 1000);
});

console.log('\n📋 Services running:');
console.log('  • MCP Server: http://localhost:3001');
console.log('  • Web App: http://localhost:5173');
console.log('  • Workers: http://localhost:8787');
console.log('\n💡 Press Ctrl+C to stop all services\n');
