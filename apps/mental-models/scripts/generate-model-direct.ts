import { mkdir, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MODEL_DEFINITION = {
  id: 'IN1',
  name: 'Inversion Thinking',
  description: 'Approach problems by considering the opposite of the desired outcome',
  version: '1.0.0',
  characteristics: [
    'Identifies what not to do',
    'Prevents mistakes by inversion',
    'Focuses on avoiding failure',
    'Considers worst-case scenarios',
    'Highlights potential pitfalls'
  ],
  relatedModels: ['P1', 'ST1', 'ST2'],
  example: {
    problem: 'How to be happy?',
    traditionalApproach: 'Pursue happiness directly',
    modelApproach: 'Identify what makes you unhappy and eliminate those things'
  }
};

async function createModelFiles() {
  try {
    const outputDir = join(process.cwd(), 'src/models/in1');
    await mkdir(outputDir, { recursive: true });
    
    // Create index.ts
    await writeFile(
      join(outputDir, 'index.ts'),
      `import { create${MODEL_DEFINITION.id}Model } from './${MODEL_DEFINITION.id}Model';

export * from './types';
export * from './constants';
export * from './${MODEL_DEFINITION.id}Model';

export default create${MODEL_DEFINITION.id}Model;`
    );

    // Create model file
    await writeFile(
      join(outputDir, `${MODEL_DEFINITION.id}Model.ts`),
      `import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { ${MODEL_DEFINITION.id}_CONSTANTS } from './constants';
import type { ${MODEL_DEFINITION.id}Config, ${MODEL_DEFINITION.id}Input, ${MODEL_DEFINITION.id}Output } from './types';

const DEFAULT_CONFIG: Required<${MODEL_DEFINITION.id}Config> = {
  id: '${MODEL_DEFINITION.id.toLowerCase()}',
  name: '${MODEL_DEFINITION.name}',
  description: '${MODEL_DEFINITION.description}',
  version: '${MODEL_DEFINITION.version}',
  eventEmitter: new EventEmitter(),
  telemetryEnabled: true,
};

export class ${MODEL_DEFINITION.id}Model {
  private config: Required<${MODEL_DEFINITION.id}Config>;
  
  constructor(config: Partial<${MODEL_DEFINITION.id}Config> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async analyze(input: ${MODEL_DEFINITION.id}Input): Promise<${MODEL_DEFINITION.id}Output> {
    // TODO: Implement inversion thinking logic
    return {
      id: uuidv4(),
      problem: input.problem,
      solution: 'Implement inversion thinking here',
      metadata: {
        modelVersion: this.config.version,
        timestamp: new Date().toISOString(),
      }
    };
  }
}

export function create${MODEL_DEFINITION.id}Model(config?: Partial<${MODEL_DEFINITION.id}Config>) {
  return new ${MODEL_DEFINITION.id}Model(config);
}

export default create${MODEL_DEFINITION.id}Model;`
    );

    // Create types.ts
    await writeFile(
      join(outputDir, 'types.ts'),
      `export interface ${MODEL_DEFINITION.id}Config {
  id?: string;
  name?: string;
  description?: string;
  version?: string;
  eventEmitter?: EventEmitter;
  telemetryEnabled?: boolean;
}

export interface ${MODEL_DEFINITION.id}Input {
  problem: string;
  context?: Record<string, any>;
  options?: {
    maxDepth?: number;
    includeExamples?: boolean;
  };
  metadata?: Record<string, any>;
}

export interface ${MODEL_DEFINITION.id}Output {
  id: string;
  problem: string;
  solution: string;
  metadata: {
    modelVersion: string;
    timestamp: string;
    [key: string]: any;
  };
}`
    );

    // Create constants.ts
    await writeFile(
      join(outputDir, 'constants.ts'),
      `export const ${MODEL_DEFINITION.id}_CONSTANTS = {
  MODEL_ID: '${MODEL_DEFINITION.id}',
  MODEL_NAME: '${MODEL_DEFINITION.name}',
  DESCRIPTION: '${MODEL_DEFINITION.description}',
  VERSION: '${MODEL_DEFINITION.version}',
  KEY_CHARACTERISTICS: ${JSON.stringify(MODEL_DEFINITION.characteristics, null, 2)},
  RELATED_MODELS: ${JSON.stringify(MODEL_DEFINITION.relatedModels, null, 2)},
  EXAMPLE: ${JSON.stringify(MODEL_DEFINITION.example, null, 2)}
} as const;`
    );

    // Create test file
    await mkdir(join(outputDir, '__tests__'), { recursive: true });
    await writeFile(
      join(outputDir, '__tests__', '${MODEL_DEFINITION.id.toLowerCase()}.test.ts'),
      `import { describe, it, expect, beforeEach } from 'vitest';
import { create${MODEL_DEFINITION.id}Model } from '../${MODEL_DEFINITION.id}Model';

describe('${MODEL_DEFINITION.id}Model', () => {
  let model: ReturnType<typeof create${MODEL_DEFINITION.id}Model>;

  beforeEach(() => {
    model = create${MODEL_DEFINITION.id}Model();
  });

  it('should be defined', () => {
    expect(model).toBeDefined();
  });

  it('should analyze a problem', async () => {
    const result = await model.analyze({
      problem: '${MODEL_DEFINITION.example.problem}',
    });
    expect(result).toHaveProperty('solution');
    expect(result).toHaveProperty('metadata');
  });
});`
    );

    console.log(`✅ ${MODEL_DEFINITION.id} model generated successfully at ${outputDir}`);
  } catch (error) {
    console.error('❌ Error generating model:', error);
    process.exit(1);
  }
}

createModelFiles();
