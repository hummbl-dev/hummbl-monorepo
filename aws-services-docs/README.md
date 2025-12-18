# AWSServices - AI-Native Documentation

## Validation Protocol

**CRITICAL**: Always validate awsservices references before asserting.

### Usage Pattern

```typescript
// ❌ INCORRECT - Fabricating meaning
'AWSServices concept X means...';

// ✅ CORRECT - Validated first
const concept = await validateAWSServicesConcept('X');
// Use validated definition
```

## Authoritative Source

All awsservices definitions are maintained in `src/definitions.ts`.

## Validation Tools

- `validateAWSServicesConcept(id)` - Validate concept definitions
- `searchAWSServices(query)` - Search with validation
- `getAWSServicesDetails(id)` - Get full validated details
