import { EventEmitter } from 'events';

export interface CompositionElement {
  /** Unique identifier for the element */
  id: string;
  
  /** Type/category of the element */
  type: string;
  
  /** Properties of the element */
  properties: Record<string, any>;
  
  /** Optional metadata */
  metadata?: Record<string, any>;
}

export interface CompositionRelationship {
  /** Type of relationship */
  type: string;
  
  /** IDs of the source and target elements */
  source: string;
  target: string;
  
  /** Properties of the relationship */
  properties?: Record<string, any>;
}

export interface CompositionInput {
  /** Elements to be composed */
  elements: CompositionElement[];
  
  /** Relationships between elements */
  relationships?: CompositionRelationship[];
  
  /** Additional context for the composition */
  context?: Record<string, any>;
  
  /** Options for the composition */
  options?: {
    /** Whether to include detailed reasoning in the output */
    includeReasoning?: boolean;
    
    /** Maximum depth to analyze */
    maxDepth?: number;
    
    /** Whether to include potential issues in the output */
    includeIssues?: boolean;
  };
}

export interface CompositionAnalysis {
  /** The composed elements and their relationships */
  composition: {
    elements: CompositionElement[];
    relationships: CompositionRelationship[];
    emergentProperties: string[];
  };
  
  /** Key insights from the composition process */
  insights: string[];
  
  /** Any additional metadata about the analysis */
  metadata?: Record<string, any>;
}

export interface CompositionOutput {
  /** Unique identifier for this analysis */
  id: string;
  
  /** The analysis results */
  analysis: CompositionAnalysis;
  
  /** Confidence score (0-1) of the analysis */
  confidence: number;
  
  /** Additional metadata */
  metadata: {
    /** Version of the model */
    modelVersion: string;
    
    /** When the analysis was performed */
    timestamp: string;
    
    /** How long the analysis took in milliseconds */
    executionTimeMs: number;
    
    /** Telemetry data (if enabled) */
    telemetry?: {
      /** Number of elements */
      elementCount: number;
      
      /** Number of relationships */
      relationshipCount: number;
      
      /** Keys present in the context */
      contextKeys: string[];
      
      /** Any additional telemetry data */
      [key: string]: any;
    };
  };
}

export interface CompositionConfig {
  /** Name of the model */
  name: string;
  
  /** Version of the model */
  version: string;
  
  /** Event emitter for analytics and monitoring */
  eventEmitter: EventEmitter;
  
  /** Whether to enable telemetry */
  telemetryEnabled: boolean;
  
  /** Logger instance */
  logger: Console | any;
}

export const DEFAULT_CONFIG: CompositionConfig = {
  name: 'CO18',
  version: '1.0.0',
  eventEmitter: new EventEmitter(),
  telemetryEnabled: false,
  logger: console,
};

// Event types
export interface AnalysisCompleteEvent {
  requestId: string;
  result: CompositionOutput;
  timestamp: string;
}

export interface AnalysisErrorEvent {
  requestId: string;
  error: string;
  timestamp: string;
}

export type AnalysisEventHandler<T> = (event: T) => void;

declare global {
  interface Window {
    CO18Analytics?: {
      onAnalysisComplete: (handler: AnalysisEventHandler<AnalysisCompleteEvent>) => void;
      onAnalysisError: (handler: AnalysisEventHandler<AnalysisErrorEvent>) => void;
    };
  }
}