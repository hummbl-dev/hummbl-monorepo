import { reactConfig } from '@hummbl/eslint-config/react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...reactConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
]);
