// Root ESLint config for monorepo
// This allows lint-staged to work with ESLint v9
// Actual linting is delegated to workspace-specific configs

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
    ],
  },
];
