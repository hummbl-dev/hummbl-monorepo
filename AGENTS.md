# HUMMBL Monorepo - Agent Guidelines

**Version:** 1.0.0  
**Last Updated:** 2026-01-20  
**Codebase:** `/Users/others/Documents/GitHub/hummbl-monorepo` (Primary)  
**Architecture:** Turborepo + pnpm workspaces  
**Status:** Next-generation unified platform

---

## 🏗️ Architecture Overview

### Tech Stack (Non-Negotiable)

- **Monorepo:** Turborepo + pnpm workspaces
- **Frontend:** Vite + React 19 + TypeScript (strict mode)
- **Backend:** Cloudflare Workers (D1, KV, R2, Queues)
- **MCP Server:** Model Context Protocol with Base120 integration
- **Package Manager:** pnpm (required via `packageManager` field)
- **Testing:** Vitest (unit) + comprehensive test suites
- **Build System:** Turbo for orchestrating multiple apps/packages
- **Deployment:** Cloudflare (Workers + Pages)

### Monorepo Structure

```text
hummbl-monorepo/
├── apps/                    # Deployable applications
│   ├── mcp-server/          # MCP server with Base120 mental models
│   ├── web/                 # Primary Vite + React web application
│   ├── workers/              # Cloudflare Workers (D1, KV, R2, Queues)
│   ├── api/                  # Backend API services
│   └── frontend/            # Additional frontend layer
├── packages/                 # Shared packages
│   ├── core/                 # Shared types and utilities
│   ├── eslint-config/         # Shared linting configuration
│   ├── tsconfig/             # TypeScript configurations
│   └── ui/                  # Reusable UI components
├── docs/                    # Documentation
│   ├── bugs/                 # Bug reports and incident documentation
│   ├── examples/              # Training examples and best practices
│   ├── protocols/             # Validation protocols and standards
│   ├── proposals/             # Improvement proposals and RFCs
│   └── reference/            # Reference documentation and quick guides
├── tests/                   # Cross-package test suites
└── .github/workflows/         # CI/CD workflows
```

---

## 📋 TypeScript Strict Mode Rules

### Core Principles

- **Never use `any` type** - Use `unknown` with type guards
- **Explicit interfaces for all objects** - No implicit object types
- **Functional components only** - No class components
- **Named exports only** - No default exports for packages
- **Strict type checking** across all packages

### Required Type Patterns

```typescript
// ✅ Correct: Interface for package exports
interface MentalModel {
  id: string;
  name: string;
  code: string;
  description: string;
  transformation: TransformationType;
  methods: Method[];
  examples: string[];
}

// ✅ Correct: Package exports with types
export interface CorePackage {
  validateModel: (model: unknown) => model is MentalModel;
  transformData: <T, U>(data: T) => U;
}

// ✅ Correct: Result type for error handling
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// ❌ Forbidden: Any type, implicit returns, class components
const BadComponent = (props: any) => {
  return <div>{props.something}</div>; // Type error
};
```

### Core Type Definitions

```typescript
// Located in packages/core/src/types/
interface Base120Model {
  code: string; // e.g., "P4", "IN12"
  name: string; // e.g., "Stakeholder Mapping"
  transformation: 'P' | 'IN' | 'CO' | 'DE' | 'RE' | 'SY';
  description: string;
  methods: Method[];
  examples: Example[];
  relationships: Relationship[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

type TransformationType = 'P' | 'IN' | 'CO' | 'DE' | 'RE' | 'SY';
```

---

## ⚡ Turborepo Best Practices

### Workspace Management

```typescript
// ✅ Correct: Package dependencies within monorepo
{
  "name": "@hummbl/web",
  "dependencies": {
    "@hummbl/core": "workspace:*",
    "@hummbl/ui": "workspace:*"
  }
}

// ✅ Correct: Turbo scripts for orchestration
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "type-check": "turbo type-check"
  }
}
```

### Build Orchestration

- **Use `turbo dev`** for starting all apps in development
- **Use `turbo build`** for building all packages in dependency order
- **Use `turbo test`** for running tests across all packages
- **Use `--filter`** for targeting specific packages/apps

### Package Development

```bash
# Development
pnpm --filter @hummbl/web dev
pnpm --filter @hummbl/mcp-server dev

# Building
pnpm --filter @hummbl/core build
turbo build --filter=@hummbl/web

# Testing
pnpm --filter @hummbl/core test
turbo test --filter=!@hummbl/tests
```

---

## 🚀 Multi-App Development Patterns

### App-Specific Guidelines

**📱 Web App (`apps/web/`)**

- Vite + React 19 + TypeScript
- Shared UI components from `@hummbl/ui`
- Core utilities from `@hummbl/core`
- Responsive design with mobile-first approach

**🤖 MCP Server (`apps/mcp-server/`)**

- Model Context Protocol implementation
- Base120 mental models integration
- Cloudflare Workers deployment
- TypeScript strict mode with validation

**⚡ Workers (`apps/workers/`)**

- Cloudflare Workers (D1, KV, R2, Queues)
- Edge computing patterns
- Serverless functions
- Background job processing

**🔌 API (`apps/api/`)**

- RESTful API design
- Shared types from `@hummbl/core`
- Authentication and authorization
- Rate limiting and caching

### Shared Package Usage

```typescript
// ✅ Correct: Import from shared packages
import { MentalModel, validateModel } from '@hummbl/core';
import { Button, Card } from '@hummbl/ui';
import type { TransformationType } from '@hummbl/core';

// ❌ Forbidden: Relative imports or duplicate code
import { MentalModel } from '../../../core/src/types';
import { Button } from '../shared/ui';
```

---

## 🧪 Testing Strategy

### Multi-Level Testing

```bash
# Unit tests (all packages)
turbo test

# Integration tests (specific apps)
pnpm --filter @hummbl/web test:integration
pnpm --filter @hummbl/mcp-server test:integration

# E2E tests
pnpm test:e2e

# Coverage reporting
pnpm test:coverage

# Performance regression tests
pnpm regression-test
```

### Test Structure

```text
tests/
├── unit/                    # Unit tests for packages
├── integration/             # Cross-package integration tests
├── e2e/                   # End-to-end application tests
├── performance/             # Performance and regression tests
└── fixtures/               # Test data and mock objects
```

### Test Requirements

- **80%+ coverage** for all packages
- **Performance benchmarks** for critical paths
- **Type checking** across all packages
- **Bundle size analysis** for web apps
- **MCP protocol validation** for server

---

## 📊 Performance & Monitoring

### Built-in Monitoring

```bash
# Health checks
pnpm health-check

# Performance benchmarks
pnpm benchmark

# Bundle size analysis
pnpm bundle-size

# Coverage reports
pnpm coverage-report

# Daily progress reports
pnpm report
```

### Performance Standards

- **Bundle size:** < 1MB for web app
- **Load time:** < 2s initial paint
- **API response:** < 500ms for 95th percentile
- **Memory usage:** < 512MB for workers
- **Test coverage:** 80%+ across all packages

### Monitoring Integration

- **Sentry** for error tracking
- **Performance regression** detection
- **Bundle analysis** with size tracking
- **Health check endpoints** for all services
- **Alert system** for critical failures

---

## 🔒 MCP Server Development

### Model Context Protocol Guidelines

```typescript
// ✅ Correct: MCP tool implementation
export const get_transformation = {
  name: 'get_transformation',
  description: 'Get Base120 transformation details',
  inputSchema: {
    type: 'object',
    properties: {
      code: { type: 'string', pattern: '^[A-Z]{1,2}\\d+$' },
    },
  },
};

// ✅ Correct: Validation with Base120 framework
const validateTransformationCode = (code: string): boolean => {
  return (
    /^[A-Z]{1,2}\d+$/.test(code) && ['P', 'IN', 'CO', 'DE', 'RE', 'SY'].includes(code.slice(0, -1))
  );
};
```

### MCP Server Requirements

- **Base120 integration** with all 120 models
- **Transformation validation** using strict patterns
- **Error handling** with proper Result types
- **Performance optimization** for edge deployment
- **Comprehensive testing** of MCP protocol

---

## 🎯 Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Start specific app
pnpm --filter @hummbl/web dev
pnpm --filter @hummbl/mcp-server dev

# Build all packages
pnpm build

# Run all checks
pnpm validate
```

### Git Workflow

- **Feature branches** for all changes
- **Pull requests** with comprehensive checks
- **Automated testing** on all PRs
- **Performance regression** detection
- **Bundle size monitoring** for web apps

### Quality Gates

- **Type checking** across all packages
- **Linting** with shared configuration
- **Testing** with coverage requirements
- **Bundle analysis** for web applications
- **Performance benchmarks** for critical paths

---

## 📝 Documentation Standards

### Documentation Structure

```text
docs/
├── bugs/                    # Incident reports and resolutions
├── examples/                 # Code examples and tutorials
├── protocols/                # Development protocols and standards
├── proposals/                # RFCs and improvement proposals
└── reference/                # Quick reference guides
```

### Documentation Requirements

- **Markdown format** with proper linting
- **Code examples** for all APIs
- **Protocol specifications** for integrations
- **Troubleshooting guides** for common issues
- **Performance guidelines** for optimization

---

## 🚨 Red Flags (Never Do)

- ❌ **Use `any` type** - Always use explicit types
- ❌ **Break workspace boundaries** - Use package dependencies
- ❌ **Ignore Turbo configuration** - Follow monorepo patterns
- ❌ **Skip cross-package testing** - Test integrations
- ❌ **Duplicate shared code** - Use packages/core
- ❌ **Ignore performance budgets** - Monitor bundle sizes
- ❌ **Skip MCP validation** - Validate all protocols
- ❌ **Break Base120 framework** - Follow transformation patterns
- ❌ **Ignore monorepo structure** - Respect workspace boundaries

---

## 🔄 Migration from hummbl-io

### Migration Strategy

1. **Assess features** in `hummbl-io` for migration
2. **Map to monorepo structure** (apps vs packages)
3. **Update dependencies** to use workspace packages
4. **Migrate configurations** to Turbo patterns
5. **Update CI/CD** for multi-app deployment
6. **Update documentation** for monorepo workflows

### Feature Mapping

| hummbl-io Component   | Monorepo Location            |
| --------------------- | ---------------------------- |
| Web frontend          | `apps/web/`                  |
| Chat functionality    | `apps/web/` + `packages/ui/` |
| Mental models service | `packages/core/`             |
| API endpoints         | `apps/api/`                  |
| Worker functions      | `apps/workers/`              |

---

**This document serves as the authoritative guide for all agents working on the HUMMBL monorepo. Follow these rules strictly to maintain code quality, performance, and consistency across the unified platform.**
