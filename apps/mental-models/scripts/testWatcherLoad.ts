#!/usr/bin/env -S node --loader tsx

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const TEST_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const MODIFICATION_INTERVAL_MS = 5000; // 5 seconds between modifications
const LOG_FILE = 'watcher-load-test.log';
const CONTEXT_FILE = path.resolve('hummbl/devops/agents/cascadeAgentContext.ts');

// Get the directory name in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_PATH = path.join(LOG_DIR, LOG_FILE);
fs.mkdirSync(LOG_DIR, { recursive: true });

// Test data
const TEST_MODIFICATIONS = [
  { field: 'agent_identity.model', value: 'SWE-1' },
  { field: 'team_structure.Reuben.role', value: 'HITL / Cognitive Engineer' },
  {
    field: 'operating_protocol.workflow_sequence',
    value: ['plan', 'validate', 'implement', 'review', 'deploy'],
  },
  {
    field: 'telemetry.tracked_metrics',
    value: ['build_integrity', 'commit_traceability', 'lint_compliance'],
  },
];

// Logging function
function log(message: string, type: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  process.stdout.write(logMessage);
  fs.appendFileSync(LOG_PATH, logMessage);
}

// Memory monitoring
function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    rss: Math.round((used.rss / 1024 / 1024) * 100) / 100, // MB
    heapTotal: Math.round((used.heapTotal / 1024 / 1024) * 100) / 100, // MB
    heapUsed: Math.round((used.heapUsed / 1024 / 1024) * 100) / 100, // MB
    external: Math.round((used.external / 1024 / 1024) * 100) / 100, // MB
  };
}

// Log memory usage
function logMemoryUsage() {
  const memory = getMemoryUsage();
  log(
    `Memory - RSS: ${memory.rss}MB, Heap: ${memory.heapUsed}/${memory.heapTotal}MB, External: ${memory.external}MB`
  );
}

// Modify the context file
function modifyContextFile(modIndex: number) {
  const mod = TEST_MODIFICATIONS[modIndex % TEST_MODIFICATIONS.length];
  const content = fs.readFileSync(CONTEXT_FILE, 'utf-8');

  // Simple modification - in a real test, you'd want to properly parse and modify the TypeScript file
  const modifiedContent = content.replace(
    new RegExp(`(${mod.field}:\s*)(\S+)`, 'm'),
    `$1${JSON.stringify(mod.value)}`
  );

  const timestamp = Date.now();
  fs.writeFileSync(CONTEXT_FILE, modifiedContent);
  log(`Modified ${mod.field} at ${new Date(timestamp).toISOString()}`);
  return timestamp;
}

// Main test function
async function runTest() {
  log('Starting watcher load test');
  logMemoryUsage();

  // Start the watcher process
  const watcherProcess = spawn('npx', ['tsx', 'scripts/watchContext.ts'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  // Log watcher output
  watcherProcess.stdout?.on('data', (data) => {
    log(`[WATCHER] ${data.toString().trim()}`);
  });

  watcherProcess.stderr?.on('data', (data) => {
    log(`[WATCHER-ERROR] ${data.toString().trim()}`, 'ERROR');
  });

  // Wait for watcher to initialize
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Save the original file content
  const originalContent = fs.readFileSync(CONTEXT_FILE, 'utf-8');

  try {
    // Run the test for the specified duration
    const startTime = Date.now();
    let modCount = 0;

    log(`Test will run for ${TEST_DURATION_MS / 1000} seconds`);

    const interval = setInterval(() => {
      if (Date.now() - startTime >= TEST_DURATION_MS) {
        clearInterval(interval);
        return;
      }

      try {
        const modTime = modifyContextFile(modCount++);
        log(`Modification #${modCount} at ${new Date(modTime).toISOString()}`);
        logMemoryUsage();
      } catch (error) {
        log(`Error during modification: ${error}`, 'ERROR');
      }
    }, MODIFICATION_INTERVAL_MS);

    // Wait for test duration
    await new Promise((resolve) => setTimeout(resolve, TEST_DURATION_MS + 2000));
    clearInterval(interval);

    log(`Test completed after ${modCount} modifications`);
    logMemoryUsage();
  } finally {
    // Restore original file
    fs.writeFileSync(CONTEXT_FILE, originalContent);

    // Stop the watcher
    if (watcherProcess && watcherProcess.pid) {
      if (process.platform === 'win32') {
        execSync(`taskkill /PID ${watcherProcess.pid} /T /F`);
      } else {
        process.kill(-watcherProcess.pid, 'SIGTERM');
      }
    } else {
      log('Watcher process not found or already terminated', 'WARN');
    }

    log('Test completed. Check logs for results.');
  }
}

// Run the test
runTest().catch((error) => {
  log(`Test failed: ${error}`, 'ERROR');
  process.exit(1);
});
