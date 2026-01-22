import { 
  createSyntacticBindingModel,
  createBinding,
  CO1_CONSTANTS,
  type ModelBinding,
  type BindingPattern,
  type ValidationResult,
  type CreateBindingParams,
  BindingType,
  ConstraintType,
  BindingDirection,
} from '../index';

describe('CO1: Syntactic Binding Model', () => {
  let model: ReturnType<typeof createSyntacticBindingModel>;
  
  // Sample components for testing
  const sampleComponents = [
    { componentId: 'data-source', role: 'source', isRequired: true },
    { componentId: 'data-processor', role: 'processor', isRequired: true },
    { componentId: 'data-sink', role: 'sink', isRequired: true },
    { componentId: 'logger', role: 'logger', isRequired: false },
  ];
  
  beforeEach(() => {
    model = createSyntacticBindingModel();
  });
  
  describe('Model Initialization', () => {
    it('should create a model with default configuration', () => {
      expect(model).toBeDefined();
      expect(model.id).toBe(CO1_CONSTANTS.MODEL_CODE.toLowerCase());
      expect(model.name).toBe(CO1_CONSTANTS.MODEL_NAME);
      expect(model.version).toBe(CO1_CONSTANTS.VERSION);
      
      // Verify default configuration
      expect(model.config).toEqual({
        maxBindingsPerComponent: 10,
        defaultPriority: 5,
        enableAutoValidation: true,
        strictMode: false,
      });
    });
    
    it('should load built-in patterns', () => {
      const patterns = model.listPatterns();
      expect(patterns.length).toBeGreaterThan(0);
      
      // Verify sample pattern exists
      const pipelinePattern = patterns.find(p => p.id === 'pipeline');
      expect(pipelinePattern).toBeDefined();
      expect(pipelinePattern?.name).toBe('Processing Pipeline');
    });
  });
  
  describe('Binding Creation', () => {
    it('should create a valid binding', () => {
      const binding = model.createBinding({
        type: BindingType.SEQUENTIAL,
        components: sampleComponents,
      });
      
      expect(binding).toBeDefined();
      expect(binding.id).toMatch(/^bind-/);
      expect(binding.type).toBe(BindingType.SEQUENTIAL);
      expect(binding.components).toHaveLength(sampleComponents.length);
      expect(binding.direction).toBe(BindingDirection.UNIDIRECTIONAL);
      expect(binding.isActive).toBe(true);
      expect(binding.meta.createdAt).toBeInstanceOf(Date);
    });
    
    it('should validate binding during creation when auto-validation is enabled', () => {
      // Create a binding with a missing required component
      const createInvalidBinding = () => {
        model.createBinding({
          type: BindingType.SEQUENTIAL,
          components: sampleComponents.filter(c => c.role !== 'source'),
        });
      };
      
      // Should not throw in non-strict mode (default)
      expect(createInvalidBinding).not.toThrow();
      
      // Enable strict mode and test again
      model.config.strictMode = true;
      expect(createInvalidBinding).toThrow();
    });
    
    it('should allow custom binding types', () => {
      const customType = 'custom-binding-type';
      const binding = model.createBinding({
        type: customType as any, // Cast to any to test custom types
        components: [sampleComponents[0]],
      });
      
      expect(binding.type).toBe(customType);
    });
  });
  
  describe('Binding Validation', () => {
    let validBinding: ModelBinding;
    
    beforeEach(() => {
      validBinding = model.createBinding({
        type: BindingType.SEQUENTIAL,
        components: sampleComponents,
        tags: ['test', 'pipeline'],
      });
    });
    
    it('should validate a valid binding', () => {
      const result = model.validateBinding({ binding: validBinding });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should detect invalid binding types', () => {
      const invalidBinding = { ...validBinding, type: 'invalid-type' };
      const result = model.validateBinding({ binding: invalidBinding as any });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_BINDING_TYPE',
          message: 'Invalid binding type: invalid-type',
        })
      );
    });
    
    it('should detect missing components', () => {
      const invalidBinding = { ...validBinding, components: [] };
      const result = model.validateBinding({ binding: invalidBinding });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'NO_COMPONENTS',
          message: 'At least one component is required',
        })
      );
    });
    
    it('should detect duplicate component references', () => {
      const invalidBinding = {
        ...validBinding,
        components: [
          ...sampleComponents,
          { ...sampleComponents[0] } // Duplicate first component
        ],
      };
      
      const result = model.validateBinding({ binding: invalidBinding });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'DUPLICATE_COMPONENT',
          message: expect.stringContaining('Duplicate component reference'),
        })
      );
    });
    
    it('should provide suggestions for improvements', () => {
      const bindingWithNoConstraints = {
        ...validBinding,
        constraints: [],
      };
      
      const result = model.validateBinding({ 
        binding: bindingWithNoConstraints,
        includeSuggestions: true,
      });
      
      expect(result.suggestions).toContain(
        'Add constraints to ensure the binding is used as intended.'
      );
    });
  });
  
  describe('Pattern Management', () => {
    it('should register a new pattern', () => {
      const patternCount = model.listPatterns().length;
      
      const newPattern: Omit<BindingPattern, 'id'> = {
        name: 'Test Pattern',
        description: 'A test pattern for unit testing',
        template: {
          type: BindingType.SEQUENTIAL,
          components: [{ componentId: 'test', role: 'test', isRequired: true }],
          constraints: [],
          direction: BindingDirection.UNIDIRECTIONAL,
          priority: 5,
          isActive: true,
          tags: ['test'],
        },
        example: {
          description: 'Test example',
          binding: {
            id: 'test-binding',
            type: BindingType.SEQUENTIAL,
            components: [{ componentId: 'test', role: 'test', isRequired: true }],
            constraints: [],
            direction: BindingDirection.UNIDIRECTIONAL,
            priority: 5,
            isActive: true,
            tags: ['test'],
            meta: {
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'test',
              lastUpdatedBy: 'test',
            },
          },
        },
        relatedPatterns: [],
        tags: ['test'],
        meta: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test',
          lastUpdatedBy: 'test',
        },
      };
      
      const registeredPattern = model.registerPattern(newPattern);
      
      expect(registeredPattern).toBeDefined();
      expect(registeredPattern.id).toMatch(/^pattern-/);
      expect(model.listPatterns()).toHaveLength(patternCount + 1);
      
      // Verify the pattern can be retrieved
      const retrievedPattern = model.getPattern(registeredPattern.id);
      expect(retrievedPattern).toEqual(registeredPattern);
    });
    
    it('should list patterns filtered by tags', () => {
      // Register a test pattern with a unique tag
      const testTag = `test-${Date.now()}`;
      const testPattern = model.registerPattern({
        name: 'Tagged Test Pattern',
        description: 'Pattern for tag filtering test',
        template: {
          type: BindingType.SEQUENTIAL,
          components: [{ componentId: 'test', role: 'test', isRequired: true }],
          constraints: [],
          direction: BindingDirection.UNIDIRECTIONAL,
          priority: 5,
          isActive: true,
          tags: ['test', testTag],
        },
        example: {
          description: 'Test example',
          binding: {
            id: 'test-binding',
            type: BindingType.SEQUENTIAL,
            components: [{ componentId: 'test', role: 'test', isRequired: true }],
            constraints: [],
            direction: BindingDirection.UNIDIRECTIONAL,
            priority: 5,
            isActive: true,
            tags: ['test'],
            meta: {
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'test',
              lastUpdatedBy: 'test',
            },
          },
        },
        relatedPatterns: [],
        tags: ['test', testTag],
        meta: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test',
          lastUpdatedBy: 'test',
        },
      });
      
      // Filter by the unique tag
      const filteredPatterns = model.listPatterns({ tags: [testTag] });
      expect(filteredPatterns).toHaveLength(1);
      expect(filteredPatterns[0].id).toBe(testPattern.id);
    });
  });
  
  describe('Binding Management', () => {
    let testBinding: ModelBinding;
    
    beforeEach(async () => {
      testBinding = model.createBinding({
        type: BindingType.SEQUENTIAL,
        components: sampleComponents,
        tags: ['test'],
      });
      
      // Apply the binding to the model
      await model.applyBinding(testBinding);
    });
    
    it('should apply a valid binding', async () => {
      // Binding should be retrievable after application
      const retrievedBinding = model.getBinding(testBinding.id);
      expect(retrievedBinding).toEqual(testBinding);
    });
    
    it('should list bindings with filters', () => {
      // Create a second binding with a different type
      const pubSubBinding = model.createBinding({
        type: BindingType.PUB_SUB,
        components: [sampleComponents[0]],
        tags: ['pubsub', 'test'],
      });
      
      // Test type filter
      const sequentialBindings = model.listBindings({ type: BindingType.SEQUENTIAL });
      expect(sequentialBindings).toContainEqual(expect.objectContaining({
        id: testBinding.id,
        type: BindingType.SEQUENTIAL,
      }));
      
      // Test tag filter
      const pubSubBindings = model.listBindings({ tags: ['pubsub'] });
      expect(pubSubBindings).toContainEqual(expect.objectContaining({
        id: pubSubBinding.id,
        type: BindingType.PUB_SUB,
      }));
      
      // Test component ID filter
      const componentBindings = model.listBindings({ 
        componentId: sampleComponents[0].componentId 
      });
      expect(componentBindings).toContainEqual(expect.objectContaining({
        id: testBinding.id,
      }));
    });
    
    it('should remove a binding', () => {
      const result = model.removeBinding(testBinding.id);
      expect(result).toBe(true);
      expect(model.getBinding(testBinding.id)).toBeNull();
      
      // Removing a non-existent binding should return false
      expect(model.removeBinding('non-existent-id')).toBe(false);
    });
  });
  
  describe('Utility Methods', () => {
    it('should suggest bindings for components', () => {
      const suggestions = model.suggestBindings(sampleComponents);
      
      // Should suggest the pipeline pattern since we have source, processor, and sink
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].type).toBe(BindingType.SEQUENTIAL);
    });
    
    it('should optimize bindings by removing duplicates', () => {
      const binding1 = model.createBinding({
        type: BindingType.SEQUENTIAL,
        components: [sampleComponents[0], sampleComponents[1]],
      });
      
      // Create a duplicate binding (same components and type)
      const binding2 = model.createBinding({
        type: BindingType.SEQUENTIAL,
        components: [sampleComponents[0], sampleComponents[1]],
      });
      
      const optimized = model.optimizeBindings([binding1, binding2]);
      expect(optimized).toHaveLength(1);
    });
  });
  
  describe('Convenience Function', () => {
    it('should create a binding using the convenience function', () => {
      const binding = createBinding({
        type: BindingType.SEQUENTIAL,
        components: sampleComponents,
      });
      
      expect(binding).toBeDefined();
      expect(binding.id).toMatch(/^bind-/);
      expect(binding.type).toBe(BindingType.SEQUENTIAL);
    });
  });
});
