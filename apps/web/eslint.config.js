import { reactConfig } from '@hummbl/eslint-config/react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...reactConfig,
  {
    files: ['**/*.{ts,tsx}'],
  },
]);
