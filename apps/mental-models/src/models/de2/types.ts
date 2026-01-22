/**
 * DE2: Cognitive Tracing
 * 
 * This model traces reasoning paths through decomposed cognitive steps, mapping thought sequences
 * from input to output with annotated decision points.
 */

/**
 * Represents a single step in a cognitive trace
 */
export interface CognitiveStep {
  /** Unique identifier for the step */
  id: string;
  
  /** The content or action of this step */
  content: string;
  
  /** Type of cognitive operation (e.g., 'inference', 'decision', 'evaluation') */
  type: string;
  
  /** Confidence in this step (0-1) */
  confidence: number;
  
  /** References to parent steps (for branching/merging) */
  parentIds: string[];
  
  /** References to child steps */
  childIds: string[];
  
  /** Metadata about the step */
  meta: {
    timestamp: Date;
    durationMs?: number;
    tags: string[];
  };
}

/**
 * Represents a decision point in the cognitive trace
 */
export interface DecisionPoint {
  /** Unique identifier */
  id: string;
  
  /** The decision being made */
  decision: string;
  
  /** Available options at this decision point */
  options: {
    id: string;
    description: string;
    selected: boolean;
    confidence?: number;
  }[];
  
  /** The selected option ID */
  selectedOptionId?: string;
  
  /** Reasoning behind the decision */
  rationale?: string;
  
  /** Step ID where this decision was made */
  stepId: string;
}

/**
 * Represents a complete cognitive trace
 */
export interface CognitiveTrace {
  /** Unique identifier */
  id: string;
  
  /** The input that initiated this trace */
  input: string;
  
  /** The final output/result */
  output?: string;
  
  /** All steps in the trace */
  steps: CognitiveStep[];
  
  /** Decision points in the trace */
  decisionPoints: DecisionPoint[];
  
  /** Relationships between steps */
  relationships: {
    sourceId: string;
    targetId: string;
    type: 'leads-to' | 'supports' | 'challenges' | 'refines';
    strength: number;
  }[];
  
  /** Metadata */
  meta: {
    createdAt: Date;
    updatedAt: Date;
    modelVersion: string;
    tags: string[];
  };
}

/**
 * Parameters for tracing cognitive steps
 */
export interface TraceCognitiveStepsParams {
  /** The input to process */
  input: string;
  
  /** Maximum depth of the trace */
  maxDepth?: number;
  
  /** Maximum breadth at each decision point */
  maxBreadth?: number;
  
  /** Minimum confidence threshold for steps (0-1) */
  minConfidence?: number;
  
  /** Context for the trace */
  context?: string;
}

/**
 * Result of tracing cognitive steps
 */
export interface CognitiveTraceResult {
  /** The complete trace */
  trace: CognitiveTrace;
  
  /** Metrics about the trace */
  metrics: {
    totalSteps: number;
    decisionPoints: number;
    averageConfidence: number;
    maxDepth: number;
    maxBreadth: number;
    processingTimeMs: number;
  };
  
  /** Any warnings or errors */
  diagnostics: {
    level: 'info' | 'warning' | 'error';
    message: string;
    stepId?: string;
  }[];
}

/**
 * The main model interface
 */
export interface CognitiveTracingModel {
  /** Model identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Model description */
  description: string;
  
  /** Version */
  version: string;
  
  /** Configuration */
  config: {
    defaultMaxDepth: number;
    defaultMaxBreadth: number;
    minConfidenceThreshold: number;
    maxTraceDurationMs: number;
  };
  
  /**
   * Trace the cognitive steps for a given input
   */
  traceSteps(params: TraceCognitiveStepsParams): Promise<CognitiveTraceResult>;
  
  /**
   * Continue an existing trace from a specific step
   */
  continueTrace(params: {
    trace: CognitiveTrace;
    fromStepId: string;
    maxDepth?: number;
  }): Promise<CognitiveTraceResult>;
  
  /**
   * Analyze a decision point in detail
   */
  analyzeDecisionPoint(params: {
    trace: CognitiveTrace;
    decisionPointId: string;
  }): Promise<{
    decisionPoint: DecisionPoint;
    analysis: string;
    alternatives: Array<{
      optionId: string;
      pros: string[];
      cons: string[];
      confidence: number;
    }>;
  }>;
  
  /**
   * Get a simplified explanation of the trace
   */
  explainTrace(trace: CognitiveTrace): string;
}
