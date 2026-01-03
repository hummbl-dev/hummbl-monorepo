# Copilot Instructions for HUMMBL Monorepo

## Project Overview

**HUMMBL Sovereign Intelligence Stack** - A pnpm workspace implementing the Base120 cognitive framework (6 transformations × 20 mental models = 120 total).

```
apps/
├── mcp-server/     # Model Context Protocol server (stdio, exposes mental model tools)
├── web/            # Vite + React frontend (TanStack Query, Tailwind, React Router)
└── workers/        # Cloudflare Workers REST API (Hono, D1, KV, R2)
packages/
├── core/           # Shared types, Result pattern, Zod schemas, Base120 data
├── ui/             # Shared React components (Radix UI primitives)
├── tsconfig/       # Shared TypeScript configs
└── eslint-config/  # Shared ESLint configs
docs/
├── protocols/      # Validation rules, architectural protocols
├── bugs/           # Documented failure modes (e.g., HUMMBL-TRANSFORM-001)
├── examples/       # Correct/incorrect usage patterns
└── reference/      # Transformation definitions, quick reference
```

**Package Manager**: `pnpm@9.14.4` with workspace protocol (`workspace:*`)  
**Build System**: Turbo (caching, task orchestration)  
**Node Version**: ≥18

## Critical Workflows

```bash
# Installation
pnpm install                        # Install all workspace dependencies

# Development (choose one)
pnpm dev                            # All apps in parallel
pnpm --filter @hummbl/web dev       # Single app (web, mcp-server, workers)
pnpm --filter @hummbl/workers dev   # Cloudflare Workers local dev

# Validation (run before commits)
pnpm validate                       # Runs: lint + type-check + test + build

# Individual checks
pnpm build                          # Build all apps/packages
pnpm test                           # Run vitest across workspace
pnpm lint                           # ESLint (delegated to workspace configs)
pnpm type-check                     # TypeScript noEmit check

# Debugging & Monitoring
pnpm health-check                   # Check system health metrics
pnpm benchmark                      # Run performance benchmarks
pnpm test:coverage                  # Generate coverage reports
```

## Base120 Framework Rules

### ⚠️ MANDATORY: Transformation Validation

**NEVER** reference transformation names without validation. The MCP server is the authoritative source.

```typescript
// ❌ INCORRECT - Fabrication risk
'Next step is RE (Reconstruct)...'; // RE ≠ Reconstruct!

// ✅ CORRECT - Always validate first
const transform = await get_transformation({ code: 'RE' });
// Returns: { code: 'RE', name: 'Recursion', description: 'Apply iteratively' }
```

**The 6 Transformations** (validate via `get_transformation`):

- **P**: Perspective - Frame, name, shift POV
- **IN**: Inversion - Reverse assumptions, work backward
- **CO**: Composition - Combine parts into wholes
- **DE**: Decomposition - Break into components
- **RE**: Recursion - Iterative patterns, self-reference
- **SY**: Meta-Systems - Systems of systems, emergence

**Reference**: [docs/protocols/transformation-validation.md](../docs/protocols/transformation-validation.md)  
**Failure Mode**: [docs/bugs/HUMMBL-TRANSFORM-001.md](../docs/bugs/HUMMBL-TRANSFORM-001.md)

### MCP Server Tools

```typescript
// Search models across 120-model framework
search_models({ query: 'feedback loops', transformation: 'SY' });

// Get complete model definition + system prompt
get_model_details({ id: 'RE8' }); // Returns Bootstrapping model

// Validate transformation before use (USE THIS FIRST!)
get_transformation({ code: 'DE' });
```

## Base120 Governance Rules

**Invariant:**

> This repo validates artifacts about Base120 — not Base120 itself.

### Version Status

- **Base120 v1.0.0 is frozen** — no behavior, schema, or failure mode changes permitted
- Frozen semantics apply to the **entire repository**
- Default assumption: if uncertain whether a change is allowed → **assume forbidden**

### Allowed vs Forbidden

| Allowed                                            | Forbidden                 |
| -------------------------------------------------- | ------------------------- |
| Documentation clarifications (no semantic changes) | Retroactive spec rewrites |
| Sealed canonical artifacts (hash + MRCC)           | Validator logic changes   |
| Tests that do not alter behavior                   | Schema modifications      |

### On Ambiguity

**STOP. Surface the ambiguity. Ask for governance intent.**

Do not resolve by assumption. Do not apply "helpful" fixes without approval.

**Full Protocol**: [docs/protocols/base120-agent-onboarding.md](../docs/protocols/base120-agent-onboarding.md)  
**Quick Reference**: [docs/AGENTS.md](../docs/AGENTS.md)  
**Agent Policy**: [.github/agent-policy.yaml](agent-policy.yaml)

## Architecture Patterns

### Result Pattern (Error Handling)

All functions in `@hummbl/core` return `Result<T, E>` instead of throwing:

```typescript
import { Result, isOk } from '@hummbl/core';

// Creating results
const success = Result.ok({ data: 'value' });
const failure = Result.err(new Error('failed'));

// From promises
const result = await Result.fromPromise(
  fetch('/api/models'),
  error => new Error(`API failed: ${error}`)
);

// Checking results
if (isOk(result)) {
  console.log(result.value); // Type-safe access
} else {
  console.error(result.error);
}
```

**Location**: [packages/core/src/result.ts](../packages/core/src/result.ts)

### Workspace Dependencies

Use `workspace:*` protocol for internal packages:

```json
{
  "dependencies": {
    "@hummbl/core": "workspace:*", // ← Always use this
    "@hummbl/ui": "workspace:*"
  }
}
```

**Packages**: `@hummbl/core`, `@hummbl/ui`, `@hummbl/tsconfig`, `@hummbl/eslint-config`

### Testing Strategy

**Framework**: Vitest (configured per workspace)  
**Pattern**: Co-locate tests with source (`*.test.ts`)

```typescript
// Example: apps/workers/src/lib/cache.test.ts
import { describe, expect, it, vi } from 'vitest';
import { Result } from '@hummbl/core';

describe('getCachedResult', () => {
  it('returns cached value when available', async () => {
    // Test uses Result pattern for assertions
    const result = await getCachedResult(env, 'key');
    expect(isOk(result)).toBe(true);
  });
});
```

**Run tests**: `pnpm test` (workspace root) or `pnpm --filter @hummbl/workers test`

## Cloudflare Workers Specifics

**Framework**: Hono (lightweight router)  
**Bindings**: D1 (SQL), KV (cache), R2 (storage)  
**Config**: `wrangler.toml`

```typescript
// apps/workers/src/index.ts structure
import { Hono } from 'hono';
import type { Env } from './env';

const app = new Hono<{ Bindings: Env }>();

// Routes modularized in src/routes/
app.route('/v1/models', modelsRouter);
app.route('/v1/transformations', transformationsRouter);
```

**Local dev**: `pnpm --filter @hummbl/workers dev` (uses Wrangler)  
**Deploy**: `pnpm --filter @hummbl/workers deploy` (production) or `deploy:staging`  
**Secrets**: Use `wrangler secret put SECRET_NAME` (never commit secrets)

### D1 Database Conventions

```typescript
// Query pattern in workers
const result = await env.DB.prepare('SELECT * FROM models WHERE code = ?')
  .bind(code)
  .first<Model>();
```

**Migrations**: `apps/workers/migrations/*.sql`  
**Seeds**: `apps/workers/seeds/*.sql`

## Web App Architecture

**Framework**: React 19 + Vite  
**Routing**: React Router v7  
**Data Fetching**: TanStack Query  
**Styling**: Tailwind CSS v4 + Radix UI primitives  
**Fonts**: Inter (sans), JetBrains Mono (code)

```typescript
// Path aliases (vite.config.ts)
import { Button } from '@/components/ui/button'; // @ = src/
import { Model } from '@hummbl/core'; // Direct to packages/core/src/
```

**Build optimization**: Manual chunking for vendor libs (see [apps/web/vite.config.ts](../apps/web/vite.config.ts))

## Documentation as Code

HUMMBL uses **AI-Native Documentation** to prevent hallucination:

1. **Single Source of Truth**: Code (e.g., `TRANSFORMATIONS` constant in MCP server)
2. **Validation Required**: Must call tools/functions before asserting facts
3. **Documented Failures**: All bugs tracked in `docs/bugs/` with reproduction steps
4. **Protocols First**: Check `docs/protocols/` before implementing

**Example**: Before claiming "RE means Reconstruct", validate via `get_transformation('RE')` → returns "Recursion"

**Standard**: [ai-native-docs-template/README.md](../ai-native-docs-template/README.md)

## Common Pitfalls

1. **Transformation Fabrication**: Always validate transformation codes first (see HUMMBL-TRANSFORM-001)
2. **Missing `workspace:*`**: Use workspace protocol for `@hummbl/*` packages
3. **Direct Throws**: Use `Result` pattern instead of `throw` in `@hummbl/core` code
4. **Turbo Cache Issues**: Run `pnpm clean` if builds behave unexpectedly
5. **Type Errors from Core**: Rebuild core first: `pnpm --filter @hummbl/core build`

## Next Steps for AI Agents

- **Validate transformations**: Use `get_transformation` before any RE/DE/CO/etc references
- **Read protocols**: Check `docs/protocols/` for validation rules
- **Follow Result pattern**: Return `Result<T, E>` in shared code
- **Use workspace deps**: Always `workspace:*` for internal packages
- **Document bugs**: New failure modes go in `docs/bugs/`

---

**Questions?** Check [README.md](../README.md) or ask for clarification. When uncertain about transformations, always validate rather than guess.
- **Monorepo** managed with `pnpm` and Turbo, containing:
  - `apps/`: Main applications (`mcp-server`, `web`, `workers`)
  - `packages/`: Shared libraries (e.g., `core`)
  - `docs/`: Protocols, examples, bugs, proposals, and reference docs
- **Base120 Framework**: 6 transformations × 20 models each. Always validate transformation codes using the MCP server's `get_transformation` tool before use.

## Key Workflows

- **Install dependencies:** `pnpm install`
- **Dev mode (all apps):** `pnpm dev`
- **Dev mode (single app):** `pnpm --filter @hummbl/<app> dev`
- **Build all:** `pnpm build`
- **Test all:** `pnpm test`
- **Lint:** `pnpm lint`
- **Type check:** `pnpm type-check`
- **Format:** `pnpm format`
- **Validate (all checks):** `pnpm validate`
- **Clean:** `pnpm clean`

## Conventions & Patterns

- **Validation First:** Never fabricate transformation/model details. Always call `get_transformation` or `get_model_details` before using or describing a model/transform.
- **Docs as Source:** Documentation is executable and validated. See `ai-native-docs-template/README.md` for the AI-native documentation standard.
- **Protocols:** All validation and transformation logic must follow the protocols in `docs/protocols/`.
- **Examples:** Use `docs/examples/` for correct/incorrect usage patterns.
- **Bugs:** Document all failure modes in `docs/bugs/`.
- **Proposals:** Architectural changes go in `docs/proposals/`.

## Integration Points

- **MCP Server:** Exposes tools for model search, details, and transformation validation. See `apps/mcp-server/src/` for implementation.
- **Web App:** Vite + React, see `apps/web/README.md` for ESLint/type-checking config.
- **Workers:** Cloudflare Workers, see `apps/workers/`.

## Examples

- **Validate a transformation:**
  ```typescript
  // Always validate first
  const transform = await get_transformation({ code: 'RE' });
  // Use transform only after validation
  ```
- **Run dev mode for web app:**
  ```bash
  pnpm --filter @hummbl/web dev
  ```

## References

- [Transformation Validation Protocol](../docs/protocols/transformation-validation.md)
- [Transformation Reference](../docs/reference/transformations-reference.md)
- [AI-Native Docs Standard](../ai-native-docs-template/README.md)

---

For unclear or missing conventions, check the main `README.md` or ask for clarification.
