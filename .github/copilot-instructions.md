<<<<<<< HEAD
<<<<<<< HEAD

# Copilot Instructions for HUMMBL Monorepo

## Project Architecture

- **Monorepo** managed with `pnpm` and Turbo. Major folders:
  - `apps/`: Main applications (`mcp-server`, `web`, `workers`)
  - `packages/`: Shared libraries (e.g., `core`, `ui`)
  - `docs/`: Protocols, examples, bugs, proposals, reference
- **Base120 Framework**: 6 transformations × 20 models each. **Never assert transformation/model details without validation.**

## Critical Workflows

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

## HUMMBL Validation Protocols

- **MANDATORY:** Always call `get_transformation` or `get_model_details` before referencing transformation/model names or definitions. Never infer or fabricate.
- **Authoritative Source:** MCP server (`apps/mcp-server/src/`) and [docs/reference/transformations-reference.md](../docs/reference/transformations-reference.md) are the only sources of truth.
- **Protocols:** All validation logic must follow [docs/protocols/transformation-validation.md](../docs/protocols/transformation-validation.md).
- **Examples:** See [docs/examples/transformation-validation-examples.md](../docs/examples/transformation-validation-examples.md) for correct/incorrect agent patterns.
- **Bugs:** All knowledge integrity failures must be documented in [docs/bugs/](../docs/bugs/).

### Example: Transformation Validation

```typescript
// ❌ INCORRECT (fabricated):
'RE stands for Reconstruct';

// ✅ CORRECT (validated):
const transform = await get_transformation({ code: 'RE' });
// Use transform.name and transform.description from response
```

### Example: Multi-step Reasoning

```typescript
// When selecting next transformation after DE:
const co = await get_transformation({ code: 'CO' });
const re = await get_transformation({ code: 'RE' });
// Decide based on validated definitions
```

## Integration Points

- **MCP Server:** Provides tools for model search, details, and transformation validation. See [apps/mcp-server/src/index.ts](../apps/mcp-server/src/index.ts).
- **Web App:** Vite + React. See [apps/web/README.md](../apps/web/README.md) for ESLint/type-checking config.
- **Workers:** Cloudflare Workers API. See [apps/workers/README.md](../apps/workers/README.md) for cache/data flow and error handling patterns.
- **Core Library:** Shared types, result pattern, and validation logic. See [packages/core/README.md](../packages/core/README.md).

## Project-Specific Patterns

- **Result Pattern:** All handlers return `Result<T, ApiError>` (see `@hummbl/core`). Always handle both `ok: true` and `ok: false` branches.
- **Validation-Driven Docs:** All documentation is executable and validated. See [ai-native-docs-template/README.md](../ai-native-docs-template/README.md).
- **Cache Cascade:** Workers use memory → Workers Cache → KV, with tiered TTLs (see [apps/workers/README.md](../apps/workers/README.md)).
- **Database Schema:** See D1 schema in [apps/workers/README.md](../apps/workers/README.md).

## References

- [Transformation Validation Protocol](../docs/protocols/transformation-validation.md)
- [Transformation Reference](../docs/reference/transformations-reference.md)
- [Agent Training Examples](../docs/examples/transformation-validation-examples.md)
- [AI-Native Docs Standard](../ai-native-docs-template/README.md)

---

# For unclear or missing conventions, check the main [README.md](../README.md) or ask for clarification.

=======

> > > > > > > 3d3cbbff4bea511361276a7e17dff0380b19ab1b

# HUMMBL Monorepo — AI Agent Guide

Short, actionable rules for this pnpm + Turbo monorepo implementing Base120 (6 transformations × 20 models). Keep outputs concise and aligned with frozen governance.

## Architecture & Boundaries

- Apps: [apps/mcp-server](../apps/mcp-server) (MCP stdio: `search_models`, `get_model_details`, `get_transformation`); [apps/web](../apps/web) (React 19 + Vite + TanStack Query + Tailwind v4); [apps/workers](../apps/workers) (Cloudflare Workers: Hono, D1, KV, R2).
- Packages: [packages/core](../packages/core) (Result pattern, Zod schemas, shared types); [packages/ui](../packages/ui) shared UI.
- Registries/Schemas: [registries/failure-modes.json](../registries/failure-modes.json) (FM1–FM30, frozen), [schemas/v1.0.0](../schemas/v1.0.0) (frozen), [artifacts](../artifacts) (sealed, SHA-256 + MRCC).

## Governance (Frozen)

- Base120 v1.0.0 is frozen. Allowed: doc clarifications, sealed artifacts, non-behavior tests. Forbidden: validator logic changes, schema mods, failure mode edits. On ambiguity: STOP and ask. Sources: [docs/AGENTS.md](../docs/AGENTS.md), [.github/agent-policy.yaml](agent-policy.yaml).

## Transformation Validation

- Never invent meanings. Always call MCP first:

```ts
const t = await get_transformation({ code: 'RE' }); // Recursion
```

- Codes: P, IN, CO, DE, RE, SY. See [docs/bugs/HUMMBL-TRANSFORM-001.md](../docs/bugs/HUMMBL-TRANSFORM-001.md).

## Toolchain & Workflows

- Node 20, pnpm 9.14.4. Use `pnpm fetch` + `pnpm install --frozen-lockfile --prefer-offline` when scripting CI.
- Pre-commit: `pnpm validate` (lint → type-check → test → build via Turbo).
- Dev web: `pnpm --filter @hummbl/web dev`; MCP: `pnpm --filter @hummbl/mcp-server dev`; Workers: `pnpm --filter @hummbl/workers dev` (wrangler).
- If core types fail: `pnpm --filter @hummbl/core build`. Cache issues: `pnpm clean && pnpm install`.

## Testing

- PR checks use `pnpm test:ci` → `turbo run test --filter=!@hummbl/web -- --reporter=dot` (web tests temporarily skipped due to jsdom/ESM issue). Do not re-enable without fixing `apps/web` Vitest env.
- Tests co-locate as `*.test.ts`; use Vitest. Coverage lives in `tests/` (see [tests/vitest.config.js](../tests/vitest.config.js)).

## Patterns & Conventions

- Result pattern in core (no throws):

```ts
import { Result, isOk } from '@hummbl/core';
const res = await Result.fromPromise(asyncOp(), e => new Error(`Failed: ${e}`));
if (isOk(res)) {
  /* res.value */
}
```

- Workspace deps: declare `"@hummbl/core": "workspace:*"`. Keep package versions as workspace references.
- Artifacts: only under [artifacts](../artifacts); must be normalized, hashed (SHA-256), MRCC-bound. Validator does not validate canonical artifacts.

- Workspace deps: declare `"@hummbl/core": "workspace:*"`. Keep package versions as workspace references.
- Artifacts: only under [artifacts](../artifacts); must be normalized, hashed (SHA-256), MRCC-bound. Validator does not validate canonical artifacts.

## Integration Points

- Use MCP commands for Base120 data; never hardcode failure modes or transformation semantics.
- Workers/Web boundary: Workers expose REST (Hono) on Cloudflare (D1/KV/R2); Web consumes via TanStack Query. Do not couple to validator internals.
- Failure modes are read-only: [registries/failure-modes.json](../registries/failure-modes.json).

## Do / Don’t

- Do run `pnpm validate` before commits; prefer Result flows in core; check transformation via MCP.
- Don’t touch frozen schemas/validator logic/failure modes; don’t bypass MCP for transformations; don’t re-enable web tests in PR checks until jsdom/ESM is fixed.
  <<<<<<< HEAD
  > > > > > > > # 3d3cbbff4bea511361276a7e17dff0380b19ab1b
  > > > > > > >
  > > > > > > > 3d3cbbff4bea511361276a7e17dff0380b19ab1b
