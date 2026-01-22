# CO1: Syntactic Binding Model

## Overview
The Syntactic Binding model (CO1) provides a compositional grammar for model interlinkage, enabling the definition and management of relationships between different components in a system. This model is part of the HUMMBL framework's Composition transformation category.

## Key Features

- **Declarative Binding Definition**: Define relationships between components using a simple, declarative syntax
- **Type-Safe API**: Full TypeScript support with comprehensive type definitions
- **Built-in Validation**: Automatic validation of bindings against constraints
- **Pattern-Based Approach**: Reusable binding patterns for common architectural styles
- **Flexible Configuration**: Customizable validation rules and binding behaviors
- **Extensible Architecture**: Easy to extend with custom binding types and constraints

## Installation

```bash
npm install @hummbl/models-co1
```

## Usage

### Basic Example

```typescript
import { createSyntacticBindingModel, BindingType } from '@hummbl/models-co1';

// Create a new instance of the binding model
const model = createSyntacticBindingModel();

// Define components to bind
const components = [
  { componentId: 'data-source', role: 'source', isRequired: true },
  { componentId: 'data-processor', role: 'processor', isRequired: true },
  { componentId: 'data-sink', role: 'sink', isRequired: true },
];

// Create a binding
const binding = model.createBinding({
  type: BindingType.SEQUENTIAL,
  components,
  tags: ['data-pipeline', 'example'],
});

// Apply the binding
const isApplied = await model.applyBinding(binding);
console.log(`Binding applied: ${isApplied}`);
```

### Using Built-in Patterns

```typescript
// List available patterns
const patterns = model.listPatterns();
console.log('Available patterns:', patterns.map(p => p.name));

// Get a specific pattern
const pipelinePattern = model.getPattern('pipeline');
if (pipelinePattern) {
  // Create a binding based on the pattern
  const pipelineBinding = model.createBinding({
    ...pipelinePattern.template,
    components: [
      { componentId: 'file-reader', role: 'source' },
      { componentId: 'data-transformer', role: 'processor' },
      { componentId: 'database-writer', role: 'sink' },
    ],
  });
  
  await model.applyBinding(pipelineBinding);
}
```

### Validating Bindings

```typescript
const validation = model.validateBinding({
  binding: {
    type: 'INVALID_TYPE',
    components: [],
  },
  includeSuggestions: true,
});

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  console.log('Suggestions:', validation.suggestions);
}
```

## API Reference

### `createSyntacticBindingModel(config?): SyntacticBindingModel`

Creates a new instance of the Syntactic Binding model.

**Parameters:**
- `config` (optional): Configuration object
  - `maxBindingsPerComponent`: Maximum number of bindings per component (default: 10)
  - `defaultPriority`: Default priority for bindings (default: 5)
  - `enableAutoValidation`: Enable automatic validation (default: true)
  - `strictMode`: Enable strict validation mode (default: false)

**Returns:** A new `SyntacticBindingModel` instance

### `SyntacticBindingModel`

#### `createBinding(params): ModelBinding`

Creates a new binding.

**Parameters:**
- `params`: Binding parameters
  - `type`: Binding type (e.g., 'SEQUENTIAL', 'PUB_SUB')
  - `components`: Array of component references
  - `constraints`: Array of constraints (optional)
  - `direction`: Binding direction (default: 'UNIDIRECTIONAL')
  - `priority`: Binding priority (default: 5)
  - `tags`: Array of tags (optional)
  - `meta`: Metadata (optional)

**Returns:** A new `ModelBinding`

#### `validateBinding(params): ValidationResult`

Validates a binding.

**Parameters:**
- `params`: Validation parameters
  - `binding`: The binding to validate
  - `includeSuggestions`: Include improvement suggestions (default: false)
  - `includeWarnings`: Include warning-level issues (default: true)
  - `context`: Additional context for validation (optional)

**Returns:** A `ValidationResult` object

#### `applyBinding(binding): Promise<boolean>`

Applies a binding to the system.

**Parameters:**
- `binding`: The binding to apply

**Returns:** `true` if the binding was applied successfully, `false` otherwise

#### `removeBinding(bindingId): boolean`

Removes a binding by ID.

**Parameters:**
- `bindingId`: ID of the binding to remove

**Returns:** `true` if the binding was removed, `false` otherwise

#### `registerPattern(pattern): BindingPattern`

Registers a new binding pattern.

**Parameters:**
- `pattern`: The pattern to register

**Returns:** The registered pattern with generated ID

#### `getPattern(patternId): BindingPattern | null`

Gets a pattern by ID.

**Parameters:**
- `patternId`: ID of the pattern to retrieve

**Returns:** The pattern, or `null` if not found

#### `listPatterns(options?): BindingPattern[]`

Lists all registered patterns, optionally filtered by tags.

**Parameters:**
- `options` (optional): Filter options
  - `tags`: Array of tags to filter by

**Returns:** Array of matching patterns

#### `getBinding(bindingId): ModelBinding | null`

Gets a binding by ID.

**Parameters:**
- `bindingId`: ID of the binding to retrieve

**Returns:** The binding, or `null` if not found

#### `listBindings(options?): ModelBinding[]`

Lists all bindings, optionally filtered.

**Parameters:**
- `options` (optional): Filter options
  - `type`: Filter by binding type
  - `tags`: Filter by tags
  - `componentId`: Filter by component ID

**Returns:** Array of matching bindings

#### `suggestBindings(components): ModelBinding[]`

Suggests possible bindings for the given components.

**Parameters:**
- `components`: Array of component references

**Returns:** Array of suggested bindings

#### `optimizeBindings(bindings): ModelBinding[]`

Optimizes a set of bindings by merging or simplifying them.

**Parameters:**
- `bindings`: Array of bindings to optimize

**Returns:** Array of optimized bindings

## Built-in Patterns

The model includes several built-in patterns for common architectural styles:

1. **Pipeline Pattern**
   - ID: `pipeline`
   - Description: Sequential processing of data through multiple components
   - Components: source → processor → sink
   - Use cases: Data transformation, ETL processes

## Best Practices

1. **Use Meaningful Tags**: Tag your bindings with descriptive labels for better organization
2. **Reuse Patterns**: Leverage built-in patterns before creating custom ones
3. **Validate Early**: Enable auto-validation in development to catch issues early
4. **Document Constraints**: Clearly document any custom constraints you add
5. **Monitor Performance**: Be mindful of the number of active bindings in performance-critical scenarios

## Related Models

- **CO2: Conceptual Fusion** - For combining multiple models into a unified representation
- **IN1: Contradiction Mapping** - For identifying and resolving contradictions between models
- **IN2: Error Utilization** - For handling and learning from errors in model interactions

## License

This model is part of the HUMMBL framework and is licensed under the MIT License.
