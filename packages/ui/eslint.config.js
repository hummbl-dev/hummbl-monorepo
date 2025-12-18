import { reactConfig } from '@hummbl/eslint-config/react';

export default [
  ...reactConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
  },
];
