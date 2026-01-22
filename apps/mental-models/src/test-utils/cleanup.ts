/**
 * Test cleanup utilities to help prevent memory leaks and clean up resources.
 * Import and use these in your test files' afterEach or afterAll hooks.
 */

import { afterEach, afterAll, vi } from 'vitest';

// Store cleanup callbacks
const cleanupCallbacks: Array<() => Promise<void> | void> = [];

/**
 * Register a cleanup callback to be run after tests complete
 */
export function cleanup(callback: () => Promise<void> | void): void {
  cleanupCallbacks.push(callback);
}

/**
 * Run all registered cleanup callbacks
 */
export async function runCleanup(): Promise<void> {
  while (cleanupCallbacks.length > 0) {
    const callback = cleanupCallbacks.pop();
    if (callback) {
      try {
        await Promise.resolve(callback());
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
  }
}

/**
 * Clear all mocks and timers
 */
export function resetTestingState(): void {
  // Clear all mocks using Vitest's vi
  vi.clearAllMocks();
  
  // Clear all timers
  vi.useRealTimers();
  vi.clearAllTimers();
  
  // Clear any intervals or timeouts that might be hanging around
  const maxSafeInteger = Number.MAX_SAFE_INTEGER || 2147483647;
  let lastId = Number(setTimeout(() => {}, 0));
  
  // Clear timeouts in chunks to avoid blocking the event loop
  while (lastId > 0) {
    clearTimeout(lastId);
    clearInterval(lastId);
    
    // Prevent infinite loops with a reasonable limit
    if (lastId > maxSafeInteger - 1000) {
      console.warn('Reached maximum timeout ID, stopping cleanup');
      break;
    }
    lastId--;
  }
  
  // Clear any immediate timeouts
  if (typeof global !== 'undefined' && 'clearImmediate' in global) {
    const globalAny = global as any;
    if (typeof globalAny.clearImmediate === 'function') {
      globalAny.clearImmediate();
    }
  }
}

/**
 * Force garbage collection (if available)
 */
export function forceGarbageCollection(): void {
  if (typeof global.gc === 'function') {
    global.gc();
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn('Garbage collection is not exposed. Run Node with --expose-gc flag.');
  }
}

/**
 * Reset the module cache to prevent memory leaks between tests
 * @param modulePath The module path to reset (relative to src/)
 */
export function resetModuleCache(modulePath: string): void {
  try {
    const resolvedPath = require.resolve(modulePath, { paths: [process.cwd()] });
    const cache = require.cache;
    if (cache) {
      delete cache[resolvedPath];
    }
  } catch (error) {
    console.warn(`Failed to reset module cache for ${modulePath}:`, error);
  }
}

/**
 * Setup test environment with automatic cleanup
 */
export function setupTestEnvironment() {
  // Run cleanup after each test
  afterEach(async () => {
    resetTestingState();
    await runCleanup();
    forceGarbageCollection();
  });
  
  // Additional cleanup after all tests
  afterAll(async () => {
    // Add any global cleanup here
    await runCleanup();
    forceGarbageCollection();
  });
  
  return {
    cleanup,
    runCleanup,
    resetTestingState,
    forceGarbageCollection,
    resetModuleCache,
  };
}

export default {
  cleanup,
  runCleanup,
  resetTestingState,
  forceGarbageCollection,
  resetModuleCache,
  setupTestEnvironment,
};
