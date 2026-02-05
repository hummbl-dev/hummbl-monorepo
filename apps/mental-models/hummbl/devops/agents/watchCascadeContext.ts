// humbbl/devops/agents/watchCascadeContext.ts

import chokidar from 'chokidar';
import { validateCascadeContext } from './validateCascadeContext.js';
import type { CascadeAgentContext } from './cascadeAgentContext';
import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

type ValidationResult = {
  timestamp: string;
  filePath: string;
  valid: boolean;
  errors: string[];
  context?: CascadeAgentContext;
};

export class ContextWatcher extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;
  private validationTimeout: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_MS = 500; // 500ms debounce time

  constructor(
    private readonly contextPath: string,
    private readonly telemetryPath?: string
  ) {
    super();
  }

  async start(): Promise<void> {
    // Initial validation
    await this.validateContext();

    // Set up file watcher
    this.watcher = chokidar.watch(this.contextPath, {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', () => this.scheduleValidation())
      .on('change', () => this.scheduleValidation())
      .on('error', (error) => this.emit('error', error));
  }

  async stop(): Promise<void> {
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
      this.validationTimeout = null;
    }

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
  }

  private scheduleValidation(): void {
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }

    this.validationTimeout = setTimeout(() => {
      this.validateContext().catch((error) => {
        this.emit('error', error);
      });
    }, this.DEBOUNCE_MS);
  }

  private async validateContext(): Promise<void> {
    const timestamp = new Date().toISOString();

    try {
      // Read and parse the context file
      const content = await fs.readFile(this.contextPath, 'utf-8');
      let context: any;

      // Handle both JSON and TypeScript exports
      if (this.contextPath.endsWith('.ts')) {
        // Simple TS module evaluation (in a real app, consider using ts-node or similar)
        const mod = await import(this.contextPath);
        context = mod.default || mod;
      } else {
        context = JSON.parse(content);
      }

      // Run validation
      const { valid, errors } = validateCascadeContext(context);

      // Create validation result
      const result: ValidationResult = {
        timestamp,
        filePath: this.contextPath,
        valid,
        errors,
        context: valid ? context : undefined,
      };

      // Emit validation event
      this.emit('validation', result);

      // Log to telemetry if path provided
      if (this.telemetryPath) {
        await this.logToTelemetry(result);
      }

      // Emit specific events based on validation result
      if (valid) {
        this.emit('valid', result);
      } else {
        this.emit('invalid', result);
        this.emit('error', new Error(`Context validation failed: ${errors.join(', ')}`));
      }
    } catch (error) {
      const errorResult: ValidationResult = {
        timestamp,
        filePath: this.contextPath,
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };

      this.emit('error', error);
      this.emit('validation', errorResult);

      if (this.telemetryPath) {
        await this.logToTelemetry(errorResult);
      }
    }
  }

  private async logToTelemetry(result: ValidationResult): Promise<void> {
    if (!this.telemetryPath) return;

    try {
      const logEntry = JSON.stringify(result) + '\n';
      await fs.mkdir(path.dirname(this.telemetryPath), { recursive: true });
      await fs.appendFile(this.telemetryPath, logEntry, 'utf-8');
    } catch (error) {
      this.emit('error', new Error(`Failed to write telemetry: ${error}`));
    }
  }
}

// Example usage:
/*
async function main() {
  const watcher = new ContextWatcher(
    './humbbl/devops/agents/cascadeAgentContext.ts',
    './logs/context-validation.log'
  );

  watcher
    .on('validation', (result) => {
      console.log(`[${result.timestamp}] Validation ${result.valid ? 'passed' : 'failed'}`);
    })
    .on('valid', (result) => {
      console.log('Context is valid, notifying reasoning agents...');
      // Notify reasoning agents here
    })
    .on('invalid', (result) => {
      console.error('Context validation errors:', result.errors);
    })
    .on('error', (error) => {
      console.error('Watcher error:', error);
    });

  await watcher.start();
  console.log('Watching for context changes...');

  // Handle process termination
  process.on('SIGINT', async () => {
    await watcher.stop();
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch(console.error);
}
*/
