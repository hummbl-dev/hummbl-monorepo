import { createStructuralDecomposition } from '..';
import { DE1_CONSTANTS } from '../constants';

describe('DE1: Structural Decomposition Model', () => {
  let model: ReturnType<typeof createStructuralDecomposition>;
  
  beforeAll(() => {
    model = createStructuralDecomposition();
  });
  
  describe('Model Initialization', () => {
    it('should create a model with the correct properties', () => {
      expect(model).toBeDefined();
      expect(model.id).toBe(DE1_CONSTANTS.MODEL_CODE.toLowerCase());
      expect(model.name).toBe(DE1_CONSTANTS.MODEL_NAME);
      expect(model.version).toBe(DE1_CONSTANTS.VERSION);
      expect(typeof model.decompose).toBe('function');
      expect(typeof model.recompose).toBe('function');
      expect(typeof model.analyzeComponents).toBe('function');
    });
    
    it('should have default configuration', () => {
      expect(model.config).toBeDefined();
      expect(model.config.maxDepth).toBe(DE1_CONSTANTS.DEFAULTS.MAX_DEPTH);
      expect(model.config.minComponentSize).toBe(DE1_CONSTANTS.DEFAULTS.MIN_COMPONENT_SIZE);
      expect(model.config.includeRelationships).toBe(true);
    });
  });
  
  describe('Decomposition', () => {
    it('should decompose a simple system', () => {
      const system = {
        name: 'E-commerce System',
        description: 'Online shopping platform',
        components: [
          { id: 'fe', name: 'Frontend', type: 'ui' },
          { id: 'be', name: 'Backend', type: 'service' },
          { id: 'db', name: 'Database', type: 'storage' },
        ],
      };
      
      const result = model.decompose(system);
      
      expect(result.components).toHaveLength(3);
      expect(result.relationships).toHaveLength(2); // fe->be, be->db
      expect(result.hierarchy.depth).toBe(1);
    });
    
    it('should respect max depth configuration', () => {
      const deepSystem = {
        name: 'Deep System',
        components: [
          {
            name: 'Layer 1',
            components: [
              {
                name: 'Layer 2',
                components: [
                  { name: 'Layer 3' }
                ]
              }
            ]
          }
        ]
      };
      
      const shallowModel = createStructuralDecomposition({
        maxDepth: 2
      });
      
      const result = shallowModel.decompose(deepSystem);
      expect(result.hierarchy.depth).toBe(2);
    });
  });
  
  describe('Recomposition', () => {
    it('should recompose decomposed components', () => {
      const components = [
        { id: '1', name: 'Component A' },
        { id: '2', name: 'Component B' },
        { id: '3', name: 'Component C' },
      ];
      
      const relationships = [
        { source: '1', target: '2', type: 'depends_on' },
        { source: '2', target: '3', type: 'depends_on' },
      ];
      
      const system = model.recompose({
        name: 'Test System',
        components,
        relationships,
      });
      
      expect(system.components).toHaveLength(3);
      expect(system.relationships).toHaveLength(2);
    });
  });
  
  describe('Component Analysis', () => {
    it('should analyze component relationships', () => {
      const components = [
        { id: '1', name: 'Component A' },
        { id: '2', name: 'Component B' },
        { id: '3', name: 'Component C' },
      ];
      
      const relationships = [
        { source: '1', target: '2', type: 'depends_on' },
        { source: '2', target: '3', type: 'depends_on' },
        { source: '1', target: '3', type: 'uses' },
      ];
      
      const analysis = model.analyzeComponents(components, relationships);
      
      expect(analysis.components['1'].dependencyCount).toBe(0);
      expect(analysis.components['2'].dependencyCount).toBe(1);
      expect(analysis.components['3'].dependencyCount).toBe(2);
      
      expect(analysis.relationshipStats.totalRelationships).toBe(3);
      expect(analysis.relationshipStats.relationshipTypes).toEqual({
        depends_on: 2,
        uses: 1
      });
    });
  });
  
  describe('Complex System Decomposition', () => {
    it('should handle complex nested systems', () => {
      const complexSystem = {
        name: 'Enterprise System',
        subsystems: [
          {
            name: 'Frontend',
            components: [
              { name: 'UI Framework', type: 'framework' },
              { name: 'State Management', type: 'library' },
            ]
          },
          {
            name: 'Backend',
            services: [
              { 
                name: 'API Gateway',
                endpoints: [
                  { path: '/users', method: 'GET' },
                  { path: '/products', method: 'GET' },
                ]
              },
              {
                name: 'Auth Service',
                functions: ['login', 'logout', 'register']
              }
            ]
          },
          {
            name: 'Data Layer',
            databases: [
              { name: 'Users DB', type: 'document' },
              { name: 'Products DB', type: 'relational' },
            ]
          }
        ]
      };
      
      const result = model.decompose(complexSystem, {
        maxDepth: 3,
        includeRelationships: true,
      });
      
      // Should have top-level components
      expect(result.components).toContainEqual(
        expect.objectContaining({ name: 'Frontend' })
      );
      
      // Should have nested components
      expect(result.components).toContainEqual(
        expect.objectContaining({ name: 'UI Framework' })
      );
      
      // Should have relationships between components
      expect(result.relationships.length).toBeGreaterThan(0);
      
      // Verify hierarchy depth
      expect(result.hierarchy.depth).toBe(3);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty systems', () => {
      const result = model.decompose({});
      expect(result.components).toHaveLength(0);
      expect(result.relationships).toHaveLength(0);
    });
    
    it('should handle circular dependencies', () => {
      const components = [
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
      ];
      
      const relationships = [
        { source: '1', target: '2', type: 'depends_on' },
        { source: '2', target: '1', type: 'depends_on' }, // Circular
      ];
      
      const analysis = model.analyzeComponents(components, relationships);
      expect(analysis.circularDependencies).toHaveLength(1);
    });
  });
});
