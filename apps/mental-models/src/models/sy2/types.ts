/**
 * SY2: Universal Schema Mapping
 * 
 * Maps diverse schemas to universal representation format, enabling cross-domain pattern recognition and transfer.
 */

export interface SchemaMapping {
  /** Unique identifier for the mapping */
  id: string;
  
  /** Source schema */
  source: {
    id: string;
    name: string;
    format: string;
    schema: Record<string, any>;
  };
  
  /** Target schema */
  target: {
    id: string;
    name: string;
    format: string;
  };
  
  /** Field mappings */
  mappings: Array<{
    sourcePath: string[];
    targetPath: string[];
    transformation?: (value: any) => any;
    confidence: number;
    isRequired: boolean;
  }>;
  
  /** Validation rules */
  validation: {
    requiredFields: string[];
    fieldFormats: Record<string, RegExp>;
    crossFieldValidations: Array<{
      fields: string[];
      validate: (values: Record<string, any>) => boolean;
      error: string;
    }>;
  };
  
  /** Metadata */
  meta: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    version: string;
    tags: string[];
  };
}

export interface SchemaMappingOptions {
  /** Whether to validate the mapping */
  validate?: boolean;
  
  /** Whether to include metadata in the output */
  includeMetadata?: boolean;
  
  /** Default value for missing fields */
  defaultValue?: any;
  
  /** Strict mode (fails on missing required fields) */
  strict?: boolean;
}

export interface SchemaMappingResult {
  /** Mapped data */
  data: Record<string, any>;
  
  /** Mapping statistics */
  stats: {
    totalFields: number;
    mappedFields: number;
    missingFields: number;
    transformationCount: number;
    mappingConfidence: number;
  };
  
  /** Any validation errors */
  errors: Array<{
    type: 'missing' | 'invalid' | 'transformation';
    field: string;
    message: string;
    sourceValue?: any;
  }>;
  
  /** Warnings */
  warnings: string[];
  
  /** Metadata */
  meta: {
    mappingId: string;
    sourceId: string;
    targetId: string;
    timestamp: Date;
    durationMs: number;
  };
}

export interface SchemaMapper {
  /** Unique identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Version */
  version: string;
  
  /** Description */
  description: string;
  
  /** Default options */
  defaultOptions: SchemaMappingOptions;
  
  /**
   * Map data from source to target schema
   */
  map(
    sourceData: Record<string, any>,
    mapping: SchemaMapping,
    options?: SchemaMappingOptions
  ): Promise<SchemaMappingResult>;
  
  /**
   * Validate a schema mapping
   */
  validateMapping(mapping: SchemaMapping): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  
  /**
   * Generate a mapping between two schemas
   */
  generateMapping(
    sourceSchema: Record<string, any>,
    targetSchema: Record<string, any>,
    options?: {
      confidenceThreshold?: number;
      includeExamples?: boolean;
    }
  ): Promise<SchemaMapping>;
  
  /**
   * Transform a value using a transformation function
   */
  transformValue(
    value: any,
    transformFn: string | ((value: any) => any)
  ): any;
}
