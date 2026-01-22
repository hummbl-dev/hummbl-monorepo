import { v4 as uuidv4 } from 'uuid';
import { 
  SY2_CONSTANTS,
  createSchemaMapping,
  createSchemaMappingResult
} from './constants';
import type {
  SchemaMapping,
  SchemaMappingOptions,
  SchemaMappingResult,
  SchemaMapper
} from './types';

/**
 * Creates a new Universal Schema Mapping model instance
 */
export function createSchemaMapper(config: Partial<SchemaMapper> = {}): SchemaMapper {
  const model: SchemaMapper = {
    id: `mapper-${uuidv4()}`,
    name: SY2_CONSTANTS.MODEL_NAME,
    version: SY2_CONSTANTS.VERSION,
    description: 'Universal Schema Mapping for cross-domain data transformation',
    defaultOptions: { ...SY2_CONSTANTS.DEFAULT_OPTIONS },
    
    async map(
      sourceData: Record<string, any>,
      mapping: SchemaMapping,
      options: SchemaMappingOptions = {}
    ): Promise<SchemaMappingResult> {
      const startTime = Date.now();
      const mergedOptions = { ...this.defaultOptions, ...options };
      const result = createSchemaMappingResult({}, {
        mappingId: mapping.id,
        sourceId: mapping.source.id,
        targetId: mapping.target.id,
      });;

      try {
        if (mergedOptions.validate) {
          const validation = this.validateMapping(mapping);
          if (!validation.isValid) {
            throw new Error(
              `Mapping validation failed: ${validation.errors.join(', ')}`
            );
          }
        }

        // Implement the actual mapping logic here
        result.data = await this.performMapping(sourceData, mapping, mergedOptions, result);
        
        // Calculate statistics
        result.stats.mappingConfidence = this.calculateConfidence(result);
        
      } catch (error) {
        result.errors.push({
          type: 'transformation',
          field: '',
          message: error.message,
        });
      } finally {
        result.meta.durationMs = Date.now() - startTime;
      }

      return result;
    },
    
    validateMapping(mapping: SchemaMapping) {
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Basic validation
      if (!mapping.source || !mapping.target) {
        errors.push('Source and target schemas are required');
      }
      
      if (!mapping.mappings || mapping.mappings.length === 0) {
        warnings.push('No field mappings defined');
      }
      
      // Validate required fields in mappings
      mapping.mappings?.forEach((mapping, index) => {
        if (!mapping.sourcePath || mapping.sourcePath.length === 0) {
          errors.push(`Mapping ${index}: Source path is required`);
        }
        if (!mapping.targetPath || mapping.targetPath.length === 0) {
          errors.push(`Mapping ${index}: Target path is required`);
        }
      });
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
    
    async generateMapping(
      sourceSchema: Record<string, any>,
      targetSchema: Record<string, any>,
      options: {
        confidenceThreshold?: number;
        includeExamples?: boolean;
      } = {}
    ): Promise<SchemaMapping> {
      const mapping = createSchemaMapping({
        source: {
          id: 'source-schema',
          name: 'Source Schema',
          format: 'json',
          schema: sourceSchema,
        },
        target: {
          id: 'target-schema',
          name: 'Target Schema',
          format: 'json',
          schema: targetSchema,
        },
      });
      
      // Simple field name matching for automatic mapping
      this.autoMapFields(sourceSchema, targetSchema, mapping, '', options);
      
      return mapping;
    },
    
    transformValue(value: any, transformFn: string | ((value: any) => any)): any {
      try {
        if (typeof transformFn === 'string') {
          const fn = SY2_CONSTANTS.TRANSFORMATIONS[transformFn as keyof typeof SY2_CONSTANTS.TRANSFORMATIONS];
          if (typeof fn === 'function') {
            return fn(value);
          }
          throw new Error(`Unknown transformation function: ${transformFn}`);
        }
        return transformFn(value);
      } catch (error) {
        throw new Error(`Transformation failed: ${error.message}`);
      }
    },
    
    // Helper methods
    private async performMapping(
      sourceData: Record<string, any>,
      mapping: SchemaMapping,
      options: SchemaMappingOptions,
      result: SchemaMappingResult
    ): Promise<Record<string, any>> {
      const targetData: Record<string, any> = {};
      
      for (const map of mapping.mappings) {
        try {
          // Get source value using the source path
          let sourceValue = this.getValueByPath(sourceData, map.sourcePath);
          
          // Apply transformation if specified
          if (map.transformation) {
            sourceValue = this.transformValue(sourceValue, map.transformation);
            result.stats.transformationCount++;
          }
          
          // Set the value in the target
          this.setValueByPath(targetData, map.targetPath, sourceValue);
          result.stats.mappedFields++;
          
        } catch (error) {
          if (options.strict) {
            throw error;
          }
          result.errors.push({
            type: 'transformation',
            field: map.targetPath.join('.'),
            message: error.message,
            sourceValue: this.getValueByPath(sourceData, map.sourcePath, undefined)
          });
        }
      }
      
      result.stats.totalFields = mapping.mappings.length;
      result.stats.missingFields = result.errors.filter(e => e.type === 'missing').length;
      
      return targetData;
    },
    
    private getValueByPath(
      obj: Record<string, any>,
      path: string[],
      defaultValue?: any
    ): any {
      return path.reduce((current, key) => {
        if (current === undefined || current === null) {
          return defaultValue;
        }
        return current[key];
      }, obj);
    },
    
    private setValueByPath(
      obj: Record<string, any>,
      path: string[],
      value: any
    ): void {
      let current = obj;
      
      for (let i = 0; i < path.length; i++) {
        const key = path[i];
        
        // If this is the last key, set the value
        if (i === path.length - 1) {
          current[key] = value;
          return;
        }
        
        // Create nested objects as needed
        if (current[key] === undefined) {
          current[key] = {};
        }
        
        current = current[key];
      }
    },
    
    private calculateConfidence(result: SchemaMappingResult): number {
      if (result.stats.totalFields === 0) return 0;
      
      const successRate = result.stats.mappedFields / result.stats.totalFields;
      const errorPenalty = result.errors.length * 0.1; // 10% penalty per error
      
      return Math.max(0, Math.min(1, successRate - errorPenalty));
    },
    
    private autoMapFields(
      sourceSchema: any,
      targetSchema: any,
      mapping: SchemaMapping,
      currentPath: string = '',
      options: { confidenceThreshold?: number } = {}
    ) {
      const threshold = options.confidenceThreshold ?? SY2_CONSTANTS.DEFAULTS.CONFIDENCE_THRESHOLD;
      
      // Simple implementation: match fields by name
      if (typeof sourceSchema === 'object' && typeof targetSchema === 'object') {
        for (const [targetKey, targetValue] of Object.entries(targetSchema)) {
          // Try to find a matching source field
          const sourceKey = Object.keys(sourceSchema).find(
            key => this.fieldNameSimilarity(key, targetKey) >= threshold
          );
          
          if (sourceKey) {
            const sourcePath = currentPath ? `${currentPath}.${sourceKey}` : sourceKey;
            const targetPath = currentPath ? `${currentPath}.${targetKey}` : targetKey;
            
            mapping.mappings.push({
              sourcePath: sourcePath.split('.'),
              targetPath: targetPath.split('.'),
              confidence: this.fieldNameSimilarity(sourceKey, targetKey),
              isRequired: false,
            });
            
            // Recursively map nested objects
            if (typeof sourceSchema[sourceKey] === 'object' && 
                typeof targetValue === 'object' &&
                sourceSchema[sourceKey] !== null &&
                targetValue !== null) {
              this.autoMapFields(
                sourceSchema[sourceKey],
                targetValue as Record<string, any>,
                mapping,
                sourceKey,
                options
              );
            }
          }
        }
      }
    },
    
    private fieldNameSimilarity(a: string, b: string): number {
      // Simple similarity metric (0-1) based on string distance
      if (a === b) return 1.0;
      
      // Normalize strings
      const str1 = a.toLowerCase().replace(/[^a-z0-9]/g, '');
      const str2 = b.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (str1 === str2) return 0.95; // Same after normalization
      
      // Check for common patterns
      if (str1.includes(str2) || str2.includes(str1)) {
        return 0.8;
      }
      
      // Check for common abbreviations
      const abbreviations: Record<string, string[]> = {
        id: ['identifier', 'identification'],
        num: ['number', 'numeric'],
        amt: ['amount'],
        dt: ['date'],
        ts: ['timestamp'],
        desc: ['description'],
        qty: ['quantity'],
        info: ['information'],
        addr: ['address'],
        fname: ['firstname', 'first_name'],
        lname: ['lastname', 'last_name'],
      };
      
      for (const [abbr, expansions] of Object.entries(abbreviations)) {
        if ((str1 === abbr && expansions.includes(str2)) ||
            (str2 === abbr && expansions.includes(str1))) {
          return 0.9;
        }
      }
      
      // Simple string similarity (Levenshtein distance would be better here)
      const set1 = new Set(str1);
      const set2 = new Set(str2);
      const intersection = new Set([...set1].filter(x => set2.has(x)));
      const union = new Set([...set1, ...set2]);
      
      return intersection.size / union.size;
    },
    
    ...config,
  };
  
  return model;
}

// Export types
export * from './types';
export * from './constants';

export default createSchemaMapper;
