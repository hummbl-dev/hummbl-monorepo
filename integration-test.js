#!/usr/bin/env node

/**
 * HUMMBL Full Stack Integration Test
 * Tests core functionality without external dependencies
 */

import { spawn } from 'child_process';

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function runCommand(command, args, cwd = '.') {
  return new Promise(resolve => {
    const proc = spawn(command, args, { cwd, stdio: 'pipe' });

    let output = '';
    proc.stdout.on('data', data => (output += data.toString()));
    proc.stderr.on('data', data => (output += data.toString()));

    proc.on('close', code => {
      resolve({ code, output });
    });
  });
}

async function testMCPServer() {
  log('blue', '\n🔧 Testing MCP Server Build...');

  const result = await runCommand('pnpm', ['--filter', '@hummbl/mcp-server', 'build']);

  if (result.code === 0) {
    log('green', '✅ MCP Server: Build successful');
    return true;
  }

  log('red', '❌ MCP Server: Build failed');
  return false;
}

async function testWorkers() {
  log('blue', '\n⚡ Testing Workers...');

  const result = await runCommand('pnpm', ['--filter', '@hummbl/workers', 'test']);

  if (result.code === 0 && result.output.includes('5 passed')) {
    log('green', '✅ Workers: All 5 tests passing');
    return true;
  }

  log('red', '❌ Workers: Tests failed');
  return false;
}

async function testAINativeDocs() {
  log('blue', '\n📚 Testing AI-Native Documentation...');

  const result = await runCommand('node', ['test-validation.js'], './hummbl-io-docs');

  if (result.code === 0 && result.output.includes('prevents hallucination')) {
    log('green', '✅ AI-Native Docs: Validation system working');
    return true;
  }

  log('red', '❌ AI-Native Docs: Validation failed');
  return false;
}

async function testWebBuild() {
  log('blue', '\n🌐 Testing Web App...');

  const result = await runCommand('pnpm', ['--filter', '@hummbl/web', 'build']);

  if (result.code === 0 && result.output.includes('built in')) {
    log('green', '✅ Web App: Build successful');
    return true;
  }

  log('red', '❌ Web App: Build failed');
  return false;
}

async function testFullValidation() {
  log('blue', '\n🔍 Testing Full Monorepo Validation...');

  const result = await runCommand('pnpm', ['validate']);

  if (result.code === 0 && result.output.includes('14 successful')) {
    log('green', '✅ Full Validation: All 14 tasks successful');
    return true;
  }

  log('red', '❌ Full Validation: Some tasks failed');
  return false;
}

async function main() {
  log('yellow', '🚀 HUMMBL Full Stack Integration Test');
  log('yellow', '=====================================');

  const tests = [
    { name: 'MCP Server', fn: testMCPServer },
    { name: 'Workers API', fn: testWorkers },
    { name: 'AI-Native Docs', fn: testAINativeDocs },
    { name: 'Web App', fn: testWebBuild },
    { name: 'Full Validation', fn: testFullValidation },
  ];

  const results = [];
  for (const test of tests) {
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
  }

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  log('yellow', '\n📊 Integration Test Results:');
  log('yellow', '============================');

  results.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    const color = r.passed ? 'green' : 'red';
    log(color, `${status} ${r.name}`);
  });

  if (passed === total) {
    log('green', `\n🎉 ALL TESTS PASSED (${passed}/${total})`);
    log('green', '🚀 HUMMBL Stack is fully operational!');
    process.exit(0);
  } else {
    log('red', `\n🔧 TESTS FAILED (${passed}/${total})`);
    log('red', '⚠️  Some components need attention');
    process.exit(1);
  }
}

main().catch(console.error);
