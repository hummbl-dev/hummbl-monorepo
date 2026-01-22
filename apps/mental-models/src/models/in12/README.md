# IN12: Inversion Model

## Overview
This model implements the Inversion mental model by challenging assumptions and considering the opposite of conventional thinking.

## Installation

```bash
npm install @hummbl/models
```

## Usage

```typescript
import { createIN12Model } from '@hummbl/models/in12';

// Create an instance of the model
const model = createIN12Model({
  telemetryEnabled: true
});

// Analyze some input
const result = await model.analyze({
  input: 'What if the opposite were true?',
  context: {
    // Additional context can be provided here
  },
  options: {
    // Model-specific options
  }
});
```

## API Reference

### createIN12Model(config?)

Creates a new instance of the IN12 model.

**Parameters:**
- `config` (Optional): Configuration object
  - `name` (string): Name of the model instance (default: 'IN12')
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

Analyzes the input using the Inversion model.

**Parameters:**
- `input` (object): The input to analyze
  - `input` (string): The input to analyze
  - `context` (object, optional): Additional context
  - `options` (object, optional): Analysis options
    - `includeReasoning` (boolean): Whether to include detailed reasoning
    - `maxAlternatives` (number): Maximum number of alternatives to generate
    - `includeConfidenceScores` (boolean): Whether to include confidence scores

**Returns:**
A Promise that resolves to an analysis result object.

## Events

The model emits the following events:

### analysisComplete
Emitted when analysis is successfully completed.

**Event Data:**
- `requestId` (string): Unique ID for the request
- `result` (object): The analysis result
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
npm test in12
```

## License

MIT
