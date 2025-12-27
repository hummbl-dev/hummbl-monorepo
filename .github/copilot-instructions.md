# Copilot Instructions for HUMMBL Monorepo

## Project Overview

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
