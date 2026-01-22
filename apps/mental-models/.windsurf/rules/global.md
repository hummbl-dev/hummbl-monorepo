# HUMMBL Global Development Rules

## Project Context
HUMMBL (Highly Useful Mental Model Base Language) is a Base120 framework of mental models organized across 6 transformations (P, IN, CO, DE, RE, SY). This is a TypeScript/React monorepo deployed to Vercel.

## Core Principles

### 1. Transformation-First Thinking
- **Always consider which transformation applies**: P (Perspective), IN (Inversion), CO (Composition), DE (Decomposition), RE (Recursion), SY (Systems)
- Code organization should mirror HUMMBL's structure
- Use transformation codes (P1, IN3, etc.) in comments for complex decisions

### 2. Agent-Ready Architecture
- Design for both human and AI agent consumption
- Prioritize programmatic interfaces over UIs
- JSON responses should include transformation metadata
- Every model should be accessible via API endpoint

### 3. Type Safety is Non-Negotiable
- TypeScript strict mode always enabled
- No `any` types unless absolutely necessary (document why)
- Prefer type inference but add explicit types for public APIs
- Use Zod for runtime validation at boundaries

## Tech Stack Standards

### React Patterns
```typescript
// ✅ Correct: Functional components with explicit return types
export const ModelCard: FC<ModelCardProps> = ({ model }) => {
  return <div>{model.name}</div>;
};

// ❌ Incorrect: Implicit any, missing types
export default function ModelCard(props) {
  return <div>{props.model.name}</div>;
}
```

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Card)
│   └── domain/         # HUMMBL-specific (ModelCard, TransformationBadge)
├── features/           # Feature modules (models, transformations)
├── lib/                # Utilities, helpers, constants
├── types/              # TypeScript type definitions
└── pages/              # Route components
```

### Naming Conventions
- **Components**: PascalCase (ModelCard.tsx)
- **Utilities**: camelCase (formatModelCode.ts)
- **Constants**: SCREAMING_SNAKE_CASE (BASE_TRANSFORMATIONS)
- **Types**: PascalCase with descriptive suffixes (ModelCardProps, TransformationCode)
- **Hooks**: camelCase with 'use' prefix (useModelSearch)

## Performance Requirements

### Core Metrics
- **Initial Load**: <2s (Time to Interactive)
- **API Response**: <200ms (p95)
- **Bundle Size**: <500KB initial (gzipped)
- **Lighthouse Score**: 90+ across all categories

### Optimization Rules
- Lazy load routes with React.lazy()
- Memoize expensive computations
- Use proper React keys for lists
- Implement virtual scrolling for 100+ items
- Avoid prop drilling (use context or state management)

## Error Handling

### Never Fail Silently
```typescript
// ✅ Correct: Explicit error handling
try {
  const model = await fetchModel(code);
  return model;
} catch (error) {
  logger.error('Failed to fetch model', { code, error });
  throw new ModelNotFoundError(code);
}

// ❌ Incorrect: Swallowing errors
try {
  const model = await fetchModel(code);
  return model;
} catch (error) {
  return null; // User has no idea what went wrong
}
```

### Error Boundaries
- Wrap route components in error boundaries
- Log errors to monitoring service (Sentry when configured)
- Show user-friendly messages, not stack traces

## Git & CI/CD Practices

### Commit Messages
```bash
# ✅ Correct: Imperative mood, clear scope
feat(models): add P-series model pages
fix(api): handle null responses in model search
docs(readme): update installation instructions

# ❌ Incorrect: Past tense, vague
updated some files
fixed bug
wip
```

### Branch Strategy
- **main**: Production-ready code only
- **feature/**: New features (feature/p-series-pages)
- **fix/**: Bug fixes (fix/model-search-null)
- **docs/**: Documentation (docs/api-reference)

### Before Push Checklist
- [ ] `pnpm lint` passes
- [ ] `pnpm type-check` passes
- [ ] `pnpm test` passes (when tests exist)
- [ ] `pnpm build` succeeds
- [ ] No console.log or debugger statements
- [ ] Commit message follows convention

## Code Quality

### Prefer Composition Over Inheritance
```typescript
// ✅ Correct: Composable utilities
const enhanceWithMetadata = (model: Model) => ({
  ...model,
  metadata: { lastUpdated: new Date() }
});

// ❌ Incorrect: Class hierarchy
class BaseModel { /* ... */ }
class EnhancedModel extends BaseModel { /* ... */ }
```

### Keep Functions Small and Focused
- Functions should do ONE thing
- Maximum 30 lines per function (guideline, not rule)
- Extract complex logic into named utilities
- Use descriptive names that explain intent

### Comments: Why, Not What
```typescript
// ✅ Correct: Explains reasoning
// Using IN2 (Inversion) to reframe the problem from the opposite perspective
const invertedProblem = invertProblemStatement(problem);

// ❌ Incorrect: States the obvious
// Assign the inverted problem
const invertedProblem = invertProblemStatement(problem);
```

## Testing Philosophy (When Implemented)

### Test Pyramid
- **Unit Tests**: 70% - Test individual functions/components
- **Integration Tests**: 20% - Test feature workflows
- **E2E Tests**: 10% - Test critical user journeys

### What to Test
- ✅ Business logic (transformations, scoring)
- ✅ API integrations
- ✅ Complex UI interactions
- ❌ Third-party libraries
- ❌ Trivial getters/setters

## Accessibility Standards

### Minimum Requirements
- Semantic HTML (nav, main, article, section)
- ARIA labels for interactive elements
- Keyboard navigation for all actions
- Color contrast ratio 4.5:1 minimum
- Focus indicators visible and clear

## Dependencies Management

### Adding New Dependencies
1. Check bundle size impact (bundlephobia.com)
2. Verify active maintenance (last commit < 6 months)
3. Check security (npm audit)
4. Document reasoning in PR description
5. Prefer smaller, focused libraries over monoliths

### Avoid Dependency Bloat
- Use tree-shakeable imports
- Consider native browser APIs before adding libraries
- Evaluate cost vs. benefit for every dependency

## Documentation Standards

### Every Feature Needs
- **README**: What it does, why it exists
- **Usage Examples**: Code snippets that work
- **API Documentation**: Parameters, return types, examples
- **Architecture Decision Records**: For significant decisions

### Write for Future You
- Assume 6 months memory loss
- Document assumptions and constraints
- Link to relevant HUMMBL models where applicable
- Include diagrams for complex flows

## Mental Model Application

### Document Transformation Usage
When solving complex problems in code, document which HUMMBL transformations informed the solution:

```typescript
/**
 * Wickedness scoring algorithm
 * 
 * Applies multiple transformations:
 * - DE3 (Modularization): Break problem into 5 measurable dimensions
 * - SY7 (Feedback Loops): Iterate scores based on interdependencies
 * - CO5 (Integration): Combine dimension scores into unified metric
 */
export function calculateWickednessScore(problem: Problem): WickednessScore {
  // Implementation
}
```

## Production Deployment

### Vercel Deployment Checklist
- [ ] Environment variables configured
- [ ] Build succeeds without warnings
- [ ] Performance budgets met
- [ ] Analytics/monitoring configured
- [ ] Error tracking enabled
- [ ] Preview deployments disabled (main only)

### Post-Deployment Verification
1. Check production URL loads (<2s)
2. Test critical user flows
3. Verify API endpoints respond
4. Check browser console (no errors)
5. Validate analytics tracking

## When In Doubt

1. **Check Past Decisions**: Search codebase for similar patterns
2. **Apply HUMMBL**: Which transformation helps solve this?
3. **Ask for Clarification**: Better than making wrong assumptions
4. **Document Uncertainty**: Flag areas that need review
5. **Prefer Simple**: Choose boring, proven solutions

---

**Remember**: These rules serve HUMMBL's mission of formalizing cognitive transformation. Code should be as clear and structured as the mental models it implements.
