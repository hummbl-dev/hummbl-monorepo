import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@hummbl/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
    },
  },
});
