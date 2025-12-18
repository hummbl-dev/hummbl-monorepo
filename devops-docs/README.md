# DevOps - AI-Native Documentation

## Validation Protocol

**CRITICAL**: Always validate devops references before asserting.

### Usage Pattern

```typescript
// ❌ INCORRECT - Fabricating meaning
'DevOps concept X means...';

// ✅ CORRECT - Validated first
const concept = await validateDevOpsConcept('X');
// Use validated definition
```

## Authoritative Source

All devops definitions are maintained in `src/definitions.ts`.

## Validation Tools

- `validateDevOpsConcept(id)` - Validate concept definitions
- `searchDevOps(query)` - Search with validation
- `getDevOpsDetails(id)` - Get full validated details
