import { SchemaMapping, SchemaMappingOptions } from './types';

export const SY2_CONSTANTS = {
  // Model metadata
  MODEL_CODE: 'SY2',
  MODEL_NAME: 'Universal Schema Mapping',
  TRANSFORMATION: 'Synthesis',
  VERSION: '1.0.0',
  
  // Default configuration
  DEFAULTS: {
    VALIDATE: true,
    INCLUDE_METADATA: false,
    STRICT: true,
    CONFIDENCE_THRESHOLD: 0.7,
    MAX_DEPTH: 10,
    MAX_ITERATIONS: 1000,
  },
  
  // Common field types
  FIELD_TYPES: [
    'string',
    'number',
    'boolean',
    'date',
    'datetime',
    'time',
    'object',
    'array',
    'null',
    'any'
  ] as const,
  
  // Common formats
  FORMATS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
    PHONE: /^\+?[\d\s-()]{10,}$/,
    ZIP_CODE: /^\d{5}(-\d{4})?$/,
    DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
    DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/,
  },
  
  // Common transformations
  TRANSFORMATIONS: {
    toLowerCase: (value: any) => String(value).toLowerCase(),
    toUpperCase: (value: any) => String(value).toUpperCase(),
    trim: (value: any) => String(value).trim(),
    toInt: (value: any) => parseInt(value, 10),
    toFloat: (value: any) => parseFloat(value),
    toBoolean: (value: any) => {
      if (typeof value === 'string') {
        return ['true', 't', 'yes', 'y', '1'].includes(value.toLowerCase());
      }
      return Boolean(value);
    },
    toDate: (value: any) => new Date(value),
    toJSON: (value: any) => JSON.stringify(value),
    fromJSON: (value: string) => JSON.parse(value),
  },
  
  // Error messages
  ERRORS: {
    INVALID_SCHEMA: 'Invalid schema provided',
    MAPPING_VALIDATION_FAILED: 'Schema mapping validation failed',
    REQUIRED_FIELD_MISSING: 'Required field is missing',
    INVALID_FIELD_FORMAT: 'Field format is invalid',
    TRANSFORMATION_FAILED: 'Value transformation failed',
    MAX_DEPTH_EXCEEDED: 'Maximum nesting depth exceeded',
    MAX_ITERATIONS_EXCEEDED: 'Maximum iterations exceeded',
  },
  
  // Default schema mapping options
  DEFAULT_OPTIONS: {
    validate: true,
    includeMetadata: false,
    strict: true,
    defaultValue: null,
  } as SchemaMappingOptions,
} as const;

/**
 * Creates a new schema mapping with default values
 */
export function createSchemaMapping(overrides: Partial<SchemaMapping> = {}): SchemaMapping {
  const now = new Date();
  
  return {
    id: `map-${Date.now()}`,
    source: {
      id: '',
      name: '',
      format: 'json',
      schema: {},
      ...overrides.source,
    },
    target: {
      id: '',
      name: '',
      format: 'json',
      ...overrides.target,
    },
    mappings: overrides.mappings || [],
    validation: {
      requiredFields: [],
      fieldFormats: {},
      crossFieldValidations: [],
      ...overrides.validation,
    },
    meta: {
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      version: '1.0.0',
      tags: [],
      ...overrides.meta,
    },
  };
}

/**
 * Creates a new schema mapping result with default values
 */
export function createSchemaMappingResult(
  data: Record<string, any> = {},
  meta: Partial<SchemaMappingResult['meta']> = {}
) {
  const now = new Date();
  
  return {
    data,
    stats: {
      totalFields: 0,
      mappedFields: 0,
      missingFields: 0,
      transformationCount: 0,
      mappingConfidence: 0,
    },
    errors: [],
    warnings: [],
    meta: {
      mappingId: '',
      sourceId: '',
      targetId: '',
      timestamp: now,
      durationMs: 0,
      ...meta,
    },
  };
}
