/**
 * Memory Management Utilities for Tests
 * 
 * This module provides utilities to help manage memory in tests, including:
 * - Tracking memory usage
 * - Forcing garbage collection
 * - Detecting memory leaks
 * - Cleaning up resources
 */

interface MemorySnapshot {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
}

interface MemoryLeakDetectorOptions {
  /** Maximum allowed memory growth in MB between operations */
  maxGrowthMB?: number;
  /** Number of warmup iterations before measuring */
  warmupIterations?: number;
  /** Number of test iterations to run */
  testIterations?: number;
  /** Callback to run between iterations */
  betweenIterations?: () => void | Promise<void>;
  /** Whether to log memory usage */
  verbose?: boolean;
}

/**
 * Memory management utilities for tests
 */
export class MemoryManager {
  private snapshots: Array<{ name: string; memory: MemorySnapshot }> = [];
  private readonly gc: () => void;
  
  constructor() {
    // Get the garbage collector function if available
    if (typeof global.gc === 'function') {
      this.gc = global.gc;
    } else {
      // In non-V8 environments, use a no-op
      this.gc = () => {};
      console.warn('Garbage collector not exposed. Run with --expose-gc flag for better memory management.');
    }
  }
  
  /**
   * Force garbage collection
   */
  collectGarbage(): void {
    this.gc();
    // Give the garbage collector some time to work
    return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
      this.gc();
    }) as any;
  }
  
  /**
   * Take a memory snapshot
   * @param name Name for this snapshot
   */
  takeSnapshot(name: string): MemorySnapshot {
    const memory = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      rss: bytesToMB(memory.rss),
      heapTotal: bytesToMB(memory.heapTotal),
      heapUsed: bytesToMB(memory.heapUsed),
      external: bytesToMB(memory.external || 0),
      arrayBuffers: bytesToMB(memory.arrayBuffers || 0)
    };
    
    this.snapshots.push({ name, memory: snapshot });
    
    if (process.env.DEBUG_MEMORY) {
      console.log(`📸 Memory snapshot [${name}]:`, formatMemory(snapshot));
    }
    
    return snapshot;
  }
  
  /**
   * Get the difference between the last two snapshots
   */
  getLastDiff(): { [K in keyof MemorySnapshot]: number } | null {
    if (this.snapshots.length < 2) return null;
    
    const current = this.snapshots[this.snapshots.length - 1].memory;
    const previous = this.snapshots[this.snapshots.length - 2].memory;
    
    return {
      rss: current.rss - previous.rss,
      heapTotal: current.heapTotal - previous.heapTotal,
      heapUsed: current.heapUsed - previous.heapUsed,
      external: current.external - previous.external,
      arrayBuffers: current.arrayBuffers - previous.arrayBuffers
    };
  }
  
  /**
   * Check if memory is growing between snapshots
   * @param thresholdMB Threshold in MB to consider as growth
   */
  isMemoryGrowing(thresholdMB = 1): boolean {
    const diff = this.getLastDiff();
    if (!diff) return false;
    
    return (
      diff.heapUsed > thresholdMB ||
      diff.rss > thresholdMB ||
      diff.external > thresholdMB
    );
  }
  
  /**
   * Reset all snapshots
   */
  reset(): void {
    this.snapshots = [];
  }
  
  /**
   * Get a summary of memory usage
   */
  getSummary(): string {
    if (this.snapshots.length === 0) {
      return 'No memory snapshots taken';
    }
    
    const first = this.snapshots[0].memory;
    const last = this.snapshots[this.snapshots.length - 1].memory;
    const diff = {
      rss: last.rss - first.rss,
      heapTotal: last.heapTotal - first.heapTotal,
      heapUsed: last.heapUsed - first.heapUsed,
      external: last.external - first.external,
      arrayBuffers: last.arrayBuffers - first.arrayBuffers
    };
    
    return [
      '\n📊 Memory Usage Summary',
      '='.repeat(80),
      `First snapshot [${this.snapshots[0].name}]: ${formatMemory(first)}`,
      `Last snapshot [${this.snapshots[this.snapshots.length - 1].name}]: ${formatMemory(last)}`,
      `Difference: ${formatMemory(diff as MemorySnapshot)}`,
      '='.repeat(80),
      this.snapshots.map((s, i) => {
        const mem = s.memory;
        const prev = i > 0 ? this.snapshots[i - 1].memory : null;
        const diff = prev ? {
          rss: mem.rss - prev.rss,
          heapUsed: mem.heapUsed - prev.heapUsed,
          external: mem.external - (prev.external || 0)
        } : null;
        
        return `${i + 1}. [${s.name}] ${formatMemory(mem)}` + 
               (diff ? ` (Δ ${formatMemory(diff as MemorySnapshot)})` : '');
      }).join('\n'),
      '='.repeat(80)
    ].join('\n');
  }
  
  /**
   * Detect memory leaks in a test
   * @param testFn The test function to check for leaks
   * @param options Configuration options
   */
  async detectLeaks(
    testFn: () => void | Promise<void>,
    options: MemoryLeakDetectorOptions = {}
  ): Promise<{ leaked: boolean; details: string }> {
    const {
      maxGrowthMB = 1,
      warmupIterations = 3,
      testIterations = 5,
      betweenIterations,
      verbose = false
    } = options;
    
    const log = verbose ? console.log : () => {};
    const results: Array<{ iteration: number; memory: MemorySnapshot }> = [];
    
    // Warmup phase
    log('🔥 Warming up...');
    for (let i = 0; i < warmupIterations; i++) {
      await testFn();
      if (betweenIterations) await betweenIterations();
      await this.collectGarbage();
    }
    
    // Test phase
    log('🧪 Running leak detection...');
    for (let i = 0; i < testIterations; i++) {
      await testFn();
      if (betweenIterations) await betweenIterations();
      
      await this.collectGarbage();
      
      // Take memory snapshot
      const memory = process.memoryUsage();
      const snapshot: MemorySnapshot = {
        rss: bytesToMB(memory.rss),
        heapTotal: bytesToMB(memory.heapTotal),
        heapUsed: bytesToMB(memory.heapUsed),
        external: bytesToMB(memory.external || 0),
        arrayBuffers: bytesToMB(memory.arrayBuffers || 0)
      };
      
      results.push({
        iteration: i + 1,
        memory: snapshot
      });
      
      log(`  Iteration ${i + 1}: ${formatMemory(snapshot)}`);
    }
    
    // Analyze results
    if (results.length < 2) {
      return {
        leaked: false,
        details: 'Not enough data to detect leaks (need at least 2 iterations)'
      };
    }
    
    // Calculate memory growth between iterations
    let totalGrowth = 0;
    let growingIterations = 0;
    
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1].memory;
      const curr = results[i].memory;
      const growth = curr.heapUsed - prev.heapUsed;
      
      if (growth > 0) {
        totalGrowth += growth;
        growingIterations++;
      }
    }
    
    const avgGrowth = growingIterations > 0 ? totalGrowth / growingIterations : 0;
    const isLeaking = avgGrowth > maxGrowthMB;
    
    // Generate report
    const report = [
      '\n🔍 Memory Leak Detection Report',
      '='.repeat(80),
      `Test iterations: ${testIterations}`,
      `Average memory growth: ${avgGrowth.toFixed(2)} MB per iteration`,
      `Maximum allowed growth: ${maxGrowthMB} MB per iteration`,
      `Verdict: ${isLeaking ? 'POTENTIAL LEAK DETECTED' : 'No significant memory growth'}`,
      '\nMemory usage per iteration:',
      ...results.map(r => `  #${r.iteration}: ${formatMemory(r.memory)}`),
      '='.repeat(80)
    ].join('\n');
    
    return {
      leaked: isLeaking,
      details: report
    };
  }
}

// Helper functions
function bytesToMB(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}

function formatMemory(memory: Partial<MemorySnapshot>): string {
  const parts: string[] = [];
  
  if (memory.rss !== undefined) parts.push(`RSS: ${memory.rss.toFixed(2)}MB`);
  if (memory.heapUsed !== undefined) parts.push(`Heap: ${memory.heapUsed.toFixed(2)}MB`);
  if (memory.external !== undefined) parts.push(`External: ${memory.external.toFixed(2)}MB`);
  if (memory.arrayBuffers !== undefined) parts.push(`ArrayBuffers: ${memory.arrayBuffers.toFixed(2)}MB`);
  
  return parts.join(' | ');
}

// Export a singleton instance
export const memoryManager = new MemoryManager();

// Export cleanup utilities
export async function cleanupAfterTest() {
  // Clear any active timeouts/intervals
  const lastId = setTimeout(() => {}, 0) as unknown as number;
  for (let i = lastId; i >= 0; i--) {
    clearTimeout(i);
    clearInterval(i);
  }
  
  // Clear any immediate functions
  if (typeof globalThis.setImmediate === 'function') {
    const immediateId = globalThis.setImmediate(() => {});
    globalThis.clearImmediate(immediateId);
  }
  
  // Clear any message channels
  if (typeof MessageChannel !== 'undefined') {
    try {
      const channel = new MessageChannel();
      channel.port1.close();
      channel.port2.close();
    } catch (e) {
      // Ignore errors in non-browser environments
    }
  }
  
  // Clear any Node.js event listeners
  if (typeof process !== 'undefined' && process.listeners) {
    process.removeAllListeners();
  }
  
  // Clear any test framework mocks
  const jestGlobal = (globalThis as any).jest;
  const vitestGlobal = (globalThis as any).vi;
  
  if (jestGlobal && typeof jestGlobal.clearAllMocks === 'function') {
    jestGlobal.clearAllMocks();
  } else if (vitestGlobal && typeof vitestGlobal.clearAllMocks === 'function') {
    vitestGlobal.clearAllMocks();
    if (typeof vitestGlobal.resetModules === 'function') {
      vitestGlobal.resetModules();
    }
  }
  
  // Force garbage collection
  if (global.gc) {
    global.gc();
  }
  
  // Wait for any pending promises to resolve
  await new Promise(resolve => setImmediate(resolve));
}

// Test helper to wrap tests with memory management
export function withMemoryManagement(
  testFn: () => void | Promise<void>,
  options: { name?: string; checkLeaks?: boolean } = {}
) {
  const { name = 'test', checkLeaks = true } = options;
  
  return async () => {
    const mem = new MemoryManager();
    
    try {
      mem.takeSnapshot(`Before ${name}`);
      
      // Run the test
      await testFn();
      
      // Clean up
      await cleanupAfterTest();
      
      // Take final snapshot
      await mem.collectGarbage();
      mem.takeSnapshot(`After ${name}`);
      
      // Check for memory growth
      if (checkLeaks && mem.isMemoryGrowing(5)) {
        console.warn(`⚠️  Potential memory growth detected in ${name}:`);
        console.log(mem.getSummary());
      }
      
    } catch (error) {
      // Make sure we still clean up on failure
      await cleanupAfterTest();
      throw error;
    }
  };
}

// Example usage:
/*
import { memoryManager, withMemoryManagement } from './test-utils/memoryManagement';

describe('MyComponent', () => {
  // Option 1: Use the withMemoryManagement wrapper
  it('should not leak memory', withMemoryManagement(async () => {
    // Your test code here
  }, { name: 'MyComponent test' }));
  
  // Option 2: Manual memory management
  it('should handle memory correctly', async () => {
    const mem = new MemoryManager();
    
    try {
      mem.takeSnapshot('Before test');
      
      // Your test code here
      
      await mem.collectGarbage();
      mem.takeSnapshot('After test');
      
      // Check for memory growth
      if (mem.isMemoryGrowing(5)) {
        console.warn('⚠️  Potential memory growth detected');
        console.log(mem.getSummary());
      }
      
    } finally {
      await cleanupAfterTest();
    }
  });
  
  // Option 3: Automated leak detection
  it('should not have memory leaks', async () => {
    // Set up your test scenario
    const setup = () => {
      // Create objects, event listeners, etc.
    };
    
    const testFn = () => {
      // Run the code you want to test
      setup();
      // ... test code ...
    };
    
    // Check for leaks
    const { leaked, details } = await memoryManager.detectLeaks(testFn, {
      maxGrowthMB: 0.5, // MB
      warmupIterations: 3,
      testIterations: 5,
      betweenIterations: async () => {
        // Clean up between iterations
        await cleanupAfterTest();
      },
      verbose: true
    });
    
    console.log(details);
    expect(leaked).toBe(false);
  });
});
*/
