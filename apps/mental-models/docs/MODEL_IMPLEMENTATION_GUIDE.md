# Model Implementation Guide

This guide outlines the standards and patterns for implementing mental models in the HUMMBL framework.

## Directory Structure

```
src/models/
  {model_code}/           # Lowercase model code (e.g., p1, in2)
    __tests__/            # Test files
      {model_code}.test.ts
    constants.ts          # Model constants and configuration
    index.ts              # Main implementation
    types.ts              # TypeScript type definitions
    README.md             # Model documentation
```

## File Templates

### types.ts
```typescript
/**
 * {MODEL_CODE}: {MODEL_NAME}
 * 
 * {Brief description of the model and its purpose}
 */

export interface {ModelName}Config {
  // Configuration options for the model
  option1?: string;
  option2?: number;
}

export interface {ModelName}Result {
  // Structure of the model's output
  success: boolean;
  data: any;
  metrics: {
    processingTimeMs: number;
    confidence: number;
  };
}

export interface {ModelName}Model {
  id: string;
  name: string;
  version: string;
  config: {ModelName}Config;
  
  // Core methods
  process(input: any): Promise<{ModelName}Result>;
  
  // Additional methods as needed
  validate?(input: any): boolean;
}
```

### constants.ts
```typescript
import { {ModelName}Config } from './types';

export const {MODEL_CODE}_CONSTANTS = {
  MODEL_CODE: '{MODEL_CODE}',
  MODEL_NAME: '{MODEL_NAME}',
  VERSION: '1.0.0',
  
  DEFAULTS: {
    // Default configuration values
    option1: 'default',
    option2: 100,
  },
  
  // Constants used by the model
  THRESHOLDS: {
    MIN_CONFIDENCE: 0.7,
    MAX_RETRIES: 3,
  },
  
  // Error messages
  ERRORS: {
    INVALID_INPUT: 'Invalid input provided',
    PROCESSING_ERROR: 'Error processing input',
  },
} as const;
```

### index.ts
```typescript
import { v4 as uuidv4 } from 'uuid';
import { {MODEL_CODE}_CONSTANTS } from './constants';
import type { {ModelName}Config, {ModelName}Result, {ModelName}Model } from './types';

/**
 * Creates a new {MODEL_NAME} model instance
 */
export function create{ModelName}Model(config: Partial<{ModelName}Config> = {}): {ModelName}Model {
  const model: {ModelName}Model = {
    id: `${MODEL_CODE}-${uuidv4()}`,
    name: {MODEL_CODE}_CONSTANTS.MODEL_NAME,
    version: {MODEL_CODE}_CONSTANTS.VERSION,
    config: {
      ...{MODEL_CODE}_CONSTANTS.DEFAULTS,
      ...config,
    },
    
    async process(input: any): Promise<{ModelName}Result> {
      const startTime = Date.now();
      
      try {
        // Implementation here
        
        return {
          success: true,
          data: { /* processed data */ },
          metrics: {
            processingTimeMs: Date.now() - startTime,
            confidence: 1.0,
          },
        };
      } catch (error) {
        return {
          success: false,
          data: null,
          error: error.message,
          metrics: {
            processingTimeMs: Date.now() - startTime,
            confidence: 0,
          },
        };
      }
    },
    
    validate(input: any): boolean {
      // Implementation
      return true;
    },
  };
  
  return model;
}

export * from './types';
export * from './constants';
```

### Test File (`__tests__/{model_code}.test.ts`)
```typescript
import { create{ModelName}Model } from '..';

describe('{MODEL_CODE}: {MODEL_NAME}', () => {
  let model: ReturnType<typeof create{ModelName}Model>;
  
  beforeEach(() => {
    model = create{ModelName}Model();
  });
  
  describe('Initialization', () => {
    it('should create a model with default config', () => {
      expect(model).toBeDefined();
      expect(model.id).toMatch(/^{MODEL_CODE}-/);
      expect(model.name).toBe('{MODEL_NAME}');
      expect(model.version).toBe('1.0.0');
    });
  });
  
  describe('process()', () => {
    it('should process valid input', async () => {
      const result = await model.process({ /* test input */ });
      expect(result.success).toBe(true);
      expect(result.metrics.confidence).toBeGreaterThan(0);
    });
    
    it('should handle invalid input', async () => {
      const result = await model.process(null);
      expect(result.success).toBe(false);
    });
  });
  
  describe('validate()', () => {
    it('should validate input structure', () => {
      expect(model.validate({ /* valid input */ })).toBe(true);
      expect(model.validate({ /* invalid input */ })).toBe(false);
    });
  });
});
```

## Implementation Checklist

- [ ] Create model directory with standard structure
- [ ] Implement types and interfaces
- [ ] Define constants and configuration
- [ ] Implement core functionality
- [ ] Write comprehensive tests
- [ ] Document usage and examples
- [ ] Add to model registry
- [ ] Update integration tests

## Best Practices

1. **Type Safety**: Use TypeScript types extensively
2. **Immutability**: Treat all data as immutable
3. **Error Handling**: Provide meaningful error messages
4. **Testing**: Aim for 100% test coverage
5. **Documentation**: Document all public APIs
6. **Performance**: Profile and optimize critical paths
7. **Logging**: Include debug and error logging
8. **Validation**: Validate all inputs and outputs
