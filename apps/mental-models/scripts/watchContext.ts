#!/usr/bin/env -S node --loader tsx

import { ContextWatcher } from '../hummbl/devops/agents/watchCascadeContext.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const CONTEXT_PATH = path.join(ROOT_DIR, 'hummbl/devops/agents/cascadeAgentContext.ts');
const LOG_DIR = path.join(ROOT_DIR, 'logs');
const TELEMETRY_PATH = path.join(LOG_DIR, 'context-validation.log');

// ANSI color codes for console output
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Format timestamp for logs
function formatTimestamp(): string {
  return new Date().toISOString();
}

// Main function
async function main() {
  console.log(`${COLORS.cyan}${formatTimestamp()} [INFO] Starting context watcher${COLORS.reset}`);
  console.log(`${COLORS.blue}• Watching: ${CONTEXT_PATH}${COLORS.reset}`);
  console.log(`${COLORS.blue}• Logging to: ${TELEMETRY_PATH}${COLORS.reset}\n`);

  const watcher = new ContextWatcher(CONTEXT_PATH, TELEMETRY_PATH);

  // Set up event listeners
  watcher
    .on('validation', (result) => {
      const status = result.valid
        ? `${COLORS.green}✓ VALID${COLORS.reset}`
        : `${COLORS.red}✗ INVALID${COLORS.reset}`;
      console.log(`[${formatTimestamp()}] ${status} Context validated`);
    })
    .on('valid', (result) => {
      console.log(`${COLORS.green}${formatTimestamp()} [VALID] Context is valid${COLORS.reset}`);
      console.log(`${COLORS.cyan}Notifying reasoning agents...${COLORS.reset}\n`);
      // TODO: Add notification logic for reasoning agents
    })
    .on('invalid', (result) => {
      console.error(
        `\n${COLORS.red}${formatTimestamp()} [ERROR] Context validation failed:${COLORS.reset}`
      );
      result.errors.forEach((error, index) => {
        console.error(`${COLORS.red}  ${index + 1}. ${error}${COLORS.reset}`);
      });
      console.log(''); // Add empty line after errors
    })
    .on('error', (error) => {
      console.error(
        `\n${COLORS.red}${formatTimestamp()} [FATAL] ${error.message}${COLORS.reset}\n`
      );
      if (process.env.NODE_ENV === 'development') {
        console.error(error.stack);
      }
    });

  // Start watching
  try {
    await watcher.start();
    console.log(
      `${COLORS.green}${formatTimestamp()} [INFO] Watcher started successfully${COLORS.reset}`
    );
  } catch (error) {
    console.error(
      `${COLORS.red}${formatTimestamp()} [FATAL] Failed to start watcher:${COLORS.reset}`
    );
    console.error(error);
    process.exit(1);
  }

  // Handle process termination
  const shutdown = async (signal: string) => {
    console.log(
      `\n${COLORS.yellow}${formatTimestamp()} [INFO] Received ${signal}, shutting down...${COLORS.reset}`
    );
    try {
      await watcher.stop();
      console.log(
        `${COLORS.green}${formatTimestamp()} [INFO] Watcher stopped gracefully${COLORS.reset}`
      );
      process.exit(0);
    } catch (error) {
      console.error(
        `${COLORS.red}${formatTimestamp()} [ERROR] Error during shutdown:${COLORS.reset}`
      );
      console.error(error);
      process.exit(1);
    }
  };

  // Handle different termination signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Run the main function
main().catch((error) => {
  console.error(`${COLORS.red}${formatTimestamp()} [UNHANDLED ERROR]${COLORS.reset}`, error);
  process.exit(1);
});
