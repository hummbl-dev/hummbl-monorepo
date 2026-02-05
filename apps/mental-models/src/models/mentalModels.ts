import { TransformationKey } from '../types/transformation';

export interface MentalModel {
  /** Unique identifier for the model */
  id: string;

  /** Human-readable name */
  name: string;

  /** Short code/abbreviation */
  code: string;

  /** Detailed description */
  description: string;

  /** Optional example usage */
  example?: string;

  /** Primary category */
  category: string;

  /** Related categories and tags */
  tags: string[];

  /** Associated transformation keys */
  transformations: TransformationKey[];

  /** Source references */
  sources: {
    /** Source name */
    name: string;
    /** URL or citation */
    reference: string;
  }[];

  /** Additional metadata */
  meta?: {
    /** When this model was added */
    added?: string;
    /** Last updated timestamp */
    updated?: string;
    /** Whether this is a core model */
    isCore?: boolean;
    /** Difficulty level (1-5) */
    difficulty?: number;
  };
}

/**
 * Registry of all mental models
 * This will be populated by the build process from external data
 */
export const mentalModelsRegistry: Record<string, MentalModel> = {};

/**
 * Helper to register a mental model
 */
export function registerMentalModel(model: MentalModel) {
  if (mentalModelsRegistry[model.id]) {
    console.warn(`Mental model with id '${model.id}' already exists. Overwriting.`);
  }
  mentalModelsRegistry[model.id] = model;
  return model;
}

/**
 * Get all mental models
 */
export function getAllMentalModels(): MentalModel[] {
  return Object.values(mentalModelsRegistry);
}

/**
 * Get mental models by transformation
 */
export function getMentalModelsByTransformation(transformation: TransformationKey): MentalModel[] {
  return Object.values(mentalModelsRegistry).filter((model) =>
    model.transformations.includes(transformation)
  );
}

/**
 * Get mental model by ID
 */
export function getMentalModelById(id: string): MentalModel | undefined {
  return mentalModelsRegistry[id];
}

// Example model (will be moved to a separate data file)
registerMentalModel({
  id: 'first-principles',
  name: 'First Principles Thinking',
  code: 'FP',
  description:
    'Breaking down complex problems into their most basic, foundational elements and reasoning up from there.',
  example:
    'Elon Musk used first principles to reduce the cost of rocket launches by building reusable rockets.',
  category: 'Problem Solving',
  tags: ['reasoning', 'analysis', 'decision-making'],
  transformations: ['P', 'IN', 'CO', 'DE', 'RE'],
  sources: [
    {
      name: 'Aristotle',
      reference: 'Metaphysics',
    },
  ],
  meta: {
    isCore: true,
    difficulty: 3,
    added: '2025-01-01',
    updated: '2025-01-01',
  },
});

// Export types for use in other modules
export type { MentalModel as MentalModelType };
