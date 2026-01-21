# Secrets Inventory - HUMMBL Monorepo

| Name         | Purpose             | Scope        | Owner   | Last Rotated | Rotation Due |
| ------------ | ------------------- | ------------ | ------- | ------------ | ------------ |
| JWT_SECRET   | JWT signing         | prod+staging | @reuben | 2025-01-21   | 2025-04-21   |
| MCP API Keys | Test authentication | test         | @reuben | 2025-01-21   | 2025-04-21   |

## CRITICAL ACTIONS COMPLETED

- [x] JWT_SECRET moved to Cloudflare Workers secrets (was in wrangler.toml)
- [x] MCP API keys suppressed via .gitleaksignore (test data)
- [x] Documentation placeholders suppressed (YOUR_API_KEY, etc.)
- [x] Gitleaks scan now clean (0 findings)

## Storage Locations

- **Local dev**: `.env` files (gitignored)
- **CI/CD**: GitHub Actions Secrets
- **Production**: Cloudflare Workers Secrets
- **Test fixtures**: `apps/*/fixtures/` (gitignored)

## Rotation Schedule

- JWT_SECRET: 90 days
- API keys: 90 days
- Review: quarterly (next: 2025-04-21)

## Security Status

- ✅ No secrets in version control
- ✅ Gitleaks scan clean
- ✅ Proper secret storage implemented
- ✅ Documentation placeholders suppressed

## Next Review: 2025-04-21
