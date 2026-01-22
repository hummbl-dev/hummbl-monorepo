# RE12: Reconstruction Model

## Overview
This model implements the Reconstruction mental model by reassembling components into a coherent system with improved structure and relationships.

## Installation

```bash
npm install @hummbl/models
```

## Usage

```typescript
import { createRE12Model } from '@hummbl/models/re12';

// Create an instance of the model
const model = createRE12Model({
  telemetryEnabled: true
});

// Reconstruct a system from components
const result = await model.reconstruct({
  systemId: 'example-system',
  name: 'Example System',
  components: [
    { 
      id: 'auth-service',
      type: 'service',
      properties: { 
        name: 'Authentication Service',
        language: 'TypeScript',
        repository: 'https://github.com/example/auth-service'
      }
    },
    {
      id: 'user-db',
      type: 'database',
      properties: {
        name: 'User Database',
        type: 'PostgreSQL',
        version: '13.0'
      }
    }
  ],
  relationships: [
    {
      id: 'auth-to-db',
      source: 'auth-service',
      target: 'user-db',
      type: 'uses',
      properties: {
        description: 'Stores and retrieves user authentication data',
        authentication: 'credentials'
      }
    }
  ],
  strategy: 'optimize',
  context: {
    environment: 'production',
    team: 'identity'
  },
  metadata: {
    source: 'user-request',
    priority: 'high'
  }
});

console.log('Reconstructed System:', result.system);
console.log('Metrics:', result.metrics);
```

## API Reference

### createRE12Model(config?)

Creates a new instance of the RE12 model.

**Parameters:**
- `config` (Optional): Configuration object
  - `name` (string): Name of the model instance (default: 'RE12')
  - `version` (string): Version of the model (default: '1.0.0')
  - `eventEmitter` (EventEmitter): Custom event emitter (default: new EventEmitter())
  - `telemetryEnabled` (boolean): Whether to enable telemetry (default: false)
  - `logger` (object): Custom logger (default: console)

**Returns:**
An object with the following properties:
- `id` (string): The model ID
- `name` (string): The model name
- `version` (string): The model version
- `reconstruct` (function): The reconstruction function

### reconstruct(input)

Reconstructs a system from its components and relationships.

**Parameters:**
- `input` (object): The input to reconstruct
  - `systemId` (string, optional): Unique identifier for the system
  - `name` (string, optional): Name of the system
  - `components` (ReconstructionComponent[]): Components to be reconstructed
  - `relationships` (ReconstructionRelationship[], optional): Relationships between components
  - `strategy` (string, optional): Reconstruction strategy ('default', 'optimize', 'minimal', 'comprehensive')
  - `context` (object, optional): Additional context
  - `metadata` (object, optional): Additional metadata

**Returns:**
A Promise that resolves to a reconstruction result object.

## Events

The model emits the following events:

### reconstructionComplete
Emitted when reconstruction is successfully completed.

**Event Data:**
- `requestId` (string): Unique ID for the request
- `result` (object): The reconstruction result
- `timestamp` (string): ISO timestamp of when the event was emitted

### reconstructionError
Emitted when an error occurs during reconstruction.

**Event Data:**
- `requestId` (string): Unique ID for the request
- `error` (string): Error message
- `timestamp` (string): ISO timestamp of when the error occurred

## Testing

Run tests with:

```bash
npm test re12
```

## License

MIT
