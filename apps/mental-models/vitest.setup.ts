import { afterEach, expect, vi, beforeAll, afterAll } from 'vitest';
import { cleanup as rtlCleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setupTestEnvironment } from './src/test-utils/cleanup';

// Extend Vitest's expect with jest-dom matchers
Object.entries(matchers).forEach(([key, matcher]) => {
  // @ts-ignore - We're extending expect with custom matchers
  expect.extend({ [key]: matcher });
});

// Setup test environment with cleanup
const testUtils = setupTestEnvironment();

// Clean up after each test
// This will also run after tests in CI for more efficient cleanup
afterEach(async () => {
  // Clean up React Testing Library
  rtlCleanup();
  
  // Run any registered cleanup callbacks
  await testUtils.runCleanup?.();
  
  // Reset all mocks
  vi.clearAllMocks();
});

// Global test setup
beforeAll(() => {
  // Add any global test setup here
  console.log('Running test setup...');
  
  // Enable test isolation
  vi.resetModules();
});

// Global test teardown
afterAll(() => {
  // Add any global test teardown here
  console.log('Tests completed. Cleaning up...');
  
  // Clear any remaining mocks and timers
  vi.clearAllMocks();
  vi.clearAllTimers();
  
  // Force garbage collection if available
  if (typeof global.gc === 'function') {
    global.gc();
  }
});

// Log test memory usage in development
if (process.env.NODE_ENV === 'test' && process.env.DEBUG_MEMORY === 'true') {
  const memoryLogInterval = setInterval(() => {
    try {
      const memory = process.memoryUsage();
      console.log('Memory usage (MB):', {
        rss: (memory.rss / 1024 / 1024).toFixed(2),
        heapTotal: (memory.heapTotal / 1024 / 1024).toFixed(2),
        heapUsed: (memory.heapUsed / 1024 / 1024).toFixed(2),
        external: (memory.external / 1024 / 1024).toFixed(2),
      });
    } catch (error) {
      console.error('Error logging memory usage:', error);
      clearInterval(memoryLogInterval);
    }
  }, 30000); // Log every 30 seconds
  
  // Clean up the interval when tests are done
  afterAll(() => {
    clearInterval(memoryLogInterval);
  });
}
