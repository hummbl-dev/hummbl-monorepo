# Repository Health Checklist

Use this checklist for regular repository health checks. Run weekly or before major releases.

## Quick Health Check (5 minutes)

### Build & Validation
- [ ] `pnpm validate` passes (lint, type-check, test, build)
- [ ] All GitHub Actions workflows are green
- [ ] No merge conflicts in main branch
- [ ] Dependencies are up to date

### Security
- [ ] CodeQL scan shows no critical issues
- [ ] Dependabot alerts addressed
- [ ] No secrets committed
- [ ] Security policy is current

### Documentation
- [ ] README is accurate and up to date
- [ ] CHANGELOG reflects recent changes
- [ ] API documentation matches implementation
- [ ] Audit reports reviewed if older than 3 months

## Monthly Health Check (30 minutes)

### Code Quality
- [ ] Test coverage is ≥70% (current: 11.8%)
- [ ] No duplicate dependencies
- [ ] TypeScript strict mode enabled
- [ ] ESLint warnings addressed
- [ ] No 'any' types without justification

### Testing
- [ ] All test suites passing
- [ ] New features have tests
- [ ] E2E tests cover critical flows
- [ ] No flaky tests

### Performance
- [ ] Bundle sizes within budget
- [ ] Page load times acceptable
- [ ] API response times < 200ms
- [ ] No memory leaks detected

### Monitoring & Observability
- [ ] Health check endpoints responding
- [ ] Monitoring workflow enabled
- [ ] Error tracking configured
- [ ] Logs are structured and searchable

### Dependencies
- [ ] Run `pnpm audit` and fix vulnerabilities
- [ ] Update outdated packages
- [ ] Review new security advisories
- [ ] Remove unused dependencies

## Quarterly Health Check (2 hours)

### Architecture Review
- [ ] Review Architecture Decision Records
- [ ] Validate workspace structure
- [ ] Check for circular dependencies
- [ ] Review service boundaries

### Security Deep Dive
- [ ] Review CODEOWNERS
- [ ] Update security policy
- [ ] Test authentication flows
- [ ] Review rate limiting configuration
- [ ] Verify CORS settings

### Documentation Audit
- [ ] Update architecture diagrams
- [ ] Review API documentation
- [ ] Update contributing guidelines
- [ ] Check for broken links
- [ ] Verify examples work

### Performance Audit
- [ ] Run performance benchmarks
- [ ] Check bundle size trends
- [ ] Profile slow endpoints
- [ ] Review caching strategies
- [ ] Test under load

### Governance
- [ ] Review agent policy
- [ ] Update team CODEOWNERS
- [ ] Check branch protection rules
- [ ] Review PR template
- [ ] Validate CI/CD pipeline

## Red Flags 🚩

Stop and investigate immediately if you see:

- ❌ Build failures on main branch
- ❌ Critical security vulnerabilities
- ❌ Test coverage below 50%
- ❌ Multiple disabled tests
- ❌ Secrets in commit history
- ❌ Monitoring completely disabled
- ❌ No commits in 30+ days (if active project)
- ❌ Unresolved merge conflicts
- ❌ Multiple TypeScript 'any' types
- ❌ Hardcoded credentials

## Metrics to Track

### Current Baseline (Jan 3, 2026)
```
Overall Score: 78/100 (B+)
Test Coverage: 11.8%
Source Files: 68
Test Files: 8
Console.log: 37
Documentation: 86 files
LOC: ~6,600
```

### Target (End of Q1 2026)
```
Overall Score: 90/100 (A)
Test Coverage: 70%+
Source Files: ~80-100
Test Files: 60+
Console.log: 0
Documentation: 100+ files
LOC: ~8,000-10,000
```

## Commands Reference

```bash
# Full validation
pnpm validate

# Individual checks
pnpm lint
pnpm type-check
pnpm test
pnpm build

# Security
pnpm audit
pnpm audit --fix

# Clean build
pnpm clean
pnpm install
pnpm build

# Check for outdated packages
pnpm outdated

# Update packages
pnpm update --latest
```

## Resources

- [Comprehensive Audit Report](./COMPREHENSIVE_AUDIT_REPORT.md)
- [Executive Summary](./AUDIT_EXECUTIVE_SUMMARY.md)
- [Action Items](./ACTION_ITEMS.md)
- [Day 2 Audit](./DAY2_AUDIT.md)
- [Security Policy](./SECURITY.md)

---

**Last Updated:** January 3, 2026  
**Next Review:** February 3, 2026
