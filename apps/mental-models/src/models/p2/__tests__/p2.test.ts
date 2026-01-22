import modelExports from '../index';
import type { Stakeholder } from '../types';

// Destructure the exports
const { 
  createStakeholderModel, 
  analyzeStakeholderMap,
  createStakeholder
} = modelExports;
import { 
  P2_CONSTANTS, 
  EXAMPLE_STAKEHOLDERS, 
  EXAMPLE_SCENARIO 
} from '../constants';

describe('P2 - Stakeholder Mapping', () => {
  let model: ReturnType<typeof createStakeholderModel>;
  let testStakeholders: Stakeholder[];

  beforeEach(() => {
    model = createStakeholderModel();
    testStakeholders = EXAMPLE_STAKEHOLDERS.map(s => createStakeholder(s));
  });

  describe('Model Creation', () => {
    it('should create a model with correct constants', () => {
      expect(model.id).toBe('p2');
      expect(model.name).toBe(P2_CONSTANTS.MODEL_NAME);
      expect(model.transformation).toBe(P2_CONSTANTS.TRANSFORMATION);
      expect(model.tier).toBe(1);
    });

    it('should have all required methods', () => {
      expect(typeof model.methods.createStakeholder).toBe('function');
      expect(typeof model.methods.createStakeholderMap).toBe('function');
      expect(typeof model.methods.analyzeStakeholders).toBe('function');
      expect(typeof model.methods.generateNetworkMap).toBe('function');
      expect(typeof model.methods.findInfluencers).toBe('function');
      expect(typeof model.methods.findKeyStakeholders).toBe('function');
    });
  });

  describe('Stakeholder Creation', () => {
    it('should create a stakeholder with required fields', () => {
      const stakeholder = model.methods.createStakeholder({
        name: 'Test Stakeholder',
        type: 'customer',
        influence: 4,
        interest: 3,
        description: 'Test description'
      });

      expect(stakeholder).toHaveProperty('id');
      expect(stakeholder.name).toBe('Test Stakeholder');
      expect(stakeholder.type).toBe('customer');
      expect(stakeholder.influence).toBe(4);
      expect(stakeholder.interest).toBe(3);
      expect(stakeholder.description).toBe('Test description');
      expect(stakeholder.relationships).toEqual([]);
    });
  });

  describe('Stakeholder Map Creation', () => {
    it('should create a stakeholder map with initial values', () => {
      const map = model.methods.createStakeholderMap('Test Map', 'Test Description');
      
      expect(map).toHaveProperty('id');
      expect(map.name).toBe('Test Map');
      expect(map.description).toBe('Test Description');
      expect(map.stakeholders).toEqual([]);
      expect(map.createdAt).toBeInstanceOf(Date);
      expect(map.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Stakeholder Analysis', () => {
    let analysis: ReturnType<typeof model.methods.analyzeStakeholders>;

    beforeEach(() => {
      analysis = model.methods.analyzeStakeholders(testStakeholders);
    });

    it('should categorize stakeholders correctly', () => {
      // Should have at least one stakeholder in each category based on our example data
      expect(analysis.keyStakeholders.length).toBeGreaterThan(0);
      expect(analysis.keepSatisfied.length).toBeGreaterThan(0);
      expect(analysis.keepInformed.length).toBeGreaterThan(0);
      expect(analysis.minimalEffort.length).toBeGreaterThanOrEqual(0);
    });

    it('should generate a network map', () => {
      expect(analysis.networkMap).toBeDefined();
      expect(analysis.networkMap.nodes.length).toBe(testStakeholders.length);
      
      // Check if nodes have required properties
      analysis.networkMap.nodes.forEach(node => {
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('label');
        expect(node).toHaveProperty('type');
        expect(node).toHaveProperty('color');
      });
    });
  });

  describe('Utility Functions', () => {
    it('should find key stakeholders', () => {
      const keyStakeholders = model.methods.findKeyStakeholders(testStakeholders);
      expect(Array.isArray(keyStakeholders)).toBe(true);
      
      // All key stakeholders should have high influence and interest
      keyStakeholders.forEach(stakeholder => {
        expect(stakeholder.influence).toBeGreaterThanOrEqual(P2_CONSTANTS.INFLUENCE_THRESHOLD);
        expect(stakeholder.interest).toBeGreaterThanOrEqual(P2_CONSTANTS.INTEREST_THRESHOLD);
      });
    });

    it('should find influencers', () => {
      const influencers = model.methods.findInfluencers(testStakeholders, 4);
      expect(Array.isArray(influencers)).toBe(true);
      
      // All influencers should have influence >= 4
      influencers.forEach(stakeholder => {
        expect(stakeholder.influence).toBeGreaterThanOrEqual(4);
      });

      // Should be sorted by influence (descending)
      for (let i = 1; i < influencers.length; i++) {
        expect(influencers[i].influence).toBeLessThanOrEqual(influencers[i - 1].influence);
      }
    });
  });

  describe('Convenience Function', () => {
    it('should analyze stakeholders using the convenience function', () => {
      const analysis = analyzeStakeholderMap(testStakeholders);
      
      expect(analysis).toHaveProperty('keyStakeholders');
      expect(analysis).toHaveProperty('keepSatisfied');
      expect(analysis).toHaveProperty('keepInformed');
      expect(analysis).toHaveProperty('minimalEffort');
      expect(analysis).toHaveProperty('networkMap');
    });
  });

  describe('Example Data', () => {
    it('should have valid example data', () => {
      expect(model.example.scenario).toBe(EXAMPLE_SCENARIO);
      expect(Array.isArray(model.example.stakeholders)).toBe(true);
      expect(model.example.stakeholders.length).toBeGreaterThan(0);
      
      model.example.stakeholders.forEach(stakeholder => {
        expect(stakeholder).toHaveProperty('id');
        expect(stakeholder).toHaveProperty('name');
        expect(stakeholder).toHaveProperty('type');
        expect(stakeholder).toHaveProperty('influence');
        expect(stakeholder).toHaveProperty('interest');
        
        // Validate influence and interest are within 1-5 range
        expect(stakeholder.influence).toBeGreaterThanOrEqual(1);
        expect(stakeholder.influence).toBeLessThanOrEqual(5);
        expect(stakeholder.interest).toBeGreaterThanOrEqual(1);
        expect(stakeholder.interest).toBeLessThanOrEqual(5);
      });
    });
  });
});