import { baseConfig } from '@hummbl/eslint-config';

export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];

