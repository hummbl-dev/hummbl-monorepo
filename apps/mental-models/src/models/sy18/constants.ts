/**
 * SY18 Constants
 * 
 * This file contains constants used by the SY18 model.
 */

/** Current version of the model */
export const version = '1.0.0';

/** Default configuration values */
export const DEFAULT_OPTIONS = {
  maxDepth: 3,
  includeExamples: true,
  includeReasoning: true,
  confidenceThreshold: 0.7
};

/** Model metadata */
export const MODEL_METADATA = {
  id: 'sy18',
  name: 'SY18 Synthesis Model',
  description: 'Advanced synthesis capabilities for combining multiple mental models',
  version: '1.0.0',
  author: 'HUMMBL',
  createdAt: '2025-10-23',
  updatedAt: '2025-10-23'
};

/** Default model types that work well with this synthesizer */
export const COMPATIBLE_MODEL_TYPES = [
  'perspective',
  'inversion',
  'composition',
  'deconstruction',
  'reconstruction',
  'synthesis',
  'analysis',
  'prediction'
];

/** Error messages */
export const ERRORS = {
  INVALID_INPUT: 'Input must be an object',
  NO_MODELS: 'At least one model output is required for synthesis',
  SYNTHESIS_FAILED: 'Failed to synthesize models'
};

/** Event names */
export const EVENTS = {
  SYNTHESIS_COMPLETE: 'synthesisComplete',
  SYNTHESIS_ERROR: 'synthesisError'
};