/**
 * CO05 Constants
 * 
 * This file contains constants used by the CO05 model.
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
  id: 'co05',
  name: 'CO05 Composition Model',
  description: 'Combines elements to create new wholes with emergent properties',
  version: '1.0.0',
  author: 'HUMMBL',
  createdAt: '2025-10-23',
  updatedAt: '2025-10-23'
};

/** Default element types */
export const ELEMENT_TYPES = [
  'component',
  'service',
  'data',
  'interface',
  'process'
];

/** Default relationship types */
export const RELATIONSHIP_TYPES = [
  'dependsOn',
  'uses',
  'implements',
  'extends',
  'composedOf'
];