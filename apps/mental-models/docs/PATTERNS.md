# HUMMBL Code Patterns

This document catalogs proven patterns used throughout the HUMMBL codebase. When building new features, reference these patterns for consistency.

## Table of Contents
1. [Model Data Handling](#model-data-handling)
2. [Transformation Logic](#transformation-logic)
3. [Component Patterns](#component-patterns)
4. [Utility Functions](#utility-functions)
5. [Type Definitions](#type-definitions)
6. [Error Handling](#error-handling)

---

## Model Data Handling

### Loading Model Data

```typescript
// Pattern: Static JSON import
import p1Model from '@/public/models/P1.json';

// Pattern: Dynamic import (lazy loading)
const loadModel = async (code: string) => {
  const module = await import(`@/public/models/${code}.json`);
  return module.default;
};

// Pattern: Typed model loading with validation
import { z } from 'zod';

const ModelSchema = z.object({
  code: z.string(),
  name: z.string(),
  transformation: z.enum(['P', 'IN', 'CO', 'DE', 'RE', 'SY']),
  definition: z.string(),
  // ... other fields
});

const loadModelSafe = async (code: string): Promise<Model> => {
  const data = await import(`@/public/models/${code}.json`);
  return ModelSchema.parse(data.default);
};
```

### Model Code Parsing

```typescript
// Pattern: Extract transformation and number from code
const parseModelCode = (code: string) => {
  const match = code.match(/^(P|IN|CO|DE|RE|SY)(\d+)$/);
  if (!match) throw new Error(`Invalid model code: ${code}`);
  
  return {
    transformation: match[1] as TransformationCode,
    number: parseInt(match[2], 10),
    code: code
  };
};

// Usage
const { transformation, number } = parseModelCode('P1'); 
// => { transformation: 'P', number: 1, code: 'P1' }
```

### Model Filtering

```typescript
// Pattern: Filter models by criteria
const filterModels = (models: Model[], criteria: {
  transformation?: TransformationCode;
  tier?: number;
  category?: string;
  searchTerm?: string;
}) => {
  return models.filter(model => {
    if (criteria.transformation && model.transformation !== criteria.transformation) {
      return false;
    }
    if (criteria.tier && model.tier !== criteria.tier) {
      return false;
    }
    if (criteria.category && !modelHasCategory(model, criteria.category)) {
      return false;
    }
    if (criteria.searchTerm && !modelMatchesSearch(model, criteria.searchTerm)) {
      return false;
    }
    return true;
  });
};

// Helper functions
const modelHasCategory = (model: Model, category: string) => {
  return [
    model.category.primary,
    model.category.secondary,
    model.category.tertiary
  ].includes(category);
};

const modelMatchesSearch = (model: Model, term: string) => {
  const searchable = [
    model.name,
    model.definition,
    model.code
  ].join(' ').toLowerCase();
  
  return searchable.includes(term.toLowerCase());
};
```

---

## Transformation Logic

### Transformation Metadata

```typescript
// Pattern: Transformation configuration object
export const TRANSFORMATIONS = {
  P: {
    code: 'P' as const,
    name: 'Perspective',
    color: '#3B82F6',      // Blue
    description: 'Shift viewpoint and identity',
    icon: '👁️',
    modelRange: [1, 20]
  },
  IN: {
    code: 'IN' as const,
    name: 'Inversion',
    color: '#8B5CF6',      // Purple
    description: 'Flip problem on its head',
    icon: '🔄',
    modelRange: [1, 20]
  },
  // ... other transformations
} as const;

// Helper to get transformation config
const getTransformation = (code: TransformationCode) => {
  return TRANSFORMATIONS[code];
};
```

### Transformation Chains

```typescript
// Pattern: Represent multi-step transformation sequences
type TransformationChain = {
  name: string;
  steps: TransformationCode[];
  useCase: string;
  example: string;
};

const PROVEN_CHAINS: TransformationChain[] = [
  {
    name: 'Systems Design',
    steps: ['P', 'DE', 'CO'],
    useCase: 'Breaking down complex systems',
    example: 'Designing microservice architecture'
  },
  {
    name: 'Problem Reframing',
    steps: ['IN', 'P', 'SY'],
    useCase: 'Finding non-obvious solutions',
    example: 'Solving wicked problems'
  }
];

// Execute transformation chain
const applyChain = (problem: Problem, chain: TransformationCode[]) => {
  return chain.reduce((result, transformation) => {
    return applyTransformation(result, transformation);
  }, problem);
};
```

---

## Component Patterns

### Model Card Component

```typescript
// Pattern: Composable card component
interface ModelCardProps {
  model: Model;
  variant?: 'compact' | 'detailed';
  onClick?: () => void;
}

export const ModelCard: FC<ModelCardProps> = ({ 
  model, 
  variant = 'compact',
  onClick 
}) => {
  const transformation = getTransformation(model.transformation);
  
  return (
    <div 
      className={`model-card model-card--${variant}`}
      onClick={onClick}
      style={{ borderColor: transformation.color }}
    >
      <div className="model-card__header">
        <span className="model-card__code">{model.code}</span>
        <TransformationBadge code={model.transformation} />
      </div>
      
      <h3 className="model-card__name">{model.name}</h3>
      
      {variant === 'detailed' && (
        <p className="model-card__definition">
          {model.definition}
        </p>
      )}
      
      <div className="model-card__footer">
        <TierBadge tier={model.tier} />
        <CategoryTag category={model.category.primary} />
      </div>
    </div>
  );
};
```

### Transformation Badge

```typescript
// Pattern: Colored badge showing transformation type
interface TransformationBadgeProps {
  code: TransformationCode;
  showName?: boolean;
}

export const TransformationBadge: FC<TransformationBadgeProps> = ({ 
  code, 
  showName = false 
}) => {
  const transformation = getTransformation(code);
  
  return (
    <span 
      className="transformation-badge"
      style={{ 
        backgroundColor: transformation.color,
        color: '#fff'
      }}
    >
      {transformation.icon} {code}
      {showName && ` ${transformation.name}`}
    </span>
  );
};
```

### Loading States

```typescript
// Pattern: Suspense-based loading
import { Suspense, lazy } from 'react';

const ModelPage = lazy(() => import('./ModelPage'));

export const ModelRoute = () => (
  <Suspense fallback={<ModelLoadingSpinner />}>
    <ModelPage />
  </Suspense>
);

// Pattern: Custom loading hook
const useModelData = (code: string) => {
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    loadModel(code)
      .then(setModel)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [code]);
  
  return { model, loading, error };
};
```

---

## Utility Functions

### Model Code Utilities

```typescript
// Pattern: Model code generation and validation
export const generateModelCode = (
  transformation: TransformationCode, 
  number: number
): string => {
  if (number < 1 || number > 20) {
    throw new Error(`Model number must be 1-20, got ${number}`);
  }
  return `${transformation}${number}`;
};

export const isValidModelCode = (code: string): boolean => {
  return /^(P|IN|CO|DE|RE|SY)(1[0-9]|20|[1-9])$/.test(code);
};

export const getAllModelCodes = (): string[] => {
  const transformations: TransformationCode[] = ['P', 'IN', 'CO', 'DE', 'RE', 'SY'];
  const codes: string[] = [];
  
  for (const t of transformations) {
    for (let n = 1; n <= 20; n++) {
      codes.push(generateModelCode(t, n));
    }
  }
  
  return codes; // Returns all 120 codes
};
```

### Formatting Utilities

```typescript
// Pattern: Format model data for display
export const formatModelName = (name: string): string => {
  // Capitalize each word
  return name.replace(/\b\w/g, char => char.toUpperCase());
};

export const formatModelDefinition = (definition: string, maxLength: number = 150): string => {
  if (definition.length <= maxLength) return definition;
  return definition.slice(0, maxLength).trim() + '...';
};

export const formatTransformationName = (code: TransformationCode): string => {
  return TRANSFORMATIONS[code].name;
};
```

### Search Utilities

```typescript
// Pattern: Fuzzy search implementation
export const fuzzyMatch = (text: string, query: string): boolean => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }
  
  return queryIndex === queryLower.length;
};

// Pattern: Search ranking
export const rankSearchResults = (models: Model[], query: string): Model[] => {
  return models
    .map(model => ({
      model,
      score: calculateSearchScore(model, query)
    }))
    .sort((a, b) => b.score - a.score)
    .map(result => result.model);
};

const calculateSearchScore = (model: Model, query: string): number => {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // Exact match in code or name gets highest score
  if (model.code.toLowerCase() === queryLower) score += 100;
  if (model.name.toLowerCase().includes(queryLower)) score += 50;
  
  // Match in definition
  if (model.definition.toLowerCase().includes(queryLower)) score += 25;
  
  // Match in categories
  if (modelHasCategory(model, queryLower)) score += 10;
  
  return score;
};
```

---

## Type Definitions

### Core Domain Types

```typescript
// Pattern: Exhaustive transformation enum
export type TransformationCode = 'P' | 'IN' | 'CO' | 'DE' | 'RE' | 'SY';

// Pattern: Strict tier enum
export type Tier = 1 | 2 | 3 | 4;

// Pattern: Model interface
export interface Model {
  code: string;
  name: string;
  transformation: TransformationCode;
  tier: Tier;
  category: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  definition: string;
  examples: Example[];
  bibliography: Reference[];
  metadata: {
    lastUpdated: Date;
    published: boolean;
    version: string;
  };
}

// Pattern: Example structure
export interface Example {
  title: string;
  description: string;
  domain: string;        // "Business", "Engineering", "Science"
  transformationApplied: TransformationCode[];
}

// Pattern: Bibliography reference
export interface Reference {
  authors: string[];
  title: string;
  year: number;
  source: string;
  doi?: string;
  url?: string;
}
```

### Component Prop Types

```typescript
// Pattern: Extend HTML attributes
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

// Pattern: Discriminated union for variants
type CardVariant = 
  | { variant: 'compact'; showDetails?: never }
  | { variant: 'detailed'; showDetails: boolean };

interface CardProps extends CardVariant {
  model: Model;
}
```

### API Response Types

```typescript
// Pattern: Generic API response wrapper
export interface APIResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

// Pattern: Search results
export interface SearchResults {
  models: Model[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
}

// Usage
type ModelSearchResponse = APIResponse<SearchResults>;
```

---

## Error Handling

### Custom Error Classes

```typescript
// Pattern: Domain-specific errors
export class ModelNotFoundError extends Error {
  constructor(public code: string) {
    super(`Model not found: ${code}`);
    this.name = 'ModelNotFoundError';
  }
}

export class InvalidTransformationError extends Error {
  constructor(public transformation: string) {
    super(`Invalid transformation: ${transformation}`);
    this.name = 'InvalidTransformationError';
  }
}
```

### Error Boundaries

```typescript
// Pattern: React error boundary for features
class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Model error:', error, errorInfo);
    // Log to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-message">
          <h2>Unable to load model</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Async Error Handling

```typescript
// Pattern: Safe async operation
const safeLoadModel = async (code: string): Promise<Result<Model, Error>> => {
  try {
    const model = await loadModel(code);
    return { ok: true, value: model };
  } catch (error) {
    return { 
      ok: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
};

// Pattern: Result type for error handling
type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

// Usage
const result = await safeLoadModel('P1');
if (result.ok) {
  console.log(result.value); // Model
} else {
  console.error(result.error); // Error
}
```

---

## Anti-Patterns to Avoid

### ❌ Don't: Mutate state directly
```typescript
// BAD
model.name = 'New Name';
setModels([...models]);

// GOOD
const updatedModel = { ...model, name: 'New Name' };
setModels(models.map(m => m.code === model.code ? updatedModel : m));
```

### ❌ Don't: Use generic catch blocks
```typescript
// BAD
try {
  await loadModel(code);
} catch (e) {
  console.log('Error');
}

// GOOD
try {
  await loadModel(code);
} catch (error) {
  if (error instanceof ModelNotFoundError) {
    // Handle missing model
  } else if (error instanceof ValidationError) {
    // Handle validation failure
  } else {
    // Log unexpected error
    throw error;
  }
}
```

### ❌ Don't: Create tight coupling
```typescript
// BAD - Direct dependency on specific implementation
import { P1Model } from './P1';

// GOOD - Generic interface
const model = await loadModel('P1');
```

---

**Remember:** These patterns exist to maintain consistency and quality across the HUMMBL codebase. When in doubt, reference this document before inventing new patterns.
