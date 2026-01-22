# RE2: Feedback Scaling

## Overview

**Model Code:** RE2  
**Model Name:** Feedback Scaling  
**Transformation:** Recursion  
**Tier:** 1  

## Description

The Feedback Scaling model (RE2) scales feedback mechanisms across multiple recursive levels, aggregating learning from nested iterations. This model is particularly effective for complex systems where feedback at different levels of abstraction needs to be integrated and balanced.

## Features

- **Multi-level Feedback**: Processes feedback at different levels of abstraction
- **Aggregation**: Combines feedback from multiple sources and levels
- **Weighting**: Applies appropriate weights to different feedback sources
- **Adaptation**: Adjusts behavior based on feedback patterns
- **Visualization**: Provides insights into feedback patterns across levels

## Installation

```bash
# Using npm
npm install @hummbl/models-re2

# Using yarn
yarn add @hummbl/models-re2
```

## Usage

### Basic Usage

```typescript
import { createFeedbackScaler } from '@hummbl/models-re2';

// Create a feedback scaler instance
const scaler = createFeedbackScaler({
  levels: [
    { id: 'syntax', weight: 0.3 },
    { id: 'semantics', weight: 0.5 },
    { id: 'pragmatics', weight: 0.2 }
  ],
  aggregationMethod: 'weighted',
  learningRate: 0.1,
  maxIterations: 100
});

// Process feedback from different levels
scaler.addFeedback({
  level: 'syntax',
  score: 0.8,
  message: 'Minor syntax issues found',
  metadata: { line: 42, column: 15 }
});

// Get aggregated feedback
const analysis = scaler.analyze();
console.log('Overall score:', analysis.overallScore);
console.log('Key insights:', analysis.insights);
```

## API Reference

### `createFeedbackScaler(config)`

Creates a new feedback scaling instance.

**Parameters:**
- `config`: Configuration object
  - `levels`: Array of level definitions with id and weight
  - `aggregationMethod`: Method for combining feedback ('weighted', 'average', 'min', 'max')
  - `learningRate`: How quickly to adapt to new feedback (0-1)
  - `maxIterations`: Maximum number of iterations for convergence

**Returns:** A feedback scaler instance with methods for adding feedback and getting analysis.

## Validation Criteria

This model is considered successfully implemented when it can:

1. **Process Multi-level Feedback**: Handle feedback from at least 3 distinct levels
2. **Aggregate Effectively**: Combine feedback using weighted averaging
3. **Detect Patterns**: Identify recurring patterns in feedback
4. **Provide Actionable Insights**: Generate clear recommendations
5. **Scale Efficiently**: Handle increasing volumes of feedback without performance degradation

## Examples

### Example: Code Review Feedback

```typescript
const codeReviewScaler = createFeedbackScaler({
  levels: [
    { id: 'style', weight: 0.2 },
    { id: 'correctness', weight: 0.5 },
    { id: 'performance', weight: 0.3 }
  ]
});

// Add feedback from different reviewers
codeReviewScaler.addFeedback([
  {
    level: 'style',
    score: 0.9,
    message: 'Consistent indentation and naming',
    source: 'reviewer1'
  },
  {
    level: 'correctness',
    score: 0.7,
    message: 'Edge case not handled in calculateTotal()',
    source: 'reviewer2',
    metadata: { file: 'cart.js', function: 'calculateTotal' }
  },
  {
    level: 'performance',
    score: 0.6,
    message: 'Potential N+1 query issue',
    source: 'reviewer3',
    metadata: { file: 'products.js', line: 127 }
  }
]);

// Get analysis
const review = codeReviewScaler.analyze();

console.log('Overall code quality:', review.overallScore);
console.log('Areas needing attention:', 
  review.insights.filter(i => i.priority === 'high').map(i => i.message));
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
