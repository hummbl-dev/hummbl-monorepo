import type { TransformationType, MentalModel } from './types.js';
import { Result } from './result.js';

export interface CustomTransformation {
  code: string;
  name: string;
  description: string;
  models: MentalModel[];
  created: Date;
  author?: string;
}

export interface TransformationTemplate {
  name: string;
  description: string;
  modelCount: number;
  examples: string[];
}

export class TransformationBuilder {
  private transformation: Partial<CustomTransformation> = {};

  static create(): TransformationBuilder {
    return new TransformationBuilder();
  }

  withCode(code: string): TransformationBuilder {
    this.transformation.code = code.toUpperCase();
    return this;
  }

  withName(name: string): TransformationBuilder {
    this.transformation.name = name;
    return this;
  }

  withDescription(description: string): TransformationBuilder {
    this.transformation.description = description;
    return this;
  }

  withAuthor(author: string): TransformationBuilder {
    this.transformation.author = author;
    return this;
  }

  addModel(model: Omit<MentalModel, 'transformation'>): TransformationBuilder {
    if (!this.transformation.models) {
      this.transformation.models = [];
    }

    this.transformation.models.push({
      ...model,
      transformation: this.transformation.code as TransformationType,
    });

    return this;
  }

  build(): Result<CustomTransformation, string> {
    const { code, name, description, models } = this.transformation;

    if (!code) return Result.err('Transformation code is required');
    if (!name) return Result.err('Transformation name is required');
    if (!description) return Result.err('Transformation description is required');
    if (!models || models.length === 0) return Result.err('At least one model is required');

    if (code.length > 3) return Result.err('Code must be 3 characters or less');
    if (models.length > 20) return Result.err('Maximum 20 models per transformation');

    return Result.ok({
      code,
      name,
      description,
      models,
      created: new Date(),
      author: this.transformation.author,
    });
  }
}

export const TRANSFORMATION_TEMPLATES: TransformationTemplate[] = [
  {
    name: 'Analysis',
    description: 'Break down and examine components',
    modelCount: 15,
    examples: ['Root Cause Analysis', 'SWOT Analysis', 'Gap Analysis'],
  },
  {
    name: 'Synthesis',
    description: 'Combine elements into unified wholes',
    modelCount: 12,
    examples: ['Design Thinking', 'Systems Integration', 'Pattern Matching'],
  },
  {
    name: 'Optimization',
    description: 'Improve efficiency and effectiveness',
    modelCount: 18,
    examples: ['Lean Methodology', 'Continuous Improvement', 'Resource Allocation'],
  },
];
