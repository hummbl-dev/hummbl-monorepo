#!/bin/bash

# create-issues.sh
# Creates GitHub issues for HUMMBL DevOps Phase 2 roadmap
# Prerequisites: GitHub CLI (gh) installed and authenticated
# Usage: ./scripts/create-issues.sh

set -e

REPO="hummbl-dev/hummbl-io"

echo "Creating GitHub Issues for HUMMBL DevOps Phase 2..."
echo "Target Repository: $REPO"
echo ""

# Issue #1: Sentry Integration
echo "Creating Issue #1: Integrate Sentry for Error Tracking..."
gh issue create \
  --repo "$REPO" \
  --title "Integrate Sentry for Error Tracking" \
  --label "enhancement,monitoring,priority-high" \
  --body "## Description
Add Sentry integration to capture and monitor runtime errors in production.

## Tasks
- [ ] Create free Sentry account at sentry.io
- [ ] Create new project for hummbl-io
- [ ] Add \`SENTRY_DSN\` to GitHub Secrets
- [ ] Install \`@sentry/react\` package
- [ ] Configure Sentry in \`src/index.tsx\`
- [ ] Add error boundaries to key components
- [ ] Test error capture in development
- [ ] Configure alert thresholds in Sentry dashboard
- [ ] Document Sentry setup in \`CONTRIBUTING.md\`

## Acceptance Criteria
- ✅ Sentry captures uncaught exceptions
- ✅ Error alerts sent to team email/Slack
- ✅ Source maps uploaded for readable stack traces
- ✅ Production errors visible in Sentry dashboard

## Estimated Time
2 hours

## References
- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- Related: \`next_steps.md\` - Item #1"

echo ""

# Issue #2: Rollback Procedure
echo "Creating Issue #2: Document Rollback Procedure..."
gh issue create \
  --repo "$REPO" \
  --title "Document Rollback Procedure" \
  --label "documentation,priority-high,incident-response" \
  --body "## Description
Create emergency rollback documentation for failed deployments.

## Tasks
- [ ] Create \`.github/ROLLBACK.md\`
- [ ] Document Vercel dashboard rollback steps
- [ ] Document Git-based rollback (\`git revert\`)
- [ ] Add manual GitHub Action trigger for rollback
- [ ] Include rollback checklist
- [ ] Add communication template for incidents
- [ ] Link from \`CONTRIBUTING.md\`
- [ ] Test rollback procedure in staging

## Acceptance Criteria
- ✅ Clear step-by-step rollback instructions
- ✅ Includes both Vercel and Git methods
- ✅ Rollback tested and validated
- ✅ Linked from main documentation

## Estimated Time
1 hour

## References
- Related: \`next_steps.md\` - Item #2"

echo ""

# Issue #3: Post-Deploy Smoke Tests
echo "Creating Issue #3: Enhance Post-Deploy Smoke Tests..."
gh issue create \
  --repo "$REPO" \
  --title "Enhance Post-Deploy Smoke Tests" \
  --label "testing,ci-cd,priority-medium" \
  --body "## Description
Add automated validation checks to post-deploy workflow.

## Tasks
- [ ] Extend \`post-deploy-verification.yml\`
- [ ] Add curl test for homepage (\`/\`)
- [ ] Add curl test for \`/models.json\`
- [ ] Add curl test for \`/data/narratives.json\`
- [ ] Verify HTTP 200 responses
- [ ] Check for expected content (optional: Playwright)
- [ ] Add JSON validation for data files
- [ ] Configure failure notifications
- [ ] Test smoke tests in development

## Acceptance Criteria
- ✅ All critical endpoints tested post-deploy
- ✅ Tests fail fast on broken deployments
- ✅ Clear error messages when tests fail
- ✅ Notifications sent on failure

## Estimated Time
2 hours

## References
- Related: \`next_steps.md\` - Item #3"

echo ""

# Issue #4: Structured Logging
echo "Creating Issue #4: Implement Structured Logging..."
gh issue create \
  --repo "$REPO" \
  --title "Implement Structured Logging" \
  --label "enhancement,observability,priority-medium" \
  --body "## Description
Add consistent, contextual logging throughout the application.

## Tasks
- [ ] Create \`src/utils/logger.ts\` utility
- [ ] Define log schema: \`{ level, timestamp, context, message, data }\`
- [ ] Add logging to error scenarios
- [ ] Add logging to data fetch operations
- [ ] Include request correlation IDs
- [ ] Add log levels (DEBUG, INFO, WARN, ERROR)
- [ ] Document logging conventions in \`CONTRIBUTING.md\`
- [ ] Consider integration with log aggregation service

## Acceptance Criteria
- ✅ Consistent log format across application
- ✅ Key operations logged with context
- ✅ Errors include stack traces and metadata
- ✅ Easy to search and filter logs

## Estimated Time
2 hours

## Code Example
\`\`\`typescript
logger.error('Failed to load mental models', error, {
  url: '/models.json',
  userAgent: navigator.userAgent,
  timestamp: Date.now()
});
\`\`\`

## References
- Related: \`next_steps.md\` - Item #4"

echo ""

# Issue #5: Status Page Integration
echo "Creating Issue #5: Add Status Page Integration..."
gh issue create \
  --repo "$REPO" \
  --title "Add Status Page Integration" \
  --label "documentation,monitoring,priority-low" \
  --body "## Description
Provide external visibility into system health and uptime.

## Tasks
- [ ] Choose status monitoring service (UptimeRobot, Better Uptime, or Vercel status)
- [ ] Configure uptime checks for main endpoints
- [ ] Add status badge to \`README.md\`
- [ ] Link status page in \`CONTRIBUTING.md\`
- [ ] Set up uptime notifications
- [ ] Document status page in docs

## Acceptance Criteria
- ✅ Status badge visible in README
- ✅ External status page accessible
- ✅ Uptime alerts configured
- ✅ Historical uptime data visible

## Estimated Time
1 hour

## References
- [UptimeRobot](https://uptimerobot.com/) (Free tier)
- [Better Uptime](https://betteruptime.com/) (Free tier)
- Related: \`next_steps.md\` - Item #5"

echo ""

# Issue #6: Architecture Decision Records
echo "Creating Issue #6: Establish Architecture Decision Records..."
gh issue create \
  --repo "$REPO" \
  --title "Establish Architecture Decision Records (ADRs)" \
  --label "documentation,architecture,priority-low" \
  --body "## Description
Create ADR system to document architectural decisions and rationale.

## Tasks
- [ ] Create \`/docs/adr/\` directory
- [ ] Create ADR template (\`000-template.md\`)
- [ ] Write ADR-001: Node.js 20.x requirement
- [ ] Write ADR-002: React + Vite + TypeScript stack
- [ ] Write ADR-003: Vercel deployment choice
- [ ] Write ADR-004: Static JSON data approach
- [ ] Document ADR process in \`CONTRIBUTING.md\`
- [ ] Add ADR index to README

## Acceptance Criteria
- ✅ ADR directory structure established
- ✅ At least 3 ADRs documented
- ✅ Template available for future ADRs
- ✅ Process documented for contributors

## Estimated Time
2 hours

## ADR Template
\`\`\`markdown
# ADR-XXX: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue we're addressing?

## Decision
What did we decide?

## Consequences
What are the positive and negative outcomes?
\`\`\`

## References
- [ADR GitHub Organization](https://adr.github.io/)
- Related: \`next_steps.md\` - Item #6"

echo ""

# Issue #7: Optional Enhancements Epic
echo "Creating Issue #7: Optional Enhancements (Epic)..."
gh issue create \
  --repo "$REPO" \
  --title "Optional Enhancements (Epic)" \
  --label "epic,enhancement,priority-low" \
  --body "## Description
Collection of optional enhancements to consider for future iterations.

## Sub-tasks (Create separate issues as needed)
- [ ] Implement feature flags framework
- [ ] Set up weekly data backups
- [ ] Add performance monitoring dashboards
- [ ] Add cost tracking and alerts
- [ ] Implement canary deployments
- [ ] Add Web Vitals tracking
- [ ] Create incident response runbook

## References
- Related: \`next_steps.md\` - Item #7

## Notes
This is an epic issue. Create individual issues for each sub-task when ready to implement."

echo ""
echo "✅ All 7 issues created successfully!"
echo ""
echo "View issues at: https://github.com/$REPO/issues"
echo ""
echo "Next steps:"
echo "  1. Assign issues to team members"
echo "  2. Add to project board/milestone"
echo "  3. Prioritize and schedule work"
