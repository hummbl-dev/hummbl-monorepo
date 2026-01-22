# RE1: Iterative Refinement

## Overview

**Model Code:** RE1  
**Model Name:** Iterative Refinement  
**Transformation:** Recursion  
**Tier:** 1  

## Description

The Iterative Refinement model (RE1) applies recursive improvement cycles to refine outputs, with each iteration building on previous results using feedback loops. This model is particularly effective for problems where solutions can be gradually improved through successive approximations.

## Features

- **Progressive Enhancement**: Systematically improves solutions over multiple iterations
- **Feedback Integration**: Incorporates feedback from previous iterations
- **Convergence Detection**: Identifies when further iterations provide diminishing returns
- **Quality Metrics**: Tracks improvement metrics across iterations
- **Adaptive Step Sizes**: Adjusts the magnitude of changes based on progress

## Installation

```bash
# Using npm
npm install @hummbl/models-re1

# Using yarn
yarn add @hummbl/models-re1
```

## Usage

### Basic Usage

```typescript
import { createIterativeRefinement } from '@hummbl/models-re1';

// Define a refinement function
const refineSolution = async (currentSolution, iteration, history) => {
  // Implementation that improves the solution
  return {
    solution: /* improved solution */,
    metrics: {
      quality: /* numerical quality metric */,
      improvement: /* improvement over previous */
    }
  };
};

// Create an instance
const refiner = createIterativeRefinement({
  initialSolution: { /* initial state */ },
  refineFn: refineSolution,
  maxIterations: 10,
  minImprovement: 0.01,
  convergenceThreshold: 0.001
});

// Run the refinement process
const result = await refiner.run();

console.log('Best solution:', result.bestSolution);
console.log('Iterations:', result.iteration);
console.log('Final quality:', result.metrics.quality);
```

## API Reference

### `createIterativeRefinement(config)`

Creates a new iterative refinement instance.

**Parameters:**
- `config`: Configuration object
  - `initialSolution`: The starting point for refinement
  - `refineFn`: Async function that improves the solution
  - `maxIterations`: Maximum number of iterations to run
  - `minImprovement`: Minimum improvement required to continue
  - `convergenceThreshold`: Threshold for considering the solution converged

**Returns:** An object with refinement methods.

## Validation Criteria

This model is considered successfully implemented when it can:

1. **Demonstrate Improvement**: Show measurable improvement over at least 3 iterations
2. **Handle Convergence**: Properly detect when further iterations provide minimal benefit
3. **Maintain Stability**: Prevent degradation of solution quality during refinement
4. **Track Progress**: Maintain accurate metrics about the refinement process
5. **Handle Edge Cases**: Gracefully handle cases where no improvement is possible

## Examples

### Example: Text Summarization Refinement

```typescript
const initialSummary = "The quick brown fox jumps over the lazy dog.";

const refiner = createIterativeRefinement({
  initialSolution: {
    text: initialSummary,
    length: initialSummary.length,
    keywords: ['fox', 'dog', 'jumps']
  },
  refineFn: async (current, iteration) => {
    // Simulate refinement by expanding the summary
    const newText = current.text + ` (refined ${iteration} times)`;
    
    return {
      solution: {
        text: newText,
        length: newText.length,
        keywords: [...current.keywords, `iter${iteration}`]
      },
      metrics: {
        quality: 0.5 + (iteration * 0.1), // Simulated improvement
        improvement: 0.1,
        lengthChange: newText.length - current.length
      }
    };
  },
  maxIterations: 5
});

const result = await refiner.run();
console.log('Final summary:', result.bestSolution.text);
console.log('Quality improved by:', 
  ((result.metrics.quality - 0.5) / 0.5 * 100).toFixed(1) + '%');
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
