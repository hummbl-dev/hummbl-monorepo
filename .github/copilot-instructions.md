# HUMMBL Monorepo - AI Agent Instructions

## Architecture

**pnpm monorepo** (Turbo build) implementing Base120 cognitive framework (6 transformations × 20 models).

| Directory          | Purpose                                                                              |
| ------------------ | ------------------------------------------------------------------------------------ |
| `apps/mcp-server/` | MCP stdio server exposing `search_models`, `get_model_details`, `get_transformation` |
| `apps/web/`        | React 19 + Vite + TanStack Query + Tailwind v4                                       |
| `apps/workers/`    | Cloudflare Workers (Hono, D1, KV, R2)                                                |
| `packages/core/`   | Result pattern, Zod schemas, shared types                                            |

## ⚠️ CRITICAL: Transformation Validation

**NEVER fabricate transformation meanings.** Always validate first:

```typescript
// ❌ WRONG: "RE means Reconstruct"
// ✅ RIGHT: Call get_transformation({ code: 'RE' }) → Returns "Recursion"
```

Codes: **P** (Perspective), **IN** (Inversion), **CO** (Composition), **DE** (Decomposition), **RE** (Recursion), **SY** (Meta-Systems)

## Governance: Base120 v1.0.0 is FROZEN

- **Allowed**: Doc clarifications (no semantic changes), sealed artifacts with hash+MRCC, non-behavior-altering tests
- **Forbidden**: Validator logic changes, schema modifications, failure mode redefinitions
- **On ambiguity**: STOP and ask — do not resolve by assumption

See [docs/AGENTS.md](../docs/AGENTS.md) and [.github/agent-policy.yaml](agent-policy.yaml).

## Key Commands

```bash
pnpm validate              # Run all checks before commits (lint + type-check + test + build)
pnpm --filter @hummbl/web dev  # Dev single app
pnpm clean                 # Fix Turbo cache issues
```

## Code Patterns

**Result pattern** (never throw in `@hummbl/core`):

```typescript
import { Result, isOk } from '@hummbl/core';
const result = await Result.fromPromise(asyncOp(), e => new Error(`Failed: ${e}`));
if (isOk(result)) {
  /* result.value */
}
```

**Workspace deps**: Always use `"@hummbl/core": "workspace:*"` in package.json.

**Tests**: Co-locate as `*.test.ts`, use Vitest.

## Common Fixes

- **Type errors from core**: Run `pnpm --filter @hummbl/core build` first
- **Build issues**: Run `pnpm clean` then `pnpm install`
- **Transformation bugs**: See [docs/bugs/HUMMBL-TRANSFORM-001.md](../docs/bugs/HUMMBL-TRANSFORM-001.md)
