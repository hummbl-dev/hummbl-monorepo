/**
 * Base120 Core Types
 *
 * Type definitions for the 120 mental models across 6 transformations.
 */

/**
 * The six transformation types in the Base120 framework
 */
export type TransformationType = 'P' | 'IN' | 'CO' | 'DE' | 'RE' | 'SY';

/**
 * A single mental model within the Base120 framework
 */
export interface MentalModel {
  /** Unique code identifier (e.g., "P1", "IN15", "SY20") */
  code: string;

  /** Human-readable name of the model */
  name: string;

  /** Which transformation this model belongs to */
  transformation: TransformationType;

  /** Core definition of the model */
  definition: string;

  /** Guidance on when to apply this model */
  whenToUse: string;

  /** Optional illustrative example */
  example?: string;

  /** Optional priority/ranking for the model */
  priority: number;

  /** Optional system prompt / instruction block */
  system_prompt?: string;
}

/**
 * A transformation category containing 20 mental models
 */
export interface Transformation {
  /** Transformation code (P, IN, CO, DE, RE, SY) */
  code: TransformationType;

  /** Full name of the transformation */
  name: string;

  /** Description of the transformation's purpose */
  description: string;

  /** The 20 models belonging to this transformation */
  models: MentalModel[];
}

/**
 * Metadata for transformation categories lives in data.ts
 */
