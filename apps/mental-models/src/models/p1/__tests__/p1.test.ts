import { createFirstPrinciplesModel, applyFirstPrinciples } from '..';
import { P1_CONSTANTS } from '../constants';

describe('P1 - First Principles Framing', () => {
  let model: ReturnType<typeof createFirstPrinciplesModel>;
  const testProblem = 'How can we reduce production costs while maintaining quality?';

  beforeEach(() => {
    model = createFirstPrinciplesModel();
  });

  describe('Model Creation', () => {
    it('should create a model with correct constants', () => {
      expect(model.id).toBe('p1');
      expect(model.name).toBe(P1_CONSTANTS.MODEL_NAME);
      expect(model.transformation).toBe(P1_CONSTANTS.TRANSFORMATION);
      expect(model.tier).toBe(1);
    });

    it('should have all required methods', () => {
      expect(typeof model.methods.decomposeProblem).toBe('function');
      expect(typeof model.methods.identifyAssumptions).toBe('function');
      expect(typeof model.methods.extractFundamentalTruths).toBe('function');
      expect(typeof model.methods.rebuildSolution).toBe('function');
    });
  });

  describe('Problem Decomposition', () => {
    it('should decompose problems into meaningful parts', () => {
      const result = model.methods.decomposeProblem(testProblem);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('reduce');
      expect(result).toContain('production');
      expect(result).toContain('costs');
    });

    it('should remove duplicates from decomposition', () => {
      const result = model.methods.decomposeProblem('test test test');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('test');
    });
  });

  describe('Assumption Identification', () => {
    it('should identify assumptions in the problem', () => {
      const assumptions = model.methods.identifyAssumptions(testProblem);
      expect(Array.isArray(assumptions)).toBe(true);
      expect(assumptions.length).toBeGreaterThan(0);
      assumptions.forEach(assumption => {
        expect(typeof assumption).toBe('string');
        expect(assumption.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Fundamental Truths', () => {
    it('should extract fundamental truths from the problem', () => {
      const truths = model.methods.extractFundamentalTruths(testProblem);
      expect(Array.isArray(truths)).toBe(true);
      expect(truths.length).toBeGreaterThan(0);
      truths.forEach(truth => {
        expect(typeof truth).toBe('string');
        expect(truth.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Solution Rebuilding', () => {
    it('should build a solution from fundamental truths', () => {
      const testTruths = ['Truth 1', 'Truth 2'];
      const solution = model.methods.rebuildSolution(testTruths);
      expect(typeof solution).toBe('string');
      expect(solution).toContain('Solution derived from 2 fundamental truths');
      expect(solution).toContain('1. Truth 1');
      expect(solution).toContain('2. Truth 2');
    });

    it('should handle empty truths array', () => {
      const solution = model.methods.rebuildSolution([]);
      expect(solution).toBe('No fundamental truths provided for solution building');
    });
  });

  describe('End-to-End Application', () => {
    it('should apply first principles to a problem', () => {
      const analysis = applyFirstPrinciples(testProblem);
      
      expect(analysis).toHaveProperty('problem', testProblem);
      expect(Array.isArray(analysis.decomposed)).toBe(true);
      expect(Array.isArray(analysis.assumptions)).toBe(true);
      expect(Array.isArray(analysis.fundamentalTruths)).toBe(true);
      expect(typeof analysis.solution).toBe('string');
      
      // Verify the solution includes the number of truths
      const truthCount = analysis.fundamentalTruths.length;
      expect(analysis.solution).toContain(`Solution derived from ${truthCount} fundamental truths`);
    });
  });
});