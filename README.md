# HUMMBL Monorepo

[![CI](https://github.com/hummbl-dev/hummbl-monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/hummbl-dev/hummbl-monorepo/actions/workflows/ci.yml)
[![PR Checks](https://github.com/hummbl-dev/hummbl-monorepo/actions/workflows/pr.yml/badge.svg)](https://github.com/hummbl-dev/hummbl-monorepo/actions/workflows/pr.yml)

**Sovereign Intelligence Stack** - A pnpm monorepo for HUMMBL projects and packages.

## Structure

```
hummbl-monorepo/
├── apps/
│   ├── mcp-server/      # Model Context Protocol server
│   ├── web/             # Next.js web application
│   └── workers/         # Cloudflare Workers
├── packages/
│   └── core/            # Shared core types and utilities
└── .github/
    └── workflows/       # CI/CD workflows
```

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **pnpm**: v9.14.4 (recommended)

### Installation

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm@9.14.4

# Install dependencies
pnpm install
```

## Development

### Run All Apps in Dev Mode

```bash
pnpm dev
```

### Run a Specific App

```bash
# MCP Server
pnpm --filter @hummbl/mcp-server dev

# Web App
pnpm --filter @hummbl/web dev

# Workers
pnpm --filter @hummbl/workers dev
```

### Build All Packages

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```

## Available Scripts

All scripts use Turbo for fast, cached builds:

- `pnpm dev` - Start development mode across all apps
- `pnpm build` - Build all packages and apps
- `pnpm test` - Run tests across all workspaces
- `pnpm lint` - Lint all code with ESLint
- `pnpm type-check` - Type check all TypeScript code
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm validate` - Run lint, type-check, test, and build
- `pnpm clean` - Clean all build artifacts and node_modules

## Workspace Commands

Work with specific packages using pnpm filters:

```bash
# Install a dependency in a specific package
pnpm --filter @hummbl/web add react

# Run a script in a specific package
pnpm --filter @hummbl/core build

# Run a script in all packages
pnpm -r build
```

## Adding a New Package

1. Create a new directory in `packages/`
2. Add a `package.json`:

```json
{
  "name": "@hummbl/your-package",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

3. The workspace will automatically detect it

## Adding a New App

1. Create a new directory in `apps/`
2. Add a `package.json` with a unique name
3. Reference shared packages:

```json
{
  "dependencies": {
    "@hummbl/core": "workspace:*"
  }
}
```

## Tooling

- **pnpm** - Fast, disk space efficient package manager
- **Turbo** - High-performance build system with caching
- **TypeScript** - Type-safe JavaScript
- **ESLint** - Code linting (ESLint v9 flat config)
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Format staged files before commit

## CI/CD

GitHub Actions workflows automatically:

- ✅ Lint code
- ✅ Type check
- ✅ Run tests
- ✅ Build all packages
- 📦 Publish packages to npm with provenance

## Contributing

1. Clone the repository
2. Run `pnpm install`
3. Create a feature branch
4. Make your changes
5. Run `pnpm validate` to ensure all checks pass
6. Commit and push (pre-commit hooks will auto-format)
7. Open a pull request

## License

UNLICENSED
