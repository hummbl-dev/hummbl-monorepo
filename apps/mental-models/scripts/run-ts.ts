#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function run() {
  const script = process.argv[2];
  if (!script) {
    console.error('Please provide a script to run');
    process.exit(1);
  }

  const scriptPath = resolve(__dirname, script);
  
  // Use tsx to run TypeScript files directly
  const proc = spawn('npx', ['tsx', scriptPath], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_OPTIONS: '--no-warnings',
    },
  });

  proc.on('close', (code) => {
    process.exit(code || 0);
  });
}

run().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
