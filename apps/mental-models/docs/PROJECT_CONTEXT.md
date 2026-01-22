# HUMMBL Project Context

**Quick reference for AI development agents**

## Project Identity

- **Name**: HUMMBL (Highly Useful Mental Model Base Language)
- **Mission**: Formalize cognitive transformation through computable mental models
- **Owner**: Reuben Bowlby (@hummbl-dev)
- **Status**: Active development, production deployed
- **URL**: https://hummbl.io
- **Repository**: github.com/hummbl-dev/hummbl-io

## Core Concept

HUMMBL is a **Base120 framework** organizing 120 mental models across 6 transformations:

| Code | Transformation | Color | Models | Purpose |
|------|---------------|-------|---------|---------|
| P | Perspective | Blue (#3B82F6) | P1-P20 | Shift viewpoint and identity |
| IN | Inversion | Purple (#8B5CF6) | IN1-IN20 | Flip problem on its head |
| CO | Composition | Orange (#F97316) | CO1-CO20 | Combine elements synergistically |
| DE | Decomposition | Teal (#14B8A6) | DE1-DE20 | Break into constituent parts |
| RE | Recursion | Green (#10B981) | RE1-RE20 | Apply patterns self-referentially |
| SY | Systems | Cyan (#06B6D4) | SY1-SY20 | Understand interconnections |

**Key Insight**: Mental models are not static—they're **transformations** that can be chained together for problem-solving.

## Tech Stack

### Production
- **Frontend**: React 18.2.0 + TypeScript 5.3.0 (strict mode)
- **Build**: Vite 5.0.0 (fast dev server, optimized builds)
- **Styling**: CSS Modules (Tailwind planned)
- **Deployment**: Vercel (edge CDN, automatic deployments)
- **Package Manager**: pnpm (monorepo optimization)
- **CI/CD**: GitHub Actions (lint, type-check, build on every push)

### Future (Planned)
- **API**: Node.js/Express or Cloudflare Workers
- **Database**: PostgreSQL or Cloudflare D1
- **Testing**: Vitest + React Testing Library + Playwright
- **Monitoring**: Sentry + Vercel Analytics + PostHog

## Project Structure

```
hummbl-io/
├── .github/workflows/      # CI/CD automation
├── .windsurf/             # Cascade context (rules, workflows)
├── public/models/         # Model data (JSON files)
├── src/
│   ├── components/        # React components
│   │   ├── common/        # Generic UI (Button, Card)
│   │   └── domain/        # HUMMBL-specific (ModelCard, TransformationBadge)
│   ├── features/          # Feature modules
│   │   ├── models/        # Model browsing, search
│   │   ├── transformations/ # Narrative pages
│   │   └── learning/      # Flashcard system
│   ├── lib/               # Utils, constants, types
│   ├── pages/             # Route components
│   └── App.tsx            # Root component
├── docs/                  # Documentation
└── package.json
```

## Current State (Oct 23, 2025)

### ✅ Completed
- 23+ mental model documentation pages
- 6 transformation narratives
- Production deployment to hummbl.io
- CI/CD pipeline (GitHub Actions + Vercel)
- Dark theme, mobile-responsive design
- Flashcard learning app (artifact, not integrated)
- Base120 model ledger (all 120 models catalogued)
- Academic papers (2 drafts ready for submission)
- Wickedness benchmarking framework (research complete)

### 🔄 In Progress
- HUMMBL API design (Phase 0 architecture pending)
- Test suite implementation (Vitest + RTL ready to start)
- P-series model publishing (0/20 published, ChatGPT-5 collaborating)
- Wickedness scorer tool (80% research complete)

### 📋 Planned
- API layer for programmatic access
- Transformation chain tools
- Community contributor onboarding
- VEO 3 explainer video generation
- Marketing campaign (Product Hunt, Hacker News)

## Key Files to Know

### Configuration
- `package.json` - Dependencies, scripts
- `tsconfig.json` - TypeScript strict mode config
- `vite.config.ts` - Build configuration
- `.github/workflows/` - CI/CD automation

### Documentation
- `docs/ARCHITECTURE.md` - System architecture
- `docs/PATTERNS.md` - Code patterns
- `docs/CONTRIBUTING.md` - Contributor guide (to be created)
- `docs/HUMMBL_Model_Source_Ledger.csv` - Master model list

### Rules & Workflows
- `.windsurf/rules/global.md` - Coding standards
- `.windsurf/workflows/deploy-feature.md` - Deployment process
- `.windsurf/workflows/add-new-model.md` - Model addition workflow

## Development Workflow

### Standard Development Cycle
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Develop with hot reload
pnpm dev

# 3. Quality checks
pnpm lint && pnpm type-check && pnpm build

# 4. Commit with conventional format
git commit -m "feat(scope): description"

# 5. Push and create PR
git push origin feature/my-feature

# 6. CI validates, then merge to main
# 7. Vercel auto-deploys to production
```

### Quick Commands
```bash
pnpm dev          # Start dev server (localhost:5173)
pnpm lint         # ESLint check
pnpm type-check   # TypeScript validation
pnpm build        # Production build
pnpm preview      # Test production build locally
```

## Important Conventions

### Model Codes
- Format: `{TRANSFORMATION}{NUMBER}` (e.g., P1, IN7, SY20)
- Range: 1-20 per transformation
- Total: 120 models (6 transformations × 20 models)

### Transformation Chains
- **Example**: `P → DE → CO` (Perspective, then Decomposition, then Composition)
- Used for complex problem-solving
- Document which transformations inform code decisions

### Commit Messages
```
feat(models): add P1 First Principles model
fix(api): handle null responses in search
docs(readme): update installation instructions
chore(deps): upgrade React to 18.2.0
```

### Tier System
- **Tier 1**: Foundational (simple, widely applicable)
- **Tier 2**: Intermediate (domain-specific)
- **Tier 3**: Advanced (complex, multiple dependencies)
- **Tier 4**: Expert (meta-cognitive, self-referential)

## Code Quality Standards

### Type Safety
- ✅ TypeScript strict mode always
- ✅ No `any` types (unless documented exception)
- ✅ Explicit return types for exported functions
- ✅ Zod validation at API boundaries

### Testing (When Implemented)
- Unit tests for utilities and business logic
- Component tests for UI
- E2E tests for critical user journeys
- Target: 70%+ coverage

### Performance
- Initial load: <2s (Time to Interactive)
- API response: <200ms (p95)
- Bundle size: <500KB initial (gzipped)
- Lighthouse: 90+ all categories

### Accessibility
- Semantic HTML (nav, main, article)
- ARIA labels on interactive elements
- Keyboard navigation for all actions
- Color contrast 4.5:1 minimum

## Mental Model Application

When building features, consider which HUMMBL transformation applies:

- **P (Perspective)**: Whose viewpoint matters? What's the user's mental model?
- **IN (Inversion)**: What if we approached this backwards? What should we NOT do?
- **CO (Composition)**: How do components combine? What's the integration pattern?
- **DE (Decomposition)**: Can we break this into smaller pieces? What are the layers?
- **RE (Recursion)**: Does this pattern repeat? Can it reference itself?
- **SY (Systems)**: What are the feedback loops? How do parts interconnect?

Document transformation usage in code comments for complex decisions.

## Deployment

### Automatic Deployment
- Push to `main` branch → GitHub Actions runs checks → Vercel deploys
- Typical deploy time: 2-3 minutes
- No preview deployments (main branch only)

### Emergency Rollback
```bash
git revert HEAD
git push origin main
# Vercel auto-deploys previous version
```

## Multi-Agent Coordination

### Active Agents
- **Claude Sonnet 4.5**: Lead development, architecture, strategic planning
- **ChatGPT-5**: Systems validation, collaboration on publishing
- **Windsurf Cascade**: Infrastructure engineering, local development
- **VEO 3** (Google): Video generation for marketing

### Handoff Protocol
- Use SITREP format for status updates (military-style briefing)
- Include timestamp, current status, blockers, next actions
- Share via markdown documents or direct communication

## Business Context

### Primary User
- **Reuben Bowlby**: Trainer at Life Time Fitness, CEO NEXUS AI, law school bound
- **Location**: Georgia (EST/EDT timezone)
- **Work Style**: Rapid prototyping, multi-agent orchestration, transformation-first thinking
- **Constraints**: Time-limited (full-time job + law school prep)

### Strategic Goals
1. Publish all 120 models (content completion)
2. Build developer ecosystem (API, SDK, integrations)
3. Demonstrate concrete utility (wickedness scorer, transformation chains)
4. Achieve academic validation (published papers)
5. Recruit early evangelists (pilot users, contributors)

### Revenue Model
- Currently pre-revenue
- Future: API subscriptions, enterprise licensing, consulting
- Not primary focus (validation phase)

## Resources & References

### Internal Documentation
- `/docs/ARCHITECTURE.md` - Technical architecture
- `/docs/PATTERNS.md` - Code patterns
- `/docs/TECHNICAL_STACK.md` - Infrastructure details
- `/docs/HUMMBL_Model_Source_Ledger.csv` - Model database

### External Resources
- [HUMMBL Website](https://hummbl.io) - Live production site
- [GitHub Repo](https://github.com/hummbl-dev/hummbl-io) - Source code
- [Vercel Dashboard](https://vercel.com) - Deployment logs

### Bibliography
- 95%+ of HUMMBL bibliography verified
- 28 DOIs documented
- Academic rigor maintained throughout

## Decision Framework

When uncertain:

1. **Check Past Work**: Search codebase for similar patterns
2. **Apply HUMMBL**: Which transformation helps solve this?
3. **Consult Documentation**: Review ARCHITECTURE.md, PATTERNS.md
4. **Ask for Clarification**: Better than wrong assumptions
5. **Document Reasoning**: Explain why in comments/PRs

## Common Questions

**Q: Where do model data files live?**  
A: `/public/models/{CODE}.json` (e.g., `/public/models/P1.json`)

**Q: How do I add a new model?**  
A: Follow `.windsurf/workflows/add-new-model.md`

**Q: What's the deployment process?**  
A: Push to `main` → GitHub Actions validates → Vercel deploys automatically

**Q: Where are coding standards documented?**  
A: `.windsurf/rules/global.md`

**Q: How do I test locally?**  
A: `pnpm dev` for dev server, `pnpm build && pnpm preview` for production test

**Q: What if production breaks?**  
A: `git revert HEAD && git push` for immediate rollback

## Next Priorities (As of Oct 23, 2025)

1. **P-Series Publishing** (Claude + ChatGPT-5) - 20 models, 1-2 weeks
2. **Test Suite Implementation** (Claude) - Vitest + RTL, 1 week
3. **Wickedness Scorer** (Claude) - CLI + web interface, 1 week
4. **API Layer Phase 0** (Claude) - Architecture decisions, 3-5 days

---

**This document provides context for AI agents working on HUMMBL. For comprehensive details, reference the full documentation in `/docs/`.**
