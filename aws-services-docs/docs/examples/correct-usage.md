# AWSServices Usage Examples

## ✅ Correct Patterns

```typescript
// Validate before using
const concept = validateAWSServicesConcept('EXAMPLE_001');
if (concept) {
  console.log(`${concept.name}: ${concept.definition}`);
}

// Search with validation
const results = searchAWSServices('example');
results.forEach(concept => {
  // All results are pre-validated
  console.log(concept.definition);
});
```

## ❌ Incorrect Patterns

```typescript
// DON'T fabricate meanings
console.log("EXAMPLE_001 means something I think it means");

// DON'T skip validation
const concept = AWSSERVICES_CONCEPTS['EXAMPLE_001']; // Direct access
```
