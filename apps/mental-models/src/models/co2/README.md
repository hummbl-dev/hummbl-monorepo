# CO2: Conceptual Fusion

## Overview
The Conceptual Fusion (CO2) model is a powerful tool for merging multiple conceptual models into a unified representation. It enables the integration of concepts from different domains, resolving conflicts and identifying synergies between them. This model is particularly useful in scenarios where you need to combine knowledge from multiple sources or create a unified view of related concepts.

## Features

- **Concept Management**: Create, read, update, and delete concepts with rich metadata
- **Multiple Fusion Strategies**: Choose from union, intersection, preferred, or custom fusion approaches
- **Conflict Detection & Resolution**: Automatic detection and resolution of conflicts between concepts
- **Similarity Analysis**: Find similar concepts based on various attributes
- **Custom Transformation Rules**: Define custom rules for how concepts should be fused
- **Event-Driven Architecture**: Subscribe to events for concept changes and fusion operations
- **Comprehensive Validation**: Built-in validation for concepts and operations

## Installation

```bash
npm install @hummbl/models-co2
```

## Usage

### Basic Usage

```typescript
import { createConceptualFusionModel, fuseConcepts } from '@hummbl/models-co2';

// Create a new model instance
const model = createConceptualFusionModel({
  defaultSimilarityThreshold: 0.7,
  maxConceptsToFuse: 10,
  autoResolveConflicts: true,
  defaultFusionStrategy: 'union'
});

// Add some concepts
const customerConcept = model.addConcept({
  name: 'Customer',
  description: 'A person or organization that purchases goods or services',
  sourceModels: ['CRM', 'Billing'],
  properties: {
    name: { value: 'string', confidence: 0.95, sources: ['CRM', 'Billing'] },
    email: { value: 'string', confidence: 0.9, sources: ['CRM'] }
  },
  relationships: [],
  tags: ['core', 'business'],
  confidence: 0.9,
  isActive: true
});

const clientConcept = model.addConcept({
  name: 'Client',
  description: 'A customer in the sales system',
  sourceModels: ['Sales'],
  properties: {
    fullName: { value: 'string', confidence: 0.92, sources: ['Sales'] },
    company: { value: 'string', confidence: 0.8, sources: ['Sales'] }
  },
  relationships: [],
  tags: ['sales', 'external'],
  confidence: 0.85,
  isActive: true
});

// Fuse the concepts
const fusionResult = await model.fuseConcepts({
  conceptIds: [customerConcept.id, clientConcept.id],
  strategy: 'union'
});

console.log('Fused concept:', fusionResult.result);
```

## API Reference

### `createConceptualFusionModel(config?)`

Creates a new instance of the Conceptual Fusion model.

**Parameters:**
- `config` (optional): Configuration object
  - `defaultSimilarityThreshold` (number, default: 0.7): Default threshold for similarity matching
  - `maxConceptsToFuse` (number, default: 10): Maximum number of concepts that can be fused at once
  - `autoResolveConflicts` (boolean, default: true): Whether to automatically resolve conflicts
  - `defaultFusionStrategy` ('union' | 'intersection' | 'preferred' | 'custom', default: 'union')
  - `enableCaching` (boolean, default: true): Enable caching of similarity calculations
  - `cacheTTL` (number, default: 300000): Cache TTL in milliseconds

**Returns:** A new `ConceptualFusionModel` instance

### `fuseConcepts(params)`

Fuses multiple concepts into a single unified concept.

**Parameters:**
- `conceptIds` (string[]): IDs of the concepts to fuse
- `strategy` ('union' | 'intersection' | 'preferred' | 'custom'): Fusion strategy
- `autoResolve` (boolean, optional): Override auto-resolve setting
- `context` (object, optional): Additional context for fusion

**Returns:** Promise<`FusionResult`>

### `findSimilarConcepts(params)`

Finds concepts similar to the specified concept.

**Parameters:**
- `conceptId` (string): ID of the concept to find similarities for
- `threshold` (number, optional): Minimum similarity score (0-1)
- `limit` (number, optional): Maximum number of results
- `fields` (array, optional): Fields to consider for similarity

**Returns:** Promise<`SimilarityResult[]`>

### Event Handling

```typescript
// Subscribe to events
model.on('conceptAdded', (event) => {
  console.log('Concept added:', event.concept);
});

model.on('beforeFusion', (event) => {
  console.log('Before fusion:', event.concepts);});

model.on('afterFusion', (event) => {
  console.log('After fusion:', event.result);
});

// Unsubscribe
model.off('conceptAdded', handler);
```

## Fusion Strategies

### Union
Combines all properties and relationships from all source concepts. If there are conflicts, the first occurrence is used.

### Intersection
Only includes properties and relationships that exist in all source concepts.

### Preferred
Uses a priority order to determine which source concept's properties to prefer in case of conflicts.

### Custom
Allows defining custom transformation rules for how concepts should be merged.

## Examples

### Custom Fusion Rule

```typescript
// Add a custom transformation rule
model.addRule({
  name: 'Merge User Concepts',
  description: 'Merges different user-related concepts',
  priority: 100,
  condition: `
    (concept1, concept2) => {
      const userTerms = ['user', 'member', 'customer', 'client'];
      const name1 = concept1.name.toLowerCase();
      const name2 = concept2.name.toLowerCase();
      
      return userTerms.some(term => 
        (name1.includes(term) && name2.includes(term)) ||
        (name1.includes(term) && name2.includes('user')) ||
        (name1.includes('user') && name2.includes(term))
      );
    }
  `,
  action: `
    (concept1, concept2) => {
      // Implementation of custom merge logic
      return {
        ...concept1,
        name: 'User',
        description: 'A unified user concept',
        // Additional merge logic...
      };
    }
  `,
  isActive: true,
  tags: ['user', 'merge']
});
```

### Finding Similar Concepts

```typescript
// Find concepts similar to 'customer'
const similar = await model.findSimilarConcepts({
  conceptId: customerConcept.id,
  threshold: 0.6,
  limit: 5
});

console.log('Similar concepts:', similar);
```

## Error Handling

The model provides comprehensive error handling through exceptions and validation results. Always wrap fusion operations in try-catch blocks:

```typescript
try {
  const result = await model.fuseConcepts({
    conceptIds: [id1, id2],
    strategy: 'union'
  });
} catch (error) {
  console.error('Fusion failed:', error.message);
}
```

## Performance Considerations

- For large numbers of concepts, consider increasing the `maxConceptsToFuse` limit
- Disable caching with `enableCaching: false` if memory usage is a concern
- Use the `fields` parameter in `findSimilarConcepts` to limit which fields are compared

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

MIT
