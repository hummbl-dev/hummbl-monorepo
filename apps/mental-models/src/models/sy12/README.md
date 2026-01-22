# SY12: Synthesis Model

## Overview
This model implements advanced synthesis capabilities for combining multiple mental models into cohesive solutions. It provides a structured way to integrate insights from various perspectives and generate comprehensive analyses.

## Installation

```bash
npm install @hummbl/models
```

## Usage

```typescript
import { createSY12Model } from '@hummbl/models/sy12';

// Create an instance of the model
const model = createSY12Model({
  telemetryEnabled: true,
  options: {
    maxDepth: 3,
    includeExamples: true,
    includeReasoning: true,
    confidenceThreshold: 0.7
  }
});

// Synthesize multiple model outputs
const result = await model.synthesize({
  models: [
    {
      type: 'perspective',
      id: 'p1',
      analysis: 'Analysis from perspective model',
      confidence: 0.85,
      metadata: {
        source: 'user-input',
        timestamp: new Date().toISOString()
      }
    },
    {
      type: 'inversion',
      id: 'i1',
      analysis: 'Analysis from inversion model',
      confidence: 0.78,
      metadata: {
        source: 'api-call',
        timestamp: new Date().toISOString()
      }
    }
  ],
  context: {
    userId: 'user123',
    environment: 'production',
    requestId: 'req_' + Math.random().toString(36).substr(2, 9)
  },
  options: {
    depth: 2,
    includeExamples: true,
    includeIssues: true,
    includeRelated: true
  },
  metadata: {
    priority: 'high',
    tags: ['analysis', 'synthesis']
  }
});

console.log('Synthesis Result:', result.synthesizedResult);
console.log('Key Insights:', result.insights);
console.log('Confidence:', result.confidence);
```

## API Reference

### createSY12Model(config?)

Creates a new instance of the SY12 model.

**Parameters:**
- `config` (Optional): Configuration object
  - `id` (string): Unique identifier for this model instance (default: 'sy12')
  - `name` (string): Display name of the model (default: 'SY12 Synthesis Model')
  - `version` (string): Version of the model (default: '1.0.0')
  - `eventEmitter` (EventEmitter): Custom event emitter (default: new EventEmitter())
  - `telemetryEnabled` (boolean): Whether to enable telemetry (default: false)
  - `logger` (object): Custom logger (default: console)
  - `options` (object): Model-specific options
    - `maxDepth` (number): Maximum depth for synthesis (default: 3)
    - `includeExamples` (boolean): Whether to include examples in the output (default: true)
    - `includeReasoning` (boolean): Whether to include detailed reasoning (default: true)
    - `confidenceThreshold` (number): Confidence threshold (0-1) for including results (default: 0.7)

**Returns:**
An object with the following properties:
- `id` (string): The model ID
- `name` (string): The model name
- `version` (string): The model version
- `synthesize` (function): The synthesis function

### synthesize(input)

Synthesizes multiple model outputs into a cohesive result.

**Parameters:**
- `input` (object): The input to synthesize
  - `models` (any[]): Array of model outputs to synthesize
  - `context` (object, optional): Additional context for the synthesis
  - `options` (object, optional): Options for this synthesis operation
    - `depth` (number, optional): Depth of synthesis to perform
    - `includeExamples` (boolean, optional): Whether to include examples
    - `includeIssues` (boolean, optional): Whether to include potential issues
    - `includeRelated` (boolean, optional): Whether to include related models
  - `metadata` (object, optional): Additional metadata

**Returns:**
A Promise that resolves to a synthesis result object with the following structure:
- `id` (string): Unique identifier for this synthesis
- `synthesizedResult` (any): The synthesized result
- `insights` (string[]): Key insights from the synthesis
- `confidence` (number): Confidence score (0-1)
- `metadata` (object): Additional metadata including timing and telemetry

## Events

The model emits the following events:

### synthesisComplete
Emitted when synthesis is successfully completed.

**Event Data:**
- `requestId` (string): Unique ID for the request
- `result` (object): The synthesis result
- `timestamp` (string): ISO timestamp of when the event was emitted

### synthesisError
Emitted when an error occurs during synthesis.

**Event Data:**
- `requestId` (string): Unique ID for the request
- `error` (string): Error message
- `timestamp` (string): ISO timestamp of when the error occurred

## Testing

Run tests with:

```bash
npm test sy12
```

## License

MIT
