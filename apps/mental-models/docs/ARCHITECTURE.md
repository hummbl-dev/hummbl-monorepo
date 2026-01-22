# HUMMBL Architecture Documentation

## System Overview

HUMMBL is a **Base120 mental model framework** delivered as a static React application with future API services. The architecture prioritizes agent-readiness, type safety, and transformation-based organization.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User/Agent Interface                      │
│  (Web Browser, API Client, AI Assistant)                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
       ┌───────────┴──────────┐
       │                      │
┌──────▼────────┐    ┌───────▼────────┐
│  Static Site  │    │  HUMMBL API    │
│  (React/Vite) │    │  (Future)      │
│               │    │                │
│  - 120 Models │    │  - Search      │
│  - 6 Narratives│    │  - Query      │
│  - Flashcards │    │  - Analytics   │
└──────┬────────┘    └───────┬────────┘
       │                     │
       └──────────┬──────────┘
                  │
         ┌────────▼──────────┐
         │  Data Layer       │
         │                   │
         │  - Base120 Ledger │
         │  - Bibliography   │
         │  - Metadata       │
         └───────────────────┘
```

## Core Domain Model

### Base120 Structure
```typescript
type TransformationCode = 'P' | 'IN' | 'CO' | 'DE' | 'RE' | 'SY';

interface Model {
  code: string;              // "P1", "IN3", "SY17"
  name: string;              // "First Principles Thinking"
  transformation: TransformationCode;
  tier: 1 | 2 | 3 | 4;      // Complexity tier
  category: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  definition: string;
  examples: Example[];
  bibliography: Reference[];
  lastUpdated: Date;
  published: boolean;
}

interface Transformation {
  code: TransformationCode;
  name: string;              // "Perspective", "Inversion", etc.
  description: string;
  models: Model[];           // 20 models per transformation
  narrative: string;         // Long-form explanation
}
```

### Relationships
- **1 HUMMBL Framework** → **6 Transformations** → **120 Models**
- Each model belongs to exactly one transformation
- Each model has 1 primary + N secondary categories
- Each model references N bibliography sources

## Technology Stack

### Frontend (Current)
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.0
- **Language**: TypeScript 5.3.0 (strict mode)
- **Styling**: CSS Modules + Tailwind (planned)
- **State**: React hooks (no external state management yet)
- **Routing**: React Router (to be added)

### Infrastructure
- **Hosting**: Vercel (edge CDN)
- **Domain**: hummbl.io
- **Deployment**: GitHub Actions → Vercel
- **Package Manager**: pnpm (monorepo-optimized)
- **Version Control**: GitHub (hummbl-dev organization)

### Future Stack (API Layer)
- **Runtime**: Node.js or Cloudflare Workers
- **Framework**: Express or Hono
- **Database**: PostgreSQL or D1 (for model metadata)
- **Search**: Elasticsearch or native full-text search
- **Caching**: Redis or Cloudflare KV
- **Validation**: Zod for runtime type safety

## Directory Structure

```
hummbl-io/
├── .github/
│   └── workflows/           # CI/CD automation
├── .windsurf/
│   ├── rules/              # Cascade coding standards
│   └── workflows/          # Development workflows
├── public/
│   ├── models/             # Static model data (JSON)
│   └── assets/             # Images, icons
├── src/
│   ├── components/
│   │   ├── common/         # Button, Card, Layout
│   │   └── domain/         # ModelCard, TransformationBadge
│   ├── features/
│   │   ├── models/         # Model browsing, search
│   │   ├── transformations/# Transformation narratives
│   │   └── learning/       # Flashcard system
│   ├── lib/
│   │   ├── constants.ts    # BASE_TRANSFORMATIONS, etc.
│   │   ├── utils.ts        # Helper functions
│   │   └── types.ts        # Shared type definitions
│   ├── pages/              # Route components
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── docs/
│   ├── API.md             # API design (future)
│   ├── ARCHITECTURE.md    # This file
│   └── CONTRIBUTING.md    # Contributor guide
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Data Flow Patterns

### Model Rendering Flow
```
User visits /models/P1
    ↓
Router matches route
    ↓
Page component loads
    ↓
Fetches model data (JSON or API)
    ↓
Passes to ModelCard component
    ↓
Renders with transformation styling
    ↓
User sees P1 model page
```

### Search Flow (Future)
```
User types "first principles"
    ↓
Debounced input (300ms)
    ↓
API request /api/search?q=first+principles
    ↓
Server searches:
  - Model names (exact + fuzzy)
  - Definitions (full-text)
  - Categories (tags)
    ↓
Returns ranked results
    ↓
UI displays sorted list
```

## Design Patterns

### Component Composition
```typescript
// ✅ Correct: Composable, reusable
<ModelCard model={p1}>
  <ModelCard.Header />
  <ModelCard.Body />
  <ModelCard.Footer>
    <TransformationBadge code="P" />
  </ModelCard.Footer>
</ModelCard>

// ❌ Incorrect: Monolithic, inflexible
<P1ModelPage /> // Does everything internally
```

### Feature Organization
```
features/models/
├── components/          # Model-specific UI
├── hooks/              # useModelSearch, useModelFilter
├── utils/              # Model formatting, filtering
├── types.ts            # Model-related types
└── index.ts            # Public exports
```

### Data Loading Strategies
- **Static Data**: JSON files in `/public/models/`
- **Build-Time**: Generate pages from model ledger
- **Future API**: Lazy-load on demand, cache aggressively

## Scalability Considerations

### Performance Targets
- **120 Models**: Static site handles this easily
- **1,000 Users**: Vercel edge CDN (no backend needed)
- **10,000 Users**: Add API caching, CDN optimization
- **100,000 Users**: Dedicated API infrastructure, rate limiting

### Code Splitting
```typescript
// Lazy load heavy features
const FlashcardApp = lazy(() => import('./features/learning/FlashcardApp'));
const TransformationNarrative = lazy(() => import('./features/transformations/Narrative'));
```

### Bundle Optimization
- Tree-shake unused code
- Use dynamic imports for routes
- Compress assets (images → WebP, SVG)
- Minimize third-party dependencies

## Security Model

### Current (Static Site)
- No authentication required
- All content public
- No user data stored
- HTTPS by default (Vercel)

### Future (API)
- **API Keys**: For programmatic access
- **Rate Limiting**: Prevent abuse
- **CORS**: Whitelist allowed origins
- **Validation**: Zod schemas for all inputs

## Monitoring & Observability

### Current State
- **Logs**: Vercel function logs
- **Analytics**: None (to be added)
- **Error Tracking**: None (Sentry recommended)
- **Performance**: None (Web Vitals recommended)

### Recommended Stack
```
Production Monitoring
├── Sentry           # Error tracking, performance
├── Vercel Analytics # Web Vitals, user metrics
├── PostHog          # Product analytics, funnels
└── Custom Logging   # Transformation usage tracking
```

## Testing Strategy (When Implemented)

### Unit Tests (Vitest)
- Model data parsing
- Utility functions
- Transformation logic

### Component Tests (Testing Library)
- ModelCard renders correctly
- TransformationBadge shows right color
- Search filtering works

### E2E Tests (Playwright)
- User can browse all 120 models
- Flashcard system tracks progress
- Navigation works across pages

## Deployment Pipeline

```
Code Push → GitHub
    ↓
GitHub Actions runs:
  - pnpm install --frozen-lockfile
  - pnpm lint
  - pnpm type-check
  - pnpm build
    ↓
Build succeeds?
  Yes → Trigger Vercel deployment
  No  → Fail CI, block merge
    ↓
Vercel builds & deploys
    ↓
Edge CDN propagation (~30s)
    ↓
Live at hummbl.io
```

## Extension Points

### Adding New Features
1. Create feature directory: `src/features/new-feature/`
2. Add components, hooks, utils
3. Export public API: `features/new-feature/index.ts`
4. Import in parent component

### Adding New Models
1. Update model ledger CSV
2. Generate JSON files (automation script)
3. Create model page (manual or generated)
4. Add to navigation/search

### Integrating with External Systems
```typescript
// Future: AI Assistant Integration
import { searchModels } from '@hummbl/api-client';

const results = await searchModels({
  query: 'decision making',
  transformation: 'P',
  limit: 5
});
```

## Known Limitations

### Current
- ❌ No server-side rendering (static only)
- ❌ No API (all data client-side)
- ❌ No test coverage
- ❌ No analytics/tracking
- ❌ No search functionality

### Planned Improvements
- ✅ Add API layer (Phase 0 in progress)
- ✅ Implement testing suite (ready to start)
- ✅ Add wickedness scorer (designed)
- ✅ Build transformation chain tools (researched)

## Design Principles Recap

1. **Agent-Ready**: Every feature accessible programmatically
2. **Type-Safe**: Compile-time guarantees prevent runtime errors
3. **Transformation-Centric**: Code mirrors HUMMBL's conceptual structure
4. **Performance-First**: Fast initial load, smooth interactions
5. **Extensible**: Easy to add models, features, integrations

---

**This architecture serves HUMMBL's mission: making mental model transformation computable, accessible, and applicable to real-world problems.**
