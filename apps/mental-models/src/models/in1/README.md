# IN1: Inversion Thinking Model

## Overview

Inversion Thinking is a powerful mental model that helps solve problems by considering the opposite of what you want to achieve. Instead of focusing solely on success, it identifies potential failures and works backward to prevent them. The IN1 model implements this approach programmatically, providing structured analysis of potential failure modes and corresponding avoidance strategies.

### Core Principles

1. **Prevent Failure First**: By identifying how something could fail, we can take steps to prevent those failures.
2. **Challenge Assumptions**: Forces critical examination of assumptions by considering their opposites.
3. **Risk Mitigation**: Proactively identifies and addresses risks before they become problems.
4. **Comprehensive Analysis**: Provides a structured approach to problem-solving that considers multiple failure scenarios.

## When to Use IN1

### Decision Making Scenarios

- Evaluating strategic business decisions
- Assessing investment opportunities
- Making high-stakes choices with significant consequences

### Risk Identification

- Project risk assessment
- System failure analysis
- Business continuity planning

### Strategy Planning

- Business strategy development
- Product roadmap planning
- Market entry strategies

### Problem Analysis

- Root cause analysis
- Process improvement
- System design validation

### Common Use Cases

- Software development planning
- Product design reviews
- Business process optimization
- Personal goal setting
- Team performance improvement

## Installation

### Prerequisites

- Node.js 14.x or later
- npm or yarn package manager

### Installation Steps

1. Install the package:

```bash
# Using npm
npm install @hummbl/models

# Or using yarn
yarn add @hummbl/models
```

2. Import and use in your project:

```typescript
import { createIN1Model } from '@hummbl/models/in1';

// Create a default instance
const in1 = createIN1Model();
```

## Usage

### Basic Usage

```typescript
const result = await in1.analyze({
  problem: 'How to deliver a successful software project?',
  context: {
    industry: 'software',
    teamSize: 8,
    deadline: '2023-12-31'
  },
  options: {
    maxDepth: 3,
    includeExamples: true,
  },
  metadata: {
    requestId: 'req_123',
    userId: 'user_456'
  }
});
```

### Advanced Configuration

```typescript
import { EventEmitter } from 'events';

// Create a custom event emitter for handling model events
const eventEmitter = new EventEmitter();

const in1 = createIN1Model({
  // Custom configuration
  id: 'custom-in1',
  name: 'Enterprise Inversion Model',
  version: '2.0.0',
  eventEmitter,
  telemetryEnabled: true,
  logger: console, // Custom logger implementation
});

// Listen for analysis completion
eventEmitter.on('analysisComplete', ({ requestId, result, timestamp }) => {
  console.log(`Analysis completed for request ${requestId} at ${timestamp}`);
  // Process results
  console.log('Generated strategies:', result.avoidanceStrategies);
  console.log('Key insights:', result.insights);
});

// Handle analysis errors
eventEmitter.on('analysisError', ({ requestId, error, timestamp }) => {
  console.error(`Analysis failed for request ${requestId} at ${timestamp}:`, error);
  // Implement error handling logic
});
```

## API Reference

### `createIN1Model(config?: Partial<IN1Config>): IN1Model`

Creates and configures a new IN1 model instance.

**Configuration Options (`IN1Config`):**

- `id`: string - Unique identifier for the model instance
- `name`: string - Display name for the model
- `version`: string - Version identifier
- `eventEmitter`: EventEmitter - Custom event emitter for model events
- `telemetryEnabled`: boolean - Whether to collect telemetry data (default: false)
- `logger`: Logger - Custom logger implementation (default: console)

### `IN1Model.analyze(input: IN1Input): Promise<IN1Output>`

Performs inversion thinking analysis on the provided problem.

**Input Parameters (`IN1Input`):**

- `problem`: string (required) - The problem statement to analyze
- `context?`: Record<string, any> - Additional context for the analysis
  - Common context fields:
    - `industry`: string - Industry context (e.g., 'software', 'healthcare')
    - `teamSize`: number - Size of the team involved
    - `deadline`: string - Project deadline or timeframe
- `options?`: AnalysisOptions - Configuration for the analysis
  - `maxDepth`: number - Maximum depth of analysis (default: 3)
  - `includeExamples`: boolean - Whether to include example failure modes (default: true)
- `metadata?`: Record<string, any> - Additional metadata for the request

**Returns (`IN1Output`):**

- `id`: string - Unique identifier for this analysis
- `problem`: string - The original problem statement
- `solution`: string - Formatted solution combining all avoidance strategies
- `inverseProblem`: string - The inverted problem statement
- `failureModes`: string[] - Identified potential failure modes
- `avoidanceStrategies`: string[] - Generated strategies to avoid failures
- `insights`: string[] - Key insights from the analysis
- `confidence`: number - Confidence score (0-1) of the analysis
- `metadata`: AnalysisMetadata - Metadata about the analysis
  - `modelVersion`: string - Version of the model used
  - `timestamp`: string - When the analysis was performed
  - `executionTimeMs`: number - Time taken for analysis in milliseconds
  - `telemetry`: TelemetryData - Additional telemetry information

## Examples

### Business Strategy Analysis

```typescript
const result = await in1.analyze({
  problem: 'How to successfully enter a new market?',
  context: {
    industry: 'e-commerce',
    teamSize: 15,
    market: 'Southeast Asia'
  },
  options: {
    maxDepth: 4,
    includeExamples: true
  }
});
```

### Project Risk Assessment

```typescript
const result = await in1.analyze({
  problem: 'How to ensure on-time project delivery?',
  context: {
    projectType: 'mobile-app',
    teamSize: 8,
    timeline: '6 months'
  },
  options: {
    maxDepth: 3,
    includeExamples: true
  }
});
```

## Best Practices

1. **Start with Clear Problems**: Frame your problem statement clearly for better results.
2. **Provide Context**: Include relevant context (industry, team size, etc.) for more accurate analysis.
3. **Review Multiple Failure Modes**: Consider multiple failure scenarios for comprehensive coverage.
4. **Iterate and Refine**: Use initial insights to refine your problem statement and re-analyze.
5. **Combine with Other Models**: Use IN1 alongside other mental models for more robust analysis.

## Troubleshooting

### Common Issues

- **Vague Problem Statements**: Ensure your problem statement is specific and actionable.
- **Insufficient Context**: Provide enough context for accurate analysis.
- **Shallow Analysis**: Increase `maxDepth` for more detailed results.

### Error Handling

The model emits `analysisError` events when errors occur. Always implement error handling:

```typescript
eventEmitter.on('analysisError', ({ error, requestId }) => {
  console.error(`Analysis error (${requestId}):`, error);
  // Handle error appropriately
});
```

## Contributing

Contributions are welcome! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Type Definitions

### `IN1Config`

Configuration options for the IN1 model:

```typescript
interface IN1Config {
  id?: string;           // Model identifier
  name?: string;         // Display name
  version?: string;      // Version string
  eventEmitter?: EventEmitter;  // Custom event emitter
  telemetryEnabled?: boolean;   // Enable/disable telemetry
  logger?: Logger;       // Custom logger implementation
}
```

### `IN1Input`

Input parameters for the analyze method:

```typescript
interface IN1Input {
  problem: string;       // Problem statement to analyze
  context?: {            // Optional context
    industry?: string;
    teamSize?: number;
    deadline?: string;
    [key: string]: any;  // Additional context fields
  };
  options?: {            // Analysis options
    maxDepth?: number;   // Maximum depth of analysis
    includeExamples?: boolean;  // Include example failure modes
  };
  metadata?: Record<string, any>;  // Additional metadata
}
```

### `IN1Output`

Structure of the analysis results:

```typescript
interface IN1Output {
  id: string;                     // Analysis ID
  problem: string;               // Original problem
  solution: string;              // Generated solution
  inverseProblem: string;        // Inverted problem statement
  failureModes: string[];        // Identified failure modes
  avoidanceStrategies: string[]; // Generated strategies
  insights: string[];            // Key insights
  confidence: number;            // Confidence score (0-1)
  metadata: {                    // Analysis metadata
    modelVersion: string;
    timestamp: string;
    executionTimeMs: number;
    telemetry: Record<string, any>;
  };
}
```

## Changelog

### v1.0.0 (Current)
- Initial release of the IN1 Inversion Thinking Model
- Core functionality for inversion-based problem analysis
- Support for custom event handling and telemetry
- Comprehensive test coverage

## Roadmap

- [ ] Add support for custom failure mode generators
- [ ] Implement batch processing for multiple problems
- [ ] Add more built-in context processors
- [ ] Develop visualization tools for analysis results
- [ ] Create integration guides for common frameworks

## Support

For support, please open an issue in our [GitHub repository](https://github.com/hummbl-io/models/issues) or contact our support team at support@hummbl.io.

## Acknowledgments

- Inspired by Charlie Munger's principles of mental models
- Built with TypeScript for type safety and developer experience
- Tested with Vitest for reliable and maintainable tests

## Types

### `IN1Config`

Configuration options for the IN1 model:

```typescript
{
  id?: string;           // Model identifier
  name?: string;         // Display name
  description?: string;  // Model description
  version?: string;      // Version number
  eventEmitter?: EventEmitter; // For event-based communication
  telemetryEnabled?: boolean;  // Whether to enable telemetry
}
```

### `IN1Input`

Input structure for the analyze method:

```typescript
{
  problem: string;       // The problem to analyze
  context?: Record<string, any>;  // Additional context
  options?: {            // Analysis options
    maxDepth?: number;    // Maximum depth of analysis
    includeExamples?: boolean; // Whether to include examples
  };
  metadata?: Record<string, any>; // Additional metadata
}
```

## Examples

### Basic Example

```typescript
const result = await in1.analyze({
  problem: 'How to improve team productivity?',
});

console.log('Inverse Problem:', result.inverseProblem);
console.log('Failure Modes:', result.failureModes);
console.log('Avoidance Strategies:', result.avoidanceStrategies);
console.log('Key Insights:', result.insights);
```

### With Context

```typescript
const result = await in1.analyze({
  problem: 'How to launch a successful marketing campaign?',
  context: {
    industry: 'ecommerce',
    budget: 'medium',
    timeline: '3 months',
  },
  options: {
    maxDepth: 4,
  },
});
```

## Related Models

- **P1**: First Principles Thinking
- **PMI**: Plus-Minus-Interesting Analysis
- **SixHats**: Six Thinking Hats

## Contributing

Contributions are welcome! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE)
