import { CognitiveStep, DecisionPoint } from './types';

/**
 * Constants for the Cognitive Tracing model (DE2)
 */

export const DE2_CONSTANTS = {
  // Model metadata
  MODEL_CODE: 'DE2',
  MODEL_NAME: 'Cognitive Tracing',
  TRANSFORMATION: 'Decomposition',
  VERSION: '1.0.0',
  
  // Default configuration values
  DEFAULTS: {
    DEFAULT_MAX_DEPTH: 5,
    DEFAULT_MAX_BREADTH: 3,
    MIN_CONFIDENCE_THRESHOLD: 0.6,
    MAX_TRACE_DURATION_MS: 30000, // 30 seconds
    MAX_STEPS_PER_TRACE: 50,
    MAX_DECISION_POINTS: 10,
  },
  
  // Cognitive step types
  STEP_TYPES: [
    'observation',
    'inference',
    'decision',
    'evaluation',
    'retrieval',
    'comparison',
    'abstraction',
    'application',
    'verification',
    'reflection'
  ] as const,
  
  // Relationship types between steps
  RELATIONSHIP_TYPES: [
    'leads-to',
    'supports',
    'challenges',
    'refines',
    'elaborates',
    'contradicts',
    'generalizes',
    'specializes'
  ] as const,
  
  // Common decision point types
  DECISION_TYPES: [
    'selection',
    'categorization',
    'prioritization',
    'problem-framing',
    'solution-evaluation',
    'resource-allocation',
    'goal-selection',
    'strategy-choice'
  ] as const,
  
  // Default step templates
  STEP_TEMPLATES: {
    observation: (content: string) => `Observed: ${content}`,
    inference: (content: string) => `Infer: ${content}`,
    decision: (content: string) => `Decide: ${content}`,
    evaluation: (content: string) => `Evaluate: ${content}`,
  },
  
  // Default confidence values
  CONFIDENCE_LEVELS: {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4,
    VERY_LOW: 0.2
  },
  
  // Common tags for categorization
  TAGS: {
    ANALYTICAL: 'analytical',
    CREATIVE: 'creative',
    CRITICAL: 'critical',
    STRATEGIC: 'strategic',
    TACTICAL: 'tactical',
    METACOGNITIVE: 'metacognitive',
    HEURISTIC: 'heuristic',
    ALGORITHMIC: 'algorithmic'
  },
  
  // Error messages
  ERRORS: {
    MAX_DEPTH_EXCEEDED: 'Maximum trace depth exceeded',
    MAX_BREADTH_EXCEEDED: 'Maximum breadth at decision point exceeded',
    MAX_STEPS_EXCEEDED: 'Maximum number of steps exceeded',
    MAX_TIME_EXCEEDED: 'Maximum trace duration exceeded',
    INVALID_STEP: 'Invalid cognitive step',
    INVALID_DECISION_POINT: 'Invalid decision point',
    STEP_NOT_FOUND: 'Step not found in trace',
    DECISION_POINT_NOT_FOUND: 'Decision point not found'
  }
} as const;

/**
 * Creates a new cognitive step with default values
 */
export function createCognitiveStep(
  content: string,
  type: string,
  parentIds: string[] = [],
  meta: Partial<CognitiveStep['meta']> = {}
): CognitiveStep {
  const timestamp = new Date();
  return {
    id: `step-${timestamp.getTime()}-${Math.random().toString(36).substr(2, 4)}`,
    content,
    type,
    confidence: DE2_CONSTANTS.CONFIDENCE_LEVELS.MEDIUM,
    parentIds: [...parentIds],
    childIds: [],
    meta: {
      timestamp,
      tags: [],
      ...meta
    }
  };
}

/**
 * Creates a new decision point with default values
 */
export function createDecisionPoint(
  decision: string,
  options: Array<{id: string, description: string}>,
  stepId: string,
  selectedOptionId?: string
): DecisionPoint {
  return {
    id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    decision,
    options: options.map(opt => ({
      ...opt,
      selected: opt.id === selectedOptionId
    })),
    stepId,
    selectedOptionId
  };
}

/**
 * Creates a new cognitive trace with default values
 */
export function createCognitiveTrace(input: string): {
  trace: {
    id: string;
    input: string;
    steps: CognitiveStep[];
    decisionPoints: DecisionPoint[];
    relationships: Array<{
      sourceId: string;
      targetId: string;
      type: string;
      strength: number;
    }>;
    meta: {
      createdAt: Date;
      updatedAt: Date;
      modelVersion: string;
      tags: string[];
    };
  };
} {
  const now = new Date();
  return {
    trace: {
      id: `trace-${now.getTime()}`,
      input,
      steps: [],
      decisionPoints: [],
      relationships: [],
      meta: {
        createdAt: now,
        updatedAt: now,
        modelVersion: DE2_CONSTANTS.VERSION,
        tags: []
      }
    }
  };
}
