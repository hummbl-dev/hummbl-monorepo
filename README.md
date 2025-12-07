# HUMMBL Monorepo

[![CI](https://github.com/hummbl-dev/hummbl-monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/hummbl-dev/hummbl-monorepo/actions/workflows/ci.yml)
[![PR Checks](https://github.com/hummbl-dev/hummbl-monorepo/actions/workflows/pr.yml/badge.svg)](https://github.com/hummbl-dev/hummbl-monorepo/actions/workflows/pr.yml)

**Sovereign Intelligence Stack** - A pnpm monorepo for HUMMBL projects and packages.

## Structure

```
hummbl-monorepo/
├── apps/
│   ├── mcp-server/      # Model Context Protocol server with Base120 mental models
│   ├── web/             # Vite + React web application
│   └── workers/         # Cloudflare Workers (D1, KV, R2, Queues)
├── packages/
│   └── core/            # Shared core types and utilities
├── docs/
│   ├── bugs/            # Bug reports and incident documentation
│   ├── examples/        # Training examples and best practices
│   ├── protocols/       # Validation protocols and standards
│   ├── proposals/       # Improvement proposals and RFCs
│   └── reference/       # Reference documentation and quick guides
├── tests/               # Test suites and reproduction scenarios
└── .github/
    └── workflows/       # CI/CD workflows
```

## HUMMBL Base120 Framework

**6 Transformations, 120 Mental Models** for systematic problem-solving:

| Code   | Transformation | Description                                               | Models |
| ------ | -------------- | --------------------------------------------------------- | ------ |
| **P**  | Perspective    | Frame and name what is. Anchor or shift point of view.    | 20     |
| **IN** | Inversion      | Reverse assumptions. Examine opposites, edges, negations. | 20     |
| **CO** | Composition    | Combine parts into coherent wholes.                       | 20     |
| **DE** | Decomposition  | Break systems into components.                            | 20     |
| **RE** | Recursion      | Apply operations iteratively, outputs→inputs.             | 20     |
| **SY** | Meta-Systems   | Systems of systems, coordination, emergence.              | 20     |

> **⚠️ Important**: Always validate transformation references using the MCP server's `get_transformation` tool.  
> See [Transformation Validation Protocol](docs/protocols/transformation-validation.md) for details.

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

## MCP Server Tools

The HUMMBL MCP server provides mental model access via Model Context Protocol:

### Available Tools

1. **`search_models`** - Search Base120 framework for mental models

   ```typescript
   search_models({ query: 'feedback', transformation: 'RE' });
   ```

2. **`get_model_details`** - Get full definition + system prompt for a model

   ```typescript
   get_model_details({ id: 'RE8' }); // Returns Bootstrapping model
   ```

3. **`get_transformation`** - Validate transformation definitions (⚠️ Use this first!)
   ```typescript
   get_transformation({ code: 'RE' }); // Returns: Recursion definition
   ```

### Transformation Validation

**CRITICAL**: Always validate transformation references before use.

```typescript
// ❌ INCORRECT - Fabricating meaning
'RE stands for Reconstruct...'; // WITHOUT validation

// ✅ CORRECT - Validated first
const transform = await get_transformation({ code: 'RE' });
// Returns: "RE = Recursion: Apply operations iteratively, outputs→inputs"
```

See [Transformation Validation Protocol](docs/protocols/transformation-validation.md) for complete guidelines.

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

## Documentation

- **[Transformation Reference](docs/reference/transformations-reference.md)** - Quick reference for all 6 transformations
- **[Validation Protocol](docs/protocols/transformation-validation.md)** - How to validate transformation references
- **[Training Examples](docs/examples/transformation-validation-examples.md)** - Correct/incorrect patterns
- **[Bug Reports](docs/bugs/)** - Incident documentation and fixes
- **[Improvement Proposals](docs/proposals/)** - Architecture enhancements

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
