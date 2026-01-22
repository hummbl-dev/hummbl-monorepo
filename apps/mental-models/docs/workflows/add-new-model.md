# Adding a New Model to HUMMBL

This guide walks you through the process of adding a new mental model to the HUMMBL framework. Follow these steps to ensure consistency and maintainability.

## Prerequisites

- Familiarity with the [HUMMBL Architecture](../ARCHITECTURE.md)
- Basic understanding of TypeScript and React
- Access to the HUMMBL codebase

## Step 1: Create Model Files

1. Navigate to the models directory:
   ```bash
   cd src/models
   ```

2. Create a new directory for your model (kebab-case):
   ```bash
   mkdir my-new-model
   ```

3. Create the following files in the new directory:
   - `index.ts` - Main model definition
   - `types.ts` - TypeScript interfaces
   - `constants.ts` - Any constants or enums
   - `README.md` - Model documentation
   - `__tests__/` - Test directory
     - `myNewModel.test.ts` - Test file

## Step 2: Define the Model Interface

In `types.ts`:

```typescript
export interface MyNewModel {
  id: string;
  name: string;
  description: string;
  category: string[];
  transformation: string;
  // Add other model-specific fields
}
```

## Step 3: Implement the Model

In `index.ts`:

```typescript
import { MyNewModel } from './types';
import { MODEL_CATEGORIES } from './constants';

export const createMyNewModel = (data: Partial<MyNewModel> = {}): MyNewModel => ({
  id: `model-${Date.now()}`,
  name: 'My New Model',
  description: 'A brief description of the model',
  category: [MODEL_CATEGORIES.DECISION_MAKING],
  transformation: 'base120',
  ...data,
});

// Add any utility functions here
export const analyzeWithModel = (input: string): AnalysisResult => {
  // Implementation
};
```

## Step 4: Register the Model

1. Add your model to the model registry in `src/models/index.ts`:

```typescript
import { MyNewModel, createMyNewModel } from './my-new-model';

export const MODELS = {
  // ... other models
  MY_NEW_MODEL: 'myNewModel',
} as const;

export const MODEL_FACTORIES = {
  // ... other factories
  [MODELS.MY_NEW_MODEL]: createMyNewModel,
};

export type ModelType = {
  // ... other model types
  [MODELS.MY_NEW_MODEL]: MyNewModel;
};
```

## Step 5: Create Tests

In `__tests__/myNewModel.test.ts`:

```typescript
import { createMyNewModel } from '..';

describe('MyNewModel', () => {
  it('should create a new model with default values', () => {
    const model = createMyNewModel();
    expect(model).toHaveProperty('id');
    expect(model.name).toBe('My New Model');
  });

  // Add more test cases
});
```

## Step 6: Document the Model

In `README.md`:

```markdown
# My New Model

## Overview
Brief description of the model, its purpose, and when to use it.

## Key Concepts
- Concept 1
- Concept 2
- Concept 3

## Usage

```typescript
import { createMyNewModel } from './my-new-model';

const model = createMyNewModel({
  name: 'Custom Name',
  description: 'Custom description',
});
```

## Related Models
- [Related Model 1](../related-model1)
- [Related Model 2](../related-model2)
```

## Step 7: Update Documentation

1. Add your model to the main README.md
2. Update any relevant documentation in the `/docs` directory
3. If your model introduces new concepts, consider adding them to the architecture documentation

## Best Practices

1. **Naming Conventions**:
   - Use camelCase for variables and functions
   - Use PascalCase for types and interfaces
   - Use UPPER_SNAKE_CASE for constants

2. **Testing**:
   - Aim for at least 80% test coverage
   - Test edge cases and error conditions
   - Use descriptive test names

3. **Documentation**:
   - Document all public APIs
   - Include usage examples
   - Keep documentation up-to-date

4. **Performance**:
   - Be mindful of performance implications
   - Use memoization where appropriate
   - Avoid unnecessary re-renders

## Troubleshooting

### Common Issues

1. **Model not found**:
   - Verify the model is registered in `src/models/index.ts`
   - Check for typos in the model name

2. **Type errors**:
   - Ensure all required fields are provided
   - Check type definitions for mismatches

3. **Test failures**:
   - Run tests with `--watch` flag for better debugging
   - Check for console warnings/errors

## Next Steps

- [ ] Add model to the UI components
- [ ] Create visualization (if applicable)
- [ ] Add to the transformation pipeline
- [ ] Update search functionality

## See Also

- [HUMMBL Architecture](../ARCHITECTURE.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)
- [Code of Conduct](../../CODE_OF_CONDUCT.md)
```

This comprehensive guide provides everything needed to add a new model to the HUMMBL framework while maintaining consistency with existing code and documentation standards.
