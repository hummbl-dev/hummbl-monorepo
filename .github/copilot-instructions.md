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
