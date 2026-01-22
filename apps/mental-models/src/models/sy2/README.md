# SY2: Universal Schema Mapping

## Overview

**Model Code:** SY2  
**Model Name:** Universal Schema Mapping  
**Transformation:** Synthesis  
**Tier:** 2  

## Description

The Universal Schema Mapping model (SY2) provides a robust framework for mapping and transforming data between different schemas. It enables seamless integration between systems with disparate data structures by defining clear mappings between source and target schemas, supporting complex transformations, and validating data integrity.

## Key Features

- **Flexible Field Mapping**: Map fields between deeply nested structures with custom path specifications
- **Data Transformation**: Apply built-in or custom transformation functions to data during mapping
- **Validation**: Validate data against schema constraints and custom validation rules
- **Automatic Mapping**: Generate initial mappings between similar schemas with configurable confidence thresholds
- **Error Handling**: Comprehensive error reporting with detailed information about mapping issues
- **Extensible**: Add custom transformations and validations as needed

## Usage

### Basic Usage

```typescript
import { createSchemaMapper, createSchemaMapping } from './sy2';

// Create a schema mapper instance
const mapper = createSchemaMapper();

// Define a mapping between schemas
const mapping = createSchemaMapping({
  source: {
    id: 'user-profile',
    name: 'User Profile',
    format: 'json',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
      },
      required: ['firstName', 'lastName', 'email']
    },
  },
  target: {
    id: 'account',
    name: 'Account',
    format: 'json',
    schema: {
      type: 'object',
      properties: {
        name: {
          first: { type: 'string' },
          last: { type: 'string' },
        },
        contact: {
          email: { type: 'string', format: 'email' },
        },
      },
      required: ['name', 'contact']
    },
  },
});

// Define field mappings
mapping.mappings = [
  {
    sourcePath: ['firstName'],
    targetPath: ['name', 'first'],
    confidence: 1.0,
    isRequired: true,
  },
  {
    sourcePath: ['lastName'],
    targetPath: ['name', 'last'],
    confidence: 1.0,
    isRequired: true,
  },
  {
    sourcePath: ['email'],
    targetPath: ['contact', 'email'],
    confidence: 1.0,
    isRequired: true,
  },
];

// Map data from source to target format
const sourceData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
};

mapper.map(sourceData, mapping)
  .then(result => {
    console.log('Mapped data:', result.data);
    // Output:
    // {
    //   name: { first: 'John', last: 'Doe' },
    //   contact: { email: 'john.doe@example.com' }
    // }
  })
  .catch(error => {
    console.error('Mapping failed:', error);
  });
```

### Automatic Mapping Generation

```typescript
// Generate a mapping between two schemas automatically
const sourceSchema = {
  user: {
    name: 'string',
    email_address: 'string',
    age: 'number',
  },
};

const targetSchema = {
  person: {
    fullName: 'string',
    contact: {
      email: 'string',
    },
    age: 'integer',
  },
};

mapper.generateMapping(sourceSchema, targetSchema, {
  confidenceThreshold: 0.7,
  includeExamples: true,
})
  .then(mapping => {
    console.log('Generated mapping:', mapping);
    // The mapping will include automatically detected field correspondences
  });
```

### Custom Transformations

```typescript
// Add custom transformations
mapping.mappings.push({
  sourcePath: ['createdAt'],
  targetPath: ['meta', 'createdAt'],
  transformation: (value) => new Date(value).toISOString(),
  confidence: 1.0,
  isRequired: false,
});
```

## API Reference

### `createSchemaMapper(config?)`

Creates a new schema mapper instance.

**Parameters:**
- `config` (Optional): Configuration object for the mapper

**Returns:** A schema mapper instance with the following methods:
- `map(sourceData, mapping, options)`: Maps data from source to target schema
- `validateMapping(mapping)`: Validates a schema mapping
- `generateMapping(sourceSchema, targetSchema, options)`: Generates a mapping between schemas
- `transformValue(value, transformFn)`: Applies a transformation to a value

### `createSchemaMapping(overrides?)`

Creates a new schema mapping with default values.

**Parameters:**
- `overrides` (Optional): Object with properties to override the defaults

**Returns:** A new schema mapping object

## Error Handling

The mapper provides detailed error information in the mapping result:

```typescript
{
  data: { /* mapped data */ },
  stats: { /* mapping statistics */ },
  errors: [
    {
      type: 'missing' | 'invalid' | 'transformation',
      field: 'field.path',
      message: 'Error message',
      sourceValue: 'original value',
    },
  ],
  warnings: ['warning message'],
  meta: { /* metadata */ },
}
```

## Configuration

### Mapper Options

- `validate` (boolean): Whether to validate the mapping (default: `true`)
- `includeMetadata` (boolean): Whether to include metadata in the output (default: `false`)
- `strict` (boolean): Whether to fail on missing required fields (default: `true`)
- `defaultValue`: Default value for missing fields (default: `null`)

### Mapping Generation Options

- `confidenceThreshold` (number): Minimum confidence score for automatic field matching (0-1, default: 0.7)
- `includeExamples` (boolean): Whether to include example values in the generated mapping (default: `false`)

## Best Practices

1. **Start with Automatic Mapping**: Use `generateMapping()` to get a starting point, then refine the results
2. **Validate Early**: Always validate your mappings before using them in production
3. **Use Meaningful Field Names**: This improves the accuracy of automatic mapping
4. **Add Validation Rules**: Define validation rules to ensure data integrity
5. **Handle Errors Gracefully**: Always check the `errors` array in the mapping result

## Related Models

- **SY1**: Schema Integration Framework
- **CO1**: Data Composition
- **DE1**: Structural Decomposition

## Changelog

### 1.0.0 (2023-10-23)
- Initial release

## License

MIT
