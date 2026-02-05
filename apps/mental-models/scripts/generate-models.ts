import { promises as fs } from 'fs';
import path from 'path';

// Configuration
const ROOT_DIR = path.join(process.cwd(), 'src/models');
const MODEL_TEMPLATES = {
  'index.ts': (modelId: string) => `import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { 
  ${modelId}Config, 
  ${modelId}Input, 
  ${modelId}Output 
} from './types';

/**
 * ${modelId}: [Brief Description]
 * 
 * [Detailed description of the model's purpose and functionality]
 */

const DEFAULT_CONFIG: Required<${modelId}Config> = {
  id: '${modelId.toLowerCase()}',
  name: '${modelId} Model',
  version: '1.0.0',
  eventEmitter: new EventEmitter(),
  telemetryEnabled: false,
  logger: console,
};

export const create${modelId}Model = (config: Partial<${modelId}Config> = {}) => {
  const {
    id,
    name,
    version,
    eventEmitter,
    telemetryEnabled,
    logger,
  } = { ...DEFAULT_CONFIG, ...config };

  /**
   * Analyze input using the ${modelId} model
   */
  const analyze = async (input: ${modelId}Input): Promise<${modelId}Output> => {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    try {
      // TODO: Implement actual analysis logic
      const result: ${modelId}Output = {
        id: requestId,
        analysis: {},
        metadata: {
          modelVersion: version,
          timestamp: new Date().toISOString(),
          executionTimeMs: Date.now() - startTime,
          telemetry: telemetryEnabled ? {
            // Add telemetry data here
          } : undefined,
        },
      };

      // Emit success event
      eventEmitter.emit('analysisComplete', {
        requestId,
        result,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during analysis';
      
      // Emit error event
      eventEmitter.emit('analysisError', {
        requestId,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  };

  return {
    id,
    name,
    version,
    analyze,
  };
};

export default {
  create${modelId}Model,
};`,

  'types.ts': (modelId: string) => `/**
 * ${modelId}: Type Definitions
 */

import { EventEmitter } from 'events';

export interface ${modelId}Config {
  /** Unique identifier for this model instance */
  id?: string;
  
  /** Display name for the model */
  name?: string;
  
  /** Version string */
  version?: string;
  
  /** Custom event emitter for model events */
  eventEmitter?: EventEmitter;
  
  /** Whether to collect telemetry data */
  telemetryEnabled?: boolean;
  
  /** Custom logger implementation */
  logger?: Console;
}

export interface ${modelId}Input {
  /** Input data for analysis */
  input: any;
  
  /** Additional context for the analysis */
  context?: Record<string, any>;
  
  /** Analysis options */
  options?: {
    [key: string]: any;
  };
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface ${modelId}Output {
  /** Unique identifier for this analysis */
  id: string;
  
  /** The analysis result */
  analysis: Record<string, any>;
  
  /** Metadata about the analysis */
  metadata: {
    /** Version of the model used */
    modelVersion: string;
    
    /** When the analysis was performed */
    timestamp: string;
    
    /** Time taken for analysis in milliseconds */
    executionTimeMs: number;
    
    /** Additional telemetry data */
    telemetry?: Record<string, any>;
  };
}

/** Event emitted when analysis completes successfully */
export interface ${modelId}CompleteEvent {
  requestId: string;
  result: ${modelId}Output;
  timestamp: string;
}

/** Event emitted when an error occurs during analysis */
export interface ${modelId}ErrorEvent {
  requestId: string;
  error: string;
  timestamp: string;
}

/** Type for analysis event callbacks */
export type ${modelId}EventHandler = (event: ${modelId}CompleteEvent | ${modelId}ErrorEvent) => void;`,

  'constants.ts': (modelId: string) => `/**
 * ${modelId}: Constants
 */

export const ${modelId}_DEFAULTS = {
  // Add model-specific constants here
} as const;`,

  'test.ts': (modelId: string) => `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create${modelId}Model } from '../${modelId}';
import { EventEmitter } from 'events';

describe('${modelId}: Model', () => {
  let model: ReturnType<typeof create${modelId}Model>;
  let mockEventEmit: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    const eventEmitter = new EventEmitter();
    mockEventEmit = vi.fn();
    eventEmitter.emit = mockEventEmit;
    
    model = create${modelId}Model({
      eventEmitter,
      telemetryEnabled: true,
    });
  });

  it('should create a model with default config', () => {
    const defaultModel = create${modelId}Model();
    
    expect(defaultModel).toBeDefined();
    expect(defaultModel.id).toBe('${modelId.toLowerCase()}');
    expect(defaultModel.name).toBe('${modelId} Model');
    expect(defaultModel.version).toBe('1.0.0');
  });

  it('should analyze input', async () => {
    const input = {
      input: 'test input',
      context: { test: true },
    };

    const result = await model.analyze(input);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(mockEventEmit).toHaveBeenCalledWith('analysisComplete', expect.any(Object));
  });

  it('should include telemetry when enabled', async () => {
    const input = { input: 'test' };
    const result = await model.analyze(input);
    
    expect(result.metadata.telemetry).toBeDefined();
  });

  it('should handle errors', async () => {
    // Test error handling
    await expect(model.analyze({} as any)).rejects.toThrow();
  });

  it('should emit error events on failure', async () => {
    const testEmitter = new EventEmitter();
    const errorSpy = vi.fn();
    
    testEmitter.on('analysisError', errorSpy);
    
    const failingModel = create${modelId}Model({
      eventEmitter: testEmitter,
    });
    
    await expect(failingModel.analyze({} as any)).rejects.toThrow();
    
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const eventData = errorSpy.mock.calls[0][0];
    expect(eventData).toHaveProperty('error');
    expect(eventData).toHaveProperty('requestId');
    expect(eventData).toHaveProperty('timestamp');
  });
});`,

  'README.md': (modelId: string) => `# ${modelId}: [Model Name]

## Overview

**Model Code:** ${modelId}  
**Model Name:** [Human-Readable Name]  
**Transformation:** [Perspective/Inversion/Composition/Deconstruction/Reconstruction/Synthesis]  
**Tier:** [1-20]  

## Description

[Brief description of what this model does and its purpose in the HUMMBL framework]

## Features

- [Feature 1]
- [Feature 2]
- [Feature 3]

## Installation

\`\`\`bash
npm install @hummbl/models
\`\`\`

## Usage

### Basic Usage

\`\`\`typescript
import { create${modelId}Model } from '@hummbl/models/${modelId.toLowerCase()}';

const model = create${modelId}Model();

const result = await model.analyze({
  input: 'Your input here',
  context: {
    // Additional context
  },
});
\`\`\`

### Configuration

\`\`\`typescript
const model = create${modelId}Model({
  telemetryEnabled: true,
  // Other configuration options
});
\`\`\`

## API Reference

### Input

| Parameter | Type     | Description |
|-----------|----------|-------------|
| input     | any      | The input to analyze |
| context   | object   | Additional context  |
| options   | object   | Analysis options    |

### Output

| Field     | Type     | Description |
|-----------|----------|-------------|
| id        | string   | Unique ID for this analysis |
| analysis  | object   | Analysis results |
| metadata  | object   | Metadata about the analysis |

## Examples

### Example 1: [Use Case]

\`\`\`typescript
// Example code here
\`\`\`

## Development

### Running Tests

\`\`\`bash
npm test ${modelId.toLowerCase()}
\`\`\`

### Building

\`\`\`bash
npm run build
\`\`\`

## License

[MIT License](LICENSE)
`,
};

// Generate all model names
const generateModelNames = () => {
  const models: string[] = [];

  // P3-P20 (18 models)
  for (let i = 3; i <= 20; i++) {
    models.push(`P${i}`);
  }

  // IN3-IN20 (18 models)
  for (let i = 3; i <= 20; i++) {
    models.push(`IN${i}`);
  }

  // CO3-CO20 (18 models)
  for (let i = 3; i <= 20; i++) {
    models.push(`CO${i}`);
  }

  // DE3-DE20 (18 models)
  for (let i = 3; i <= 20; i++) {
    models.push(`DE${i}`);
  }

  // RE3-RE20 (18 models)
  for (let i = 3; i <= 20; i++) {
    models.push(`RE${i}`);
  }

  // SY3-SY20 (18 models)
  for (let i = 3; i <= 20; i++) {
    models.push(`SY${i}`);
  }

  return models;
};

// Create directory if it doesn't exist
const ensureDir = async (dir: string) => {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
};

// Generate model files
const generateModel = async (modelId: string) => {
  const modelDir = path.join(ROOT_DIR, modelId.toLowerCase());
  const testDir = path.join(modelDir, '__tests__');

  try {
    // Create model directory
    await ensureDir(modelDir);
    await ensureDir(testDir);

    // Generate files
    const files = [
      { path: path.join(modelDir, 'index.ts'), content: MODEL_TEMPLATES['index.ts'](modelId) },
      { path: path.join(modelDir, 'types.ts'), content: MODEL_TEMPLATES['types.ts'](modelId) },
      {
        path: path.join(modelDir, 'constants.ts'),
        content: MODEL_TEMPLATES['constants.ts'](modelId),
      },
      {
        path: path.join(testDir, `${modelId.toLowerCase()}.test.ts`),
        content: MODEL_TEMPLATES['test.ts'](modelId),
      },
      { path: path.join(modelDir, 'README.md'), content: MODEL_TEMPLATES['README.md'](modelId) },
    ];

    // Write files
    for (const file of files) {
      await fs.writeFile(file.path, file.content, 'utf8');
    }

    console.log(`✅ Generated ${modelId} model`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate ${modelId}:`, error.message);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🚀 Starting model generation...');

  const modelNames = generateModelNames();
  console.log(`📋 Generating ${modelNames.length} models`);

  let successCount = 0;
  const failed: string[] = [];

  // Process models in batches to avoid memory issues
  const BATCH_SIZE = 5;
  for (let i = 0; i < modelNames.length; i += BATCH_SIZE) {
    const batch = modelNames.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((model) => generateModel(model)));

    // Track results
    results.forEach((success, idx) => {
      if (success) {
        successCount++;
      } else {
        failed.push(batch[idx]);
      }
    });

    console.log(
      `🔄 Processed batch ${i / BATCH_SIZE + 1}/${Math.ceil(modelNames.length / BATCH_SIZE)}`
    );
  }

  // Print summary
  console.log('\n🎉 Generation complete!');
  console.log(`✅ Success: ${successCount}`);
  if (failed.length > 0) {
    console.log(`❌ Failed (${failed.length}):`, failed.join(', '));
  }
};

// Run the script
main().catch(console.error);
