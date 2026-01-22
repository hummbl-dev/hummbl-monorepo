# DE2: Cognitive Tracing

## Overview

**Model Code:** DE2  
**Model Name:** Cognitive Tracing  
**Transformation:** Decomposition  
**Tier:** 1  

## Description

The Cognitive Tracing model (DE2) is designed to trace reasoning paths through decomposed cognitive steps, mapping thought sequences from input to output with annotated decision points. This model is particularly useful for understanding and analyzing complex reasoning processes by breaking them down into discrete, traceable steps.

## Features

- **Step-by-step Tracing**: Tracks the progression of thoughts and decisions through a reasoning process
- **Decision Point Analysis**: Identifies and analyzes key decision points in the reasoning flow
- **Confidence Scoring**: Assigns confidence levels to each step in the reasoning process
- **Relationship Mapping**: Shows how different steps in the reasoning process are connected
- **Visualization Support**: Provides structured data that can be used to visualize reasoning paths

## Installation

```bash
# Using npm
npm install @hummbl/models-de2

# Using yarn
yarn add @hummbl/models-de2
```

## Usage

### Basic Usage

```typescript
import { createCognitiveTracingModel } from '@hummbl/models-de2';

// Create a new instance of the model
const model = createCognitiveTracingModel();

// Trace the cognitive steps for a given input
const result = await model.traceSteps({
  input: 'How can we improve user engagement in our mobile app?',
  maxDepth: 3,
  maxBreadth: 2,
  minConfidence: 0.7
});

// Get a human-readable explanation of the trace
const explanation = model.explainTrace(result.trace);
console.log(explanation);
```

### Advanced Usage

```typescript
import { 
  createCognitiveTracingModel,
  createCognitiveStep,
  createDecisionPoint,
  createCognitiveTrace
} from '@hummbl/models-de2';

// Create a custom trace
const { trace } = createCognitiveTrace('Initial input');

// Add steps manually
const step1 = createCognitiveStep('Initial analysis', 'observation');
const step2 = createCognitiveStep('Identify key factors', 'inference', [step1.id]);
const step3 = createCognitiveStep('Evaluate options', 'evaluation', [step2.id]);

trace.steps = [step1, step2, step3];

// Add a decision point
const decisionPoint = createDecisionPoint(
  'Choose implementation approach',
  [
    { id: 'opt1', description: 'Gamification' },
    { id: 'opt2', description: 'Personalized content' },
    { id: 'opt3', description: 'Social features' }
  ],
  step3.id,
  'opt1'
);

trace.decisionPoints.push(decisionPoint);

// Continue the trace with the model
const model = createCognitiveTracingModel();
const continuedResult = await model.continueTrace({
  trace,
  fromStepId: step3.id,
  maxDepth: 2
});
```

## API Reference

### `createCognitiveTracingModel(config?)`

Creates a new instance of the CognitiveTracingModel.

**Parameters:**
- `config` (optional): Configuration object with the following properties:
  - `defaultMaxDepth`: Maximum depth of the trace (default: 5)
  - `defaultMaxBreadth`: Maximum breadth at each decision point (default: 3)
  - `minConfidenceThreshold`: Minimum confidence threshold for steps (default: 0.6)
  - `maxTraceDurationMs`: Maximum duration for tracing in milliseconds (default: 30000)

**Returns:** An instance of `CognitiveTracingModel`.

### `CognitiveTracingModel`

#### `traceSteps(params)`

Traces the cognitive steps for a given input.

**Parameters:**
- `params`: Object containing:
  - `input`: The input to process (string)
  - `maxDepth?`: Maximum depth of the trace (default: model's default)
  - `maxBreadth?`: Maximum breadth at each decision point (default: model's default)
  - `minConfidence?`: Minimum confidence threshold for steps (default: model's default)
  - `context?`: Additional context for the trace

**Returns:** A `Promise` that resolves to a `CognitiveTraceResult` object.

#### `continueTrace(params)`

Continues an existing trace from a specific step.

**Parameters:**
- `params`: Object containing:
  - `trace`: The existing `CognitiveTrace`
  - `fromStepId`: ID of the step to continue from
  - `maxDepth?`: Maximum depth for the continuation

**Returns:** A `Promise` that resolves to a `CognitiveTraceResult` object.

#### `analyzeDecisionPoint(params)`

Analyzes a decision point in detail.

**Parameters:**
- `params`: Object containing:
  - `trace`: The `CognitiveTrace` containing the decision point
  - `decisionPointId`: ID of the decision point to analyze

**Returns:** A `Promise` that resolves to an analysis object.

#### `explainTrace(trace)`

Generates a human-readable explanation of a trace.

**Parameters:**
- `trace`: The `CognitiveTrace` to explain

**Returns:** A string containing the explanation.

## Validation Criteria

This model is considered successfully implemented when it can:

1. **Trace Reasoning Paths**: Successfully trace at least 3 distinct multi-step reasoning chains with clear decision points.
2. **Annotate Decision Points**: Accurately identify and annotate all major decision points in the reasoning process.
3. **Maintain Context**: Preserve context between steps to ensure coherent reasoning flow.
4. **Handle Branching**: Properly handle and represent branching decision paths.
5. **Calculate Confidence**: Assign meaningful confidence scores to each step and decision.

## Examples

### Example 1: Basic Tracing

```typescript
const model = createCognitiveTracingModel();
const result = await model.traceSteps({
  input: 'Should we implement feature X or feature Y first?',
  maxDepth: 4
});

console.log(`Trace completed with ${result.trace.steps.length} steps`);
console.log(`Found ${result.trace.decisionPoints.length} decision points`);
```

### Example 2: Analyzing a Decision Point

```typescript
// Assuming we have a trace with decision points
const decisionPoint = trace.decisionPoints[0];
const analysis = await model.analyzeDecisionPoint({
  trace,
  decisionPointId: decisionPoint.id
});

console.log(`Analysis for decision: ${decisionPoint.decision}`);
analysis.alternatives.forEach(alt => {
  console.log(`- ${alt.optionId}: ${alt.pros.length} pros, ${alt.cons.length} cons`);
});
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
npm run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
