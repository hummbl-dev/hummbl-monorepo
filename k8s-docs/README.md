# Kubernetes - AI-Native Documentation

## Validation Protocol

**CRITICAL**: Always validate kubernetes references before asserting.

### Usage Pattern
```typescript
// ❌ INCORRECT - Fabricating meaning
"Kubernetes concept X means..."

// ✅ CORRECT - Validated first
const concept = await validateKubernetesConcept('X');
// Use validated definition
```

## Authoritative Source

All kubernetes definitions are maintained in `src/definitions.ts`.

## Validation Tools

- `validateKubernetesConcept(id)` - Validate concept definitions
- `searchKubernetes(query)` - Search with validation
- `getKubernetesDetails(id)` - Get full validated details
