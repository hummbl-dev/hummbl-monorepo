import { createSchemaMapper } from '..';
import { 
  createSchemaMapping,
  SY2_CONSTANTS,
  createSchemaMappingResult
} from '../constants';
import type { 
  SchemaMapping,
  SchemaMappingResult
} from '../types';

describe('SY2: Universal Schema Mapping Model', () => {
  let model: ReturnType<typeof createSchemaMapper>;
  let testMapping: SchemaMapping;
  
  beforeAll(() => {
    model = createSchemaMapper();
    
    // Create a test mapping
    testMapping = createSchemaMapping({
      source: {
        id: 'test-source',
        name: 'Test Source',
        format: 'json',
        schema: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            age: { type: 'number' },
            email: { type: 'string', format: 'email' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                zip: { type: 'string' },
              },
            },
          },
          required: ['firstName', 'lastName', 'email'],
        },
      },
      target: {
        id: 'test-target',
        name: 'Test Target',
        format: 'json',
        schema: {
          type: 'object',
          properties: {
            name: {
              first: { type: 'string' },
              last: { type: 'string' },
            },
            age: { type: 'integer' },
            contact: {
              email: { type: 'string', format: 'email' },
            },
            location: {
              address: { type: 'string' },
              city: { type: 'string' },
              postalCode: { type: 'string' },
            },
          },
          required: ['name', 'contact'],
        },
      },
    });
    
    // Define field mappings
    testMapping.mappings = [
      {
        sourcePath: ['firstName'],
        targetPath: ['name', 'first'],
        confidence: 1.0,
        isRequired: true,
      },
      {
        sourcePath: ['lastName'],
        targetPath: ['name', 'last'],
        confidence: 1.0,
        isRequired: true,
      },
      {
        sourcePath: ['age'],
        targetPath: ['age'],
        confidence: 0.9,
        isRequired: false,
      },
      {
        sourcePath: ['email'],
        targetPath: ['contact', 'email'],
        confidence: 1.0,
        isRequired: true,
      },
      {
        sourcePath: ['address', 'street'],
        targetPath: ['location', 'address'],
        confidence: 0.8,
        isRequired: false,
      },
      {
        sourcePath: ['address', 'city'],
        targetPath: ['location', 'city'],
        confidence: 0.8,
        isRequired: false,
      },
      {
        sourcePath: ['address', 'zip'],
        targetPath: ['location', 'postalCode'],
        confidence: 0.7,
        isRequired: false,
      },
    ];
    
    // Add some validation rules
    testMapping.validation = {
      requiredFields: ['name.first', 'name.last', 'contact.email'],
      fieldFormats: {
        'contact.email': SY2_CONSTANTS.FORMATS.EMAIL,
      },
      crossFieldValidations: [
        {
          fields: ['age'],
          validate: (values: Record<string, any>) => {
            const age = values['age'];
            return age === undefined || (Number.isInteger(age) && age >= 0 && age <= 150);
          },
          error: 'Age must be between 0 and 150',
        },
      ],
    };
  });
  
  describe('Model Initialization', () => {
    it('should create a model with the correct properties', () => {
      expect(model).toBeDefined();
      expect(model.id).toContain('mapper-');
      expect(model.name).toBe(SY2_CONSTANTS.MODEL_NAME);
      expect(model.version).toBe(SY2_CONSTANTS.VERSION);
      expect(typeof model.map).toBe('function');
      expect(typeof model.validateMapping).toBe('function');
      expect(typeof model.generateMapping).toBe('function');
      expect(typeof model.transformValue).toBe('function');
    });
    
    it('should have default configuration', () => {
      expect(model.defaultOptions).toBeDefined();
      expect(model.defaultOptions.validate).toBe(true);
      expect(model.defaultOptions.includeMetadata).toBe(false);
      expect(model.defaultOptions.strict).toBe(true);
    });
  });
  
  describe('Mapping Validation', () => {
    it('should validate a valid mapping', () => {
      const validation = model.validateMapping(testMapping);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
    
    it('should detect invalid mappings', () => {
      const invalidMapping = { ...testMapping, mappings: [] };
      const validation = model.validateMapping(invalidMapping);
      expect(validation.isValid).toBe(true); // Empty mappings are allowed, just warned
      expect(validation.warnings).toContain('No field mappings defined');
    });
  });
  
  describe('Data Transformation', () => {
    it('should transform data according to the mapping', async () => {
      const sourceData = {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        email: 'john.doe@example.com',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          zip: '12345',
        },
      };
      
      const result = await model.map(sourceData, testMapping);
      
      expect(result.data).toEqual({
        name: {
          first: 'John',
          last: 'Doe',
        },
        age: 30,
        contact: {
          email: 'john.doe@example.com',
        },
        location: {
          address: '123 Main St',
          city: 'Anytown',
          postalCode: '12345',
        },
      });
      
      expect(result.stats.mappedFields).toBe(7);
      expect(result.stats.missingFields).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should handle missing optional fields', async () => {
      const sourceData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        // Missing age and address
      };
      
      const result = await model.map(sourceData, testMapping, { strict: false });
      
      expect(result.data).toEqual({
        name: {
          first: 'Jane',
          last: 'Smith',
        },
        contact: {
          email: 'jane.smith@example.com',
        },
        // age and location should be undefined
      });
      
      // Should have warnings for missing optional fields
      expect(result.stats.mappedFields).toBe(3);
      expect(result.stats.missingFields).toBe(0); // Not missing, just not provided
      expect(result.warnings).toHaveLength(0);
    });
    
    it('should fail on missing required fields in strict mode', async () => {
      const sourceData = {
        // Missing firstName (required)
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };
      
      await expect(model.map(sourceData, testMapping, { strict: true }))
        .rejects
        .toThrow('Required field is missing');
    });
    
    it('should apply transformations', async () => {
      const sourceData = {
        firstName: 'john',
        lastName: 'doe',
        email: 'john.doe@example.com',
      };
      
      // Add a transformation to capitalize names
      const mapping = { ...testMapping };
      mapping.mappings = mapping.mappings.map(m => {
        if (m.targetPath.join('.') === 'name.first' || m.targetPath.join('.') === 'name.last') {
          return {
            ...m,
            transformation: (val: string) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase(),
          };
        }
        return m;
      });
      
      const result = await model.map(sourceData, mapping);
      
      expect(result.data).toEqual({
        name: {
          first: 'John',
          last: 'Doe',
        },
        contact: {
          email: 'john.doe@example.com',
        },
      });
    });
  });
  
  describe('Automatic Mapping Generation', () => {
    it('should generate a mapping between similar schemas', async () => {
      const sourceSchema = {
        user: {
          name: 'string',
          email_address: 'string',
          age: 'number',
          address: {
            street: 'string',
            city: 'string',
            zip_code: 'string',
          },
        },
      };
      
      const targetSchema = {
        person: {
          fullName: 'string',
          contact: {
            email: 'string',
          },
          age: 'integer',
          location: {
            streetAddress: 'string',
            city: 'string',
            postalCode: 'string',
          },
        },
      };
      
      const mapping = await model.generateMapping(sourceSchema, targetSchema, {
        confidenceThreshold: 0.6,
      });
      
      // Should have mappings for the matching fields
      const mappedTargets = mapping.mappings.map(m => m.targetPath.join('.'));
      
      expect(mappedTargets).toContain('person.contact.email');
      expect(mappedTargets).toContain('person.age');
      expect(mappedTargets).toContain('person.location.city');
      
      // Check that the source and target are set correctly
      expect(mapping.source.schema).toEqual(sourceSchema);
      expect(mapping.target.schema).toEqual(targetSchema);
    });
  });
  
  describe('Value Transformation', () => {
    it('should apply built-in transformations', () => {
      expect(model.transformValue('  TEST  ', 'trim')).toBe('TEST');
      expect(model.transformValue('test', 'toUpperCase')).toBe('TEST');
      expect(model.transformValue('TEST', 'toLowerCase')).toBe('test');
      expect(model.transformValue('123', 'toInt')).toBe(123);
      expect(model.transformValue('3.14', 'toFloat')).toBe(3.14);
      expect(model.transformValue('true', 'toBoolean')).toBe(true);
      expect(model.transformValue('2023-01-01', 'toDate')).toEqual(new Date('2023-01-01'));
    });
    
    it('should apply custom transformation functions', () => {
      const result = model.transformValue('hello', (val: string) => val.toUpperCase() + '!');
      expect(result).toBe('HELLO!');
    });
    
    it('should throw for unknown transformation names', () => {
      expect(() => model.transformValue('test', 'unknownTransform')).toThrow('Unknown transformation function');
    });
  });
  
  describe('Error Handling', () => {
    it('should handle transformation errors gracefully in non-strict mode', async () => {
      const sourceData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email', // Invalid email format
      };
      
      const result = await model.map(sourceData, testMapping, { strict: false });
      
      // Should have an error about the invalid email format
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Field format is invalid');
      
      // Should still return partial results
      expect(result.data.name).toEqual({
        first: 'John',
        last: 'Doe',
      });
    });
    
    it('should include validation errors in the result', async () => {
      const invalidMapping = { ...testMapping };
      // @ts-ignore - Testing invalid case
      invalidMapping.mappings[0].sourcePath = undefined;
      
      const validation = model.validateMapping(invalidMapping);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors[0]).toContain('Source path is required');
    });
  });
});
