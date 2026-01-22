# DE1: Structural Decomposition

## Overview

**Model Code:** DE1  
**Model Name:** Structural Decomposition  
**Transformation:** Decomposition  
**Tier:** 1  

## Description

The Structural Decomposition model (DE1) breaks down complex systems or problems into their fundamental components and relationships. It provides a systematic approach to understanding the building blocks of any system and how they interact.

## Features

- **Hierarchical Breakdown**: Decomposes systems into nested components
- **Relationship Mapping**: Identifies and classifies relationships between components
- **Interface Definition**: Specifies how components interact
- **Dependency Analysis**: Identifies dependencies and potential points of failure
- **Visualization Support**: Facilitates the creation of system architecture diagrams

## Installation

```bash
# Using npm
npm install @hummbl/models-de1

# Using yarn
yarn add @hummbl/models-de1
```

## Usage

### Basic Usage

```typescript
import { createStructuralDecomposition } from '@hummbl/models-de1';

const system = {
  name: 'E-commerce Platform',
  description: 'Online shopping platform',
  components: [
    {
      id: 'frontend',
      name: 'Frontend Application',
      type: 'user-interface'
    },
    {
      id: 'api',
      name: 'API Gateway',
      type: 'service'
    }
  ]
};

const decomposition = createStructuralDecomposition({
  system,
  maxDepth: 3,
  includeRelationships: true
});

console.log(decomposition.getComponents());
console.log(decomposition.getRelationships());
```

## API Reference

### `createStructuralDecomposition(config)`

Creates a new structural decomposition instance.

**Parameters:**
- `config`: Configuration object
  - `system`: The system to decompose
  - `maxDepth`: Maximum depth of decomposition
  - `includeRelationships`: Whether to analyze relationships

**Returns:** A `StructuralDecomposition` instance.

## Validation Criteria

This model is considered successfully implemented when it can:

1. **Break Down Systems**: Decompose a complex system into at least 3 levels of components
2. **Identify Relationships**: Correctly identify and classify relationships between components
3. **Handle Circular Dependencies**: Detect and handle circular dependencies appropriately
4. **Generate Visualizations**: Output data suitable for system architecture visualization
5. **Calculate Metrics**: Provide metrics like coupling, cohesion, and complexity scores

## Examples

### Example: Decomposing a Web Application

```typescript
const webApp = {
  name: 'Content Management System',
  description: 'A platform for managing website content',
  components: [
    {
      id: 'ui',
      name: 'User Interface',
      type: 'frontend',
      components: [
        { id: 'dashboard', name: 'Admin Dashboard', type: 'module' },
        { id: 'editor', name: 'Content Editor', type: 'module' }
      ]
    },
    {
      id: 'api',
      name: 'API Layer',
      type: 'backend',
      components: [
        { id: 'auth', name: 'Authentication Service', type: 'service' },
        { id: 'content', name: 'Content Service', type: 'service' }
      ]
    }
  ]
};

const decomposition = createStructuralDecomposition({
  system: webApp,
  maxDepth: 3
});

// Get all components at a specific level
const topLevelComponents = decomposition.getComponentsAtLevel(1);

// Get dependencies of a specific component
const dependencies = decomposition.getDependencies('content');
```

## Development

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

## License

MIT
