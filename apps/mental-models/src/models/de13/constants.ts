/**
 * DE13 Constants
 * 
 * This file contains constants used by the DE13 model.
 */

/** Current version of the model */
export const version = '1.0.0';

/** Default configuration values */
export const DEFAULT_OPTIONS = {
  includeReasoning: true,
  maxDepth: 3,
  includeIssues: true
};

/** Model metadata */
export const MODEL_METADATA = {
  id: 'de13',
  name: 'DE13 Deconstruction Model',
  description: 'Breaks down complex systems into their fundamental components and relationships',
  version: '1.0.0',
  author: 'HUMMBL',
  createdAt: '2025-10-23',
  updatedAt: '2025-10-23'
};

/** Default component types */
export const COMPONENT_TYPES = [
  'primitive',
  'object',
  'array',
  'function',
  'class',
  'module',
  'service',
  'data'
];

/** Default relationship types */
export const RELATIONSHIP_TYPES = [
  'contains',
  'dependsOn',
  'uses',
  'extends',
  'implements',
  'calls',
  'references'
];