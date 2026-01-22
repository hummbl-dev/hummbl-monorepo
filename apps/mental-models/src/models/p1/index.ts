import { FirstPrinciplesModel, FirstPrinciplesAnalysis } from './types';
import { P1_CONSTANTS, DEFAULT_ASSUMPTIONS, SAMPLE_TRUTHS } from './constants';

/**
 * Creates a new First Principles Framing model instance
 * @returns {FirstPrinciplesModel} Configured model instance
 */
export const createFirstPrinciplesModel = (): FirstPrinciplesModel => ({
  id: P1_CONSTANTS.MODEL_CODE.toLowerCase(),
  name: P1_CONSTANTS.MODEL_NAME,
  description: 'Reduces complex problems to foundational truths that cannot be further simplified.',
  transformation: P1_CONSTANTS.TRANSFORMATION,
  tier: P1_CONSTANTS.TIER,
  keyCharacteristics: [...P1_CONSTANTS.KEY_CHARACTERISTICS],
  relatedModels: [...P1_CONSTANTS.RELATED_MODELS],
  example: { ...P1_CONSTANTS.EXAMPLE },
  methods: {
    decomposeProblem: (problem: string): string[] => {
      // Simple tokenization - can be enhanced with NLP
      return problem
        .split(/[\s,.?!]+/)
        .filter(word => word.length > 2) // Remove short words
        .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    },

    identifyAssumptions: (problem: string): string[] => {
      // In a real implementation, this would use NLP to identify assumptions
      // For now, return some relevant assumptions based on problem content
      if (problem.toLowerCase().includes('price') || problem.toLowerCase().includes('cost')) {
        return DEFAULT_ASSUMPTIONS;
      }
      return [
        'Assumption about user needs',
        'Assumption about current solutions',
        'Assumption about constraints'
      ];
    },

    extractFundamentalTruths: (problem: string): string[] => {
      // In a real implementation, this would extract actual truths
      // For now, return sample truths based on problem content
      if (problem.toLowerCase().includes('price') || problem.toLowerCase().includes('cost')) {
        return SAMPLE_TRUTHS;
      }
      return [
        'Fundamental constraint: ' + problem.split(' ')[0] + ' must be addressed',
        'Core requirement: ' + problem.split(' ').slice(1).join(' '),
        'Basic principle: Every solution must satisfy core requirements'
      ];
    },

    rebuildSolution: (truths: string[]): string => {
      if (!truths || truths.length === 0) {
        return 'No fundamental truths provided for solution building';
      }
      
      // Simple solution generation based on truths
      return `Solution derived from ${truths.length} fundamental truths:\n` +
        truths.map((truth, i) => `  ${i + 1}. ${truth}`).join('\n');
    }
  }
});

/**
 * Applies first principles thinking to a problem
 * @param problem The problem to analyze
 * @returns Analysis object with decomposition, assumptions, truths, and solution
 */
export const applyFirstPrinciples = (problem: string): FirstPrinciplesAnalysis => {
  const model = createFirstPrinciplesModel();
  const decomposed = model.methods.decomposeProblem(problem);
  const assumptions = model.methods.identifyAssumptions(problem);
  const fundamentalTruths = model.methods.extractFundamentalTruths(problem);
  const solution = model.methods.rebuildSolution(fundamentalTruths);
  
  return {
    problem,
    decomposed,
    assumptions,
    fundamentalTruths,
    solution
  };
};

// Default export for convenience
export default {
  createFirstPrinciplesModel,
  applyFirstPrinciples,
  constants: P1_CONSTANTS
};