/**
 * RE12 Constants
 * 
 * This file contains constants used by the RE12 model.
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
  id: 're12',
  name: 'RE12 Reconstruction Model',
  description: 'Reassemblies components into a coherent system with improved structure and relationships',
  version: '1.0.0',
  author: 'HUMMBL',
  createdAt: '2025-10-23',
  updatedAt: '2025-10-23'
};

/** Default component types */
export const COMPONENT_TYPES = [
  'service',
  'data',
  'ui',
  'api',
  'database',
  'cache',
  'queue',
  'storage'
];

/** Default relationship types */
export const RELATIONSHIP_TYPES = [
  'depends_on',
  'uses',
  'extends',
  'implements',
  'calls',
  'references',
  'contains',
  'belongs_to'
];

/** Error messages */
export const ERRORS = {
  INVALID_INPUT: 'Input must be an object',
  MISSING_COMPONENTS: 'Input must contain a non-empty "components" array',
  RECONSTRUCTION_FAILED: 'Failed to reconstruct system'
};