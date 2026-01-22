# DE20: Deconstruction Model

## Overview
This model implements the Deconstruction mental model by breaking down complex systems into their fundamental components and relationships.

## Installation

```bash
npm install @hummbl/models
```

## Usage

```typescript
import { createDE20Model } from '@hummbl/models/de20';

// Create an instance of the model
const model = createDE20Model({
  telemetryEnabled: true
});

// Analyze a system by deconstructing it
const result = await model.analyze({
  system: {
    // The system to deconstruct (can be any value)
    name: 'Example System',
    version: '1.0.0',
    components: ['UI', 'API', 'Database'],
    config: {
      debug: true,
      logLevel: 'info'
    }
  },
  context: {
    // Additional context can be provided here
    userId: 'user123',
    environment: 'development'
  },
  options: {
    // Model-specific options
    maxDepth: 3,
    includeReasoning: true
  }
});

// Use the deconstructed components and relationships
console.log('Components:', result.analysis.components);
console.log('Relationships:', result.analysis.relationships);
console.log('Insights:', result.analysis.insights);
```

## API Reference

### createDE20Model(config?)

Creates a new instance of the DE20 model.

**Parameters:**
- `config` (Optional): Configuration object
  - `name` (string): Name of the model instance (default: 'DE20')
  - `version` (string): Version of the model (default: '1.0.0')
  - `eventEmitter` (EventEmitter): Custom event emitter (default: new EventEmitter())
  - `telemetryEnabled` (boolean): Whether to enable telemetry (default: false)
  - `logger` (object): Custom logger (default: console)

**Returns:**
An object with the following properties:
- `id` (string): The model ID
- `name` (string): The model name
- `version` (string): The model version
- `analyze` (function): The analysis function

### analyze(input)

Deconstructs the input system into its fundamental components and relationships.

**Parameters:**
- `input` (object): The input to analyze
  - `system` (any): The system to deconstruct (object, array, or primitive)
  - `context` (object, optional): Additional context
  - `options` (object, optional): Analysis options
    - `includeReasoning` (boolean): Whether to include detailed reasoning
    - `maxDepth` (number): Maximum depth to deconstruct
    - `includeIssues` (boolean): Whether to include potential issues

**Returns:**
A Promise that resolves to a deconstruction result object.

## Events

The model emits the following events:

### analysisComplete
Emitted when analysis is successfully completed.

**Event Data:**
- `requestId` (string): Unique ID for the request
- `result` (object): The deconstruction result
- `timestamp` (string): ISO timestamp of when the event was emitted

### analysisError
Emitted when an error occurs during analysis.

**Event Data:**
- `requestId` (string): Unique ID for the request
- `error` (string): Error message
- `timestamp` (string): ISO timestamp of when the error occurred

## Testing

Run tests with:

```bash
npm test de20
```

## License

MIT
