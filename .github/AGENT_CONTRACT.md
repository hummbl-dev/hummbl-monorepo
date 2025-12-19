# Agent CI Contract

## Golden Command

```bash
pnpm validate  # Mirrors CI: lint + type-check + test + build
```

## Pre-Commit Checklist

1. `pnpm install` (after dependency changes)
2. `pnpm format` (auto-fix formatting)
3. `pnpm validate` (must pass before PR)

## CI Failure Response

- **format:check fails** → Run `pnpm format` and commit
- **tests fail** → Run `pnpm test`, fix, re-run `pnpm validate`
- **lockfile mismatch** → Never edit manually, use pnpm commands

## Environment

- Node 20 + pnpm 9.14.4
- Turbo caching enabled
- All workflows passing ✅

## Workflow Status

- ✅ CI (`ci.yml`) - lint, type-check, test, build, format
- ✅ PR (`pr.yml`) - focused PR validation
- ✅ CodeQL - security scanning
- ✅ Deploy (staging/production)
- ✅ Monitoring - health checks
- ✅ Publish (core/mcp-server) - npm with provenance
