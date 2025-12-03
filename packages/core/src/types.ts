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
 * Result type for explicit error handling
 * 
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return { ok: false, error: 'Division by zero' };
 *   return { ok: true, value: a / b };
 * }
 * ```
 */
export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Type guard to check if a Result is successful
 */
export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } => {
  return result.ok;
};

/**
 * Type guard to check if a Result is an error
 */
export const isError = <T, E>(result: Result<T, E>): result is { ok: false; error: E } => {
  return !result.ok;
};

/**
 * Metadata for transformation categories
 */
// TRANSFORMATIONS constant moved to data.ts
