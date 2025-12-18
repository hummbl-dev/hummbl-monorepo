#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

const checks = [
  {
    name: 'Node.js',
    cmd: 'node --version',
    min: 'v18.0.0',
    check: v => parseFloat(v.slice(1)) >= 18,
  },
  {
    name: 'pnpm',
    cmd: 'pnpm --version',
    min: '9.0.0',
    check: v => parseFloat(v) >= 9,
  },
  {
    name: 'Git',
    cmd: 'git --version',
    min: '2.0.0',
    check: v => parseFloat(v.match(/\d+\.\d+/)[0]) >= 2,
  },
];

const files = [
  'package.json',
  'pnpm-workspace.yaml',
  'turbo.json',
  'apps/mcp-server/package.json',
  'apps/web/package.json',
  'apps/workers/package.json',
];

console.log('🔍 HUMMBL Environment Validation\n');

let allPassed = true;

// Check tools
console.log('📦 Required Tools:');
checks.forEach(check => {
  try {
    const version = execSync(check.cmd, { encoding: 'utf8' }).trim();
    const passed = check.check(version);
    console.log(
      `  ${passed ? '✅' : '❌'} ${check.name}: ${version} ${passed ? '' : `(need ${check.min}+)`}`
    );
    if (!passed) allPassed = false;
  } catch {
    console.log(`  ❌ ${check.name}: Not found (need ${check.min}+)`);
    allPassed = false;
  }
});

// Check files
console.log('\n📁 Required Files:');
files.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allPassed = false;
});

// Check dependencies
console.log('\n📚 Dependencies:');
try {
  execSync('pnpm install --frozen-lockfile', { stdio: 'ignore' });
  console.log('  ✅ All dependencies installed');
} catch {
  console.log('  ❌ Dependencies missing or outdated');
  allPassed = false;
}

// Check build
console.log('\n🔨 Build Status:');
try {
  execSync('pnpm build', { stdio: 'ignore' });
  console.log('  ✅ All packages build successfully');
} catch {
  console.log('  ❌ Build failed');
  allPassed = false;
}

console.log(`\n${allPassed ? '🎉' : '⚠️'} Environment ${allPassed ? 'Ready' : 'Issues Found'}`);

if (allPassed) {
  console.log('\n🚀 Ready to start development:');
  console.log('  pnpm dev:all    # Start all services');
  console.log('  pnpm dev        # Start with Turbo');
  console.log('  pnpm benchmark  # Run performance tests');
}

process.exit(allPassed ? 0 : 1);
