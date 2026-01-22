import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createConceptualFusionModel, 
  fuseConcepts,
  Concept,
  Conflict,
  TransformationRule,
  FuseConceptsParams,
  FindSimilarConceptsParams,
  ValidationResult,
  FusionResult
} from '../index';
import { 
  CO2_CONSTANTS, 
  EXAMPLE_CONCEPTS 
} from '../constants';

describe('CO2: Conceptual Fusion Model', () => {
  let model: ReturnType<typeof createConceptualFusionModel>;
  let testConcepts: Concept[] = [];
  
  // Sample test data
  const customerConcept: Omit<Concept, 'id'> = {
    name: 'Customer',
    description: 'A person or organization that purchases goods or services',
    sourceModels: ['CRM', 'Billing'],
    properties: {
      name: { value: 'string', confidence: 0.95, sources: ['CRM', 'Billing'] },
      email: { value: 'string', confidence: 0.9, sources: ['CRM'] },
      billingAddress: { value: 'Address', confidence: 0.85, sources: ['Billing'] }
    },
    relationships: [
      { targetId: 'Order', type: 'hasMany', strength: 0.9, bidirectional: true }
    ],
    meta: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test',
      lastUpdatedBy: 'test',
      version: '1.0.0'
    },
    tags: ['core', 'business'],
    confidence: 0.9,
    isActive: true
  };
  
  const clientConcept: Omit<Concept, 'id'> = {
    name: 'Client',
    description: 'A customer in the sales system',
    sourceModels: ['Sales'],
    properties: {
      fullName: { value: 'string', confidence: 0.92, sources: ['Sales'] },
      contactEmail: { value: 'string', confidence: 0.88, sources: ['Sales'] },
      company: { value: 'string', confidence: 0.8, sources: ['Sales'] }
    },
    relationships: [
      { targetId: 'Order', type: 'places', strength: 0.85, bidirectional: false }
    ],
    meta: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test',
      lastUpdatedBy: 'test',
      version: '1.0.0',
      aliases: ['Customer']
    },
    tags: ['sales', 'external'],
    confidence: 0.85,
    isActive: true
  };
  
  // Setup before each test
  beforeEach(() => {
    // Create a fresh model instance
    model = createConceptualFusionModel({
      defaultSimilarityThreshold: 0.7,
      maxConceptsToFuse: 10,
      autoResolveConflicts: true,
      defaultFusionStrategy: 'union',
      enableCaching: false
    });
    
    // Add test concepts
    testConcepts = [
      model.addConcept(customerConcept),
      model.addConcept(clientConcept)
    ];
  });
  
  describe('Model Initialization', () => {
    it('should create a model with default configuration', () => {
      expect(model).toBeDefined();
      expect(model.id).toBe(CO2_CONSTANTS.MODEL_ID);
      expect(model.name).toBe(CO2_CONSTANTS.MODEL_NAME);
      expect(model.version).toBe(CO2_CONSTANTS.VERSION);
      
      // Verify default configuration
      expect(model.config.defaultSimilarityThreshold).toBe(0.7);
      expect(model.config.maxConceptsToFuse).toBe(10);
      expect(model.config.autoResolveConflicts).toBe(true);
      expect(model.config.defaultFusionStrategy).toBe('union');
    });
    
    it('should initialize with example concepts', () => {
      // The model is initialized with example concepts in the constants
      expect(testConcepts.length).toBeGreaterThan(0);
      expect(testConcepts[0].name).toBe('Customer');
      expect(testConcepts[1].name).toBe('Client');
    });
  });
  
  describe('Concept Management', () => {
    it('should add a new concept', () => {
      const newConcept: Omit<Concept, 'id' | 'meta'> = {
        name: 'Product',
        description: 'An item available for purchase',
        sourceModels: ['Inventory'],
        properties: {
          name: { value: 'string', confidence: 0.95, sources: ['Inventory'] },
          price: { value: 'number', confidence: 0.9, sources: ['Inventory'] }
        },
        relationships: [],
        tags: ['inventory'],
        confidence: 0.9,
        isActive: true
      };
      
      const concept = model.addConcept(newConcept);
      
      expect(concept).toBeDefined();
      expect(concept.id).toBeDefined();
      expect(concept.name).toBe('Product');
      expect(concept.properties.name.value).toBe('string');
      expect(concept.meta.createdAt).toBeInstanceOf(Date);
      expect(concept.meta.version).toBe('1.0.0');
    });
    
    it('should get a concept by ID', () => {
      const concept = model.getConcept(testConcepts[0].id);
      
      expect(concept).toBeDefined();
      expect(concept?.id).toBe(testConcepts[0].id);
      expect(concept?.name).toBe('Customer');
    });
    
    it('should update a concept', () => {
      const updatedName = 'Updated Customer';
      const updated = model.updateConcept(testConcepts[0].id, { 
        name: updatedName,
        description: 'Updated description'
      });
      
      expect(updated).toBeDefined();
      expect(updated?.name).toBe(updatedName);
      expect(updated?.description).toBe('Updated description');
      expect(updated?.meta.updatedAt).not.toBe(testConcepts[0].meta.updatedAt);
      expect(updated?.meta.version).not.toBe(testConcepts[0].meta.version);
    });
    
    it('should remove a concept', () => {
      const conceptId = testConcepts[0].id;
      const removed = model.removeConcept(conceptId);
      
      expect(removed).toBe(true);
      expect(model.getConcept(conceptId)).toBeNull();
    });
    
    it('should validate concept data', () => {
      // Test with invalid concept (missing required fields)
      const invalidConcept = { name: '' } as unknown as Concept;
      const validation = model.validateConcept(invalidConcept);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(e => e.code === 'missing-name')).toBe(true);
      
      // Test with valid concept
      const validConcept = model.getConcept(testConcepts[0].id)!;
      const validValidation = model.validateConcept(validConcept);
      expect(validValidation.isValid).toBe(true);
    });
  });
  
  describe('Fusion Operations', () => {
    it('should fuse two concepts using union strategy', async () => {
      const params: FuseConceptsParams = {
        conceptIds: [testConcepts[0].id, testConcepts[1].id],
        strategy: 'union',
        context: {}
      };
      
      const result = await model.fuseConcepts(params);
      
      expect(result).toBeDefined();
      expect(result.result).toBeDefined();
      expect(result.result.name).toContain('Fused_');
      
      // Verify properties from both concepts are included
      expect(result.result.properties.name).toBeDefined();
      expect(result.result.properties.fullName).toBeDefined();
      
      // Verify relationships from both concepts are included
      expect(result.result.relationships.length).toBe(2);
      
      // Verify metrics
      expect(result.metrics.inputConcepts).toBe(2);
      expect(result.metrics.propertiesMerged).toBeGreaterThan(0);
    });
    
    it('should fuse concepts using intersection strategy', async () => {
      const params: FuseConceptsParams = {
        conceptIds: [testConcepts[0].id, testConcepts[1].id],
        strategy: 'intersection',
        context: {}
      };
      
      const result = await model.fuseConcepts(params);
      
      expect(result).toBeDefined();
      
      // In intersection, only common properties should be included
      // Since our test concepts don't share property names, we expect few or no properties
      const propertyCount = Object.keys(result.result.properties).length;
      expect(propertyCount).toBe(0); // No common property names in our test data
    });
    
    it('should fuse concepts using preferred strategy', async () => {
      const params: FuseConceptsParams = {
        conceptIds: [testConcepts[0].id, testConcepts[1].id],
        strategy: 'preferred',
        context: {
          priorityOrder: ['CRM', 'Sales', 'Billing'] // CRM has higher priority than Sales
        }
      };
      
      const result = await model.fuseConcepts(params);
      
      expect(result).toBeDefined();
      
      // In preferred strategy, properties from higher priority sources should be kept
      // CRM is first in priority, so its properties should be preferred
      expect(result.result.properties.name).toBeDefined(); // From CRM
      expect(result.result.properties.fullName).toBeUndefined(); // From Sales, should be overridden
    });
    
    it('should detect conflicts between concepts', () => {
      const conflicts = model.detectConflicts([testConcepts[0].id, testConcepts[1].id]);
      
      // We expect at least a naming conflict between 'Customer' and 'Client'
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts.some(c => c.type === 'naming')).toBe(true);
    });
    
    it('should find similar concepts', async () => {
      // First, ensure we have similar concepts
      const similarConcept: Omit<Concept, 'id'> = {
        name: 'Cust0mer', // Typo to test similarity
        description: 'A person who buys goods or services',
        sourceModels: ['Test'],
        properties: {
          name: { value: 'string', confidence: 0.9, sources: ['Test'] },
          email: { value: 'string', confidence: 0.85, sources: ['Test'] }
        },
        relationships: [],
        tags: ['test'],
        confidence: 0.9,
        isActive: true
      };
      
      const addedConcept = model.addConcept(similarConcept);
      
      // Find concepts similar to the customer concept
      const params: FindSimilarConceptsParams = {
        conceptId: testConcepts[0].id, // Customer
        threshold: 0.6,
        limit: 5
      };
      
      const similar = await model.findSimilarConcepts(params);
      
      expect(similar).toBeInstanceOf(Array);
      expect(similar.length).toBeGreaterThan(0);
      
      // The similar concept should have a high similarity score
      const similarMatch = similar.find(s => s.concept.id === addedConcept.id);
      expect(similarMatch).toBeDefined();
      expect(similarMatch?.score).toBeGreaterThan(0.7);
    });
  });
  
  describe('Rule Management', () => {
    it('should add a transformation rule', () => {
      const rule: Omit<TransformationRule, 'id' | 'meta'> = {
        name: 'Test Rule',
        description: 'A test transformation rule',
        priority: 50,
        condition: 'return true;',
        action: 'return concept;',
        isActive: true,
        tags: ['test']
      };
      
      const addedRule = model.addRule(rule);
      
      expect(addedRule).toBeDefined();
      expect(addedRule.id).toBeDefined();
      expect(addedRule.name).toBe('Test Rule');
      expect(addedRule.meta.createdAt).toBeInstanceOf(Date);
    });
    
    it('should get a rule by ID', () => {
      // First add a rule
      const rule: Omit<TransformationRule, 'id' | 'meta'> = {
        name: 'Test Get Rule',
        description: 'A rule to test retrieval',
        priority: 50,
        condition: 'return true;',
        action: 'return concept;',
        isActive: true,
        tags: ['test']
      };
      
      const addedRule = model.addRule(rule);
      const foundRule = model.getRule(addedRule.id);
      
      expect(foundRule).toBeDefined();
      expect(foundRule?.id).toBe(addedRule.id);
      expect(foundRule?.name).toBe('Test Get Rule');
    });
    
    it('should update a rule', () => {
      // First add a rule
      const rule: Omit<TransformationRule, 'id' | 'meta'> = {
        name: 'Test Update Rule',
        description: 'A rule to test updates',
        priority: 50,
        condition: 'return true;',
        action: 'return concept;',
        isActive: true,
        tags: ['test']
      };
      
      const addedRule = model.addRule(rule);
      const updatedName = 'Updated Rule Name';
      
      const updatedRule = model.updateRule(addedRule.id, { 
        name: updatedName,
        isActive: false 
      });
      
      expect(updatedRule).toBeDefined();
      expect(updatedRule?.name).toBe(updatedName);
      expect(updatedRule?.isActive).toBe(false);
      expect(updatedRule?.meta.updatedAt).not.toBe(addedRule.meta.updatedAt);
    });
    
    it('should remove a rule', () => {
      // First add a rule
      const rule: Omit<TransformationRule, 'id' | 'meta'> = {
        name: 'Test Remove Rule',
        description: 'A rule to test removal',
        priority: 50,
        condition: 'return true;',
        action: 'return concept;',
        isActive: true,
        tags: ['test']
      };
      
      const addedRule = model.addRule(rule);
      const removed = model.removeRule(addedRule.id);
      
      expect(removed).toBe(true);
      expect(model.getRule(addedRule.id)).toBeNull();
    });
  });
  
  describe('Event Handling', () => {
    it('should trigger events on concept operations', async () => {
      const onConceptAdded = vi.fn();
      const onConceptUpdated = vi.fn();
      const onConceptRemoved = vi.fn();
      
      // Register event handlers
      model.on('conceptAdded', onConceptAdded);
      model.on('conceptUpdated', onConceptUpdated);
      model.on('conceptRemoved', onConceptRemoved);
      
      // Add a concept
      const newConcept: Omit<Concept, 'id'> = {
        name: 'Event Test',
        description: 'Test event triggering',
        sourceModels: ['Test'],
        properties: {},
        relationships: [],
        tags: [],
        confidence: 1.0,
        isActive: true
      };
      
      const concept = model.addConcept(newConcept);
      
      // Update the concept
      model.updateConcept(concept.id, { description: 'Updated description' });
      
      // Remove the concept
      model.removeConcept(concept.id);
      
      // Verify events were triggered
      expect(onConceptAdded).toHaveBeenCalledTimes(1);
      expect(onConceptUpdated).toHaveBeenCalledTimes(1);
      expect(onConceptRemoved).toHaveBeenCalledTimes(1);
    });
    
    it('should trigger fusion events', async () => {
      const onBeforeFusion = vi.fn();
      const onAfterFusion = vi.fn();
      
      // Register event handlers
      model.on('beforeFusion', onBeforeFusion);
      model.on('afterFusion', onAfterFusion);
      
      // Perform fusion
      const params: FuseConceptsParams = {
        conceptIds: [testConcepts[0].id, testConcepts[1].id],
        strategy: 'union'
      };
      
      await model.fuseConcepts(params);
      
      // Verify events were triggered
      expect(onBeforeFusion).toHaveBeenCalledTimes(1);
      expect(onAfterFusion).toHaveBeenCalledTimes(1);
      
      // Verify event data
      const beforeFusionData = onBeforeFusion.mock.calls[0][0];
      expect(beforeFusionData.concepts.length).toBe(2);
      expect(beforeFusionData.strategy).toBe('union');
      
      const afterFusionData = onAfterFusion.mock.calls[0][0];
      expect(afterFusionData.result).toBeDefined();
      expect(afterFusionData.result.result).toBeDefined();
    });
  });
  
  describe('Convenience Function', () => {
    it('should provide a direct fuseConcepts function', async () => {
      const concept1 = model.addConcept({
        name: 'Concept1',
        description: 'First concept',
        sourceModels: ['Test'],
        properties: { prop1: { value: 'value1', confidence: 0.9, sources: ['Test'] } },
        relationships: [],
        tags: [],
        confidence: 1.0,
        isActive: true
      });
      
      const concept2 = model.addConcept({
        name: 'Concept2',
        description: 'Second concept',
        sourceModels: ['Test'],
        properties: { prop2: { value: 'value2', confidence: 0.9, sources: ['Test'] } },
        relationships: [],
        tags: [],
        confidence: 1.0,
        isActive: true
      });
      
      const result = await fuseConcepts({
        conceptIds: [concept1.id, concept2.id],
        strategy: 'union'
      });
      
      expect(result).toBeDefined();
      expect(result.result).toBeDefined();
      expect(result.result.properties.prop1).toBeDefined();
      expect(result.result.properties.prop2).toBeDefined();
    });
  });
  
  describe('Error Handling', () => {
    it('should handle invalid concept IDs in fusion', async () => {
      const invalidParams: FuseConceptsParams = {
        conceptIds: ['nonexistent-id-1', 'nonexistent-id-2'],
        strategy: 'union'
      };
      
      await expect(model.fuseConcepts(invalidParams)).rejects.toThrow('One or more concepts not found');
    });
    
    it('should handle invalid fusion strategy', async () => {
      const params = {
        conceptIds: [testConcepts[0].id, testConcepts[1].id],
        strategy: 'invalid-strategy'
      } as unknown as FuseConceptsParams;
      
      await expect(model.fuseConcepts(params)).rejects.toThrow('Unknown fusion strategy');
    });
    
    it('should handle empty concept list in fusion', async () => {
      const params: FuseConceptsParams = {
        conceptIds: [],
        strategy: 'union'
      };
      
      await expect(model.fuseConcepts(params)).rejects.toThrow('At least two concepts are required for fusion');
    });
    
    it('should handle maximum concepts limit', async () => {
      // Create a model with a lower maxConceptsToFuse for testing
      const testModel = createConceptualFusionModel({
        maxConceptsToFuse: 2
      });
      
      const conceptIds = [
        testModel.addConcept({ ...customerConcept, name: 'Concept1' }).id,
        testModel.addConcept({ ...customerConcept, name: 'Concept2' }).id,
        testModel.addConcept({ ...customerConcept, name: 'Concept3' }).id
      ];
      
      const params: FuseConceptsParams = {
        conceptIds,
        strategy: 'union'
      };
      
      await expect(testModel.fuseConcepts(params)).rejects.toThrow(CO2_CONSTANTS.ERRORS.MAX_CONCEPTS_EXCEEDED);
    });
  });
});

describe('CO2: Conceptual Fusion Model - Integration', () => {
  it('should perform a complete fusion workflow', async () => {
    // Create a fresh model
    const model = createConceptualFusionModel();
    
    // Add some test concepts
    const concept1 = model.addConcept({
      name: 'User',
      description: 'A system user',
      sourceModels: ['Auth'],
      properties: {
        username: { value: 'string', confidence: 0.95, sources: ['Auth'] },
        password: { value: 'string', confidence: 0.9, sources: ['Auth'] },
        lastLogin: { value: 'Date', confidence: 0.8, sources: ['Auth'] }
      },
      relationships: [],
      tags: ['authentication', 'user'],
      confidence: 0.9,
      isActive: true
    });
    
    const concept2 = model.addConcept({
      name: 'Member',
      description: 'A registered member',
      sourceModels: ['Membership'],
      properties: {
        email: { value: 'string', confidence: 0.92, sources: ['Membership'] },
        joinDate: { value: 'Date', confidence: 0.88, sources: ['Membership'] },
        status: { value: 'string', confidence: 0.85, sources: ['Membership'] }
      },
      relationships: [
        { targetId: 'Subscription', type: 'has', strength: 0.9, bidirectional: false }
      ],
      tags: ['membership', 'user'],
      confidence: 0.85,
      isActive: true
    });
    
    // Add a custom transformation rule
    model.addRule({
      name: 'Merge User and Member',
      description: 'Merges User and Member concepts into a unified User',
      priority: 100,
      condition: `
        (concept1, concept2) => {
          return (concept1.name === 'User' && concept2.name === 'Member') ||
                 (concept1.name === 'Member' && concept2.name === 'User');
        }
      `,
      action: `
        (concept1, concept2) => {
          // Prefer the User concept as base
          const userConcept = concept1.name === 'User' ? concept1 : concept2;
          const memberConcept = concept1.name === 'User' ? concept2 : concept1;
          
          // Create merged concept
          return {
            ...userConcept,
            name: 'User',
            description: 'A system user with membership',
            sourceModels: [...new Set([...userConcept.sourceModels, ...memberConcept.sourceModels])],
            properties: {
              ...memberConcept.properties, // Member properties first (can be overridden)
              ...userConcept.properties,   // User properties second (higher priority)
              // Add a merged property
              type: {
                value: 'UserWithMembership',
                confidence: 0.95,
                sources: ['Fusion']
              }
            },
            relationships: [
              ...userConcept.relationships,
              ...memberConcept.relationships.filter(r => 
                !userConcept.relationships.some(ur => ur.targetId === r.targetId && ur.type === r.type)
              )
            ],
            tags: [...new Set([...userConcept.tags, ...memberConcept.tags])],
            confidence: Math.max(userConcept.confidence, memberConcept.confidence),
            meta: {
              ...userConcept.meta,
              fusedFrom: [userConcept.id, memberConcept.id],
              fusionStrategy: 'custom',
              fusionRule: 'Merge User and Member'
            }
          };
        }
      `,
      isActive: true,
      tags: ['user', 'membership', 'fusion']
    });
    
    // Perform fusion
    const result = await model.fuseConcepts({
      conceptIds: [concept1.id, concept2.id],
      strategy: 'custom',
      context: {
        rules: ['Merge User and Member']
      }
    });
    
    // Verify the result
    expect(result).toBeDefined();
    expect(result.result.name).toBe('User');
    expect(result.result.description).toBe('A system user with membership');
    
    // Verify properties from both concepts are included
    expect(result.result.properties.username).toBeDefined();
    expect(result.result.properties.email).toBeDefined();
    expect(result.result.properties.type.value).toBe('UserWithMembership');
    
    // Verify relationships
    expect(result.result.relationships.length).toBe(1);
    expect(result.result.relationships[0].targetId).toBe('Subscription');
    
    // Verify source models
    expect(result.result.sourceModels).toContain('Auth');
    expect(result.result.sourceModels).toContain('Membership');
    
    // Verify tags
    expect(result.result.tags).toContain('authentication');
    expect(result.result.tags).toContain('membership');
    expect(result.result.tags).toContain('user');
    
    // Verify metadata
    expect(result.result.meta.fusedFrom).toContain(concept1.id);
    expect(result.result.meta.fusedFrom).toContain(concept2.id);
    expect(result.result.meta.fusionStrategy).toBe('custom');
    
    // Verify conflicts were resolved
    expect(result.resolvedConflicts.length).toBeGreaterThan(0);
    expect(result.unresolvedConflicts.length).toBe(0);
    
    // Verify metrics
    expect(result.metrics.inputConcepts).toBe(2);
    expect(result.metrics.propertiesMerged).toBeGreaterThan(0);
    expect(result.metrics.conflictsResolved).toBeGreaterThan(0);
    expect(result.metrics.conflictsRemaining).toBe(0);
    expect(result.metrics.fusionTime).toBeGreaterThan(0);
  });
});
