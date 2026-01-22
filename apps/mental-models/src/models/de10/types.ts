import { EventEmitter } from 'events';

export interface Component {
  /** Unique identifier for the component */
  id: string;
  
  /** Type/category of the component */
  type: string;
  
  /** Properties of the component */
  properties: Record<string, any>;
  
  /** Optional metadata */
  metadata?: Record<string, any>;
}

export interface Relationship {
  /** Type of relationship */
  type: string;
  
  /** IDs of the source and target components */
  source: string;
  target: string;
  
  /** Properties of the relationship */
  properties?: Record<string, any>;
}

export interface DeconstructionInput {
  /** The system to deconstruct (object, array, or primitive) */
  system: any;
  
  /** Additional context for the deconstruction */
  context?: Record<string, any>;
  
  /** Options for the deconstruction */
  options?: {
    /** Whether to include detailed reasoning in the output */
    includeReasoning?: boolean;
    
    /** Maximum depth to deconstruct */
    maxDepth?: number;
    
    /** Whether to include potential issues in the output */
    includeIssues?: boolean;
  };
}

export interface DeconstructionAnalysis {
  /** The deconstructed components */
  components: Component[];
  
  /** Relationships between components */
  relationships: Relationship[];
  
  /** Key insights from the deconstruction */
  insights: string[];
  
  /** Any additional metadata about the analysis */
  metadata?: Record<string, any>;
}

export interface DeconstructionOutput {
  /** Unique identifier for this analysis */
  id: string;
  
  /** The analysis results */
  analysis: DeconstructionAnalysis;
  
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
      /** Number of components */
      componentCount: number;
      
      /** Number of relationships */
      relationshipCount: number;
      
      /** Type of input */
      inputType: string;
      
      /** Size of input */
      inputSize: number;
      
      /** Any additional telemetry data */
      [key: string]: any;
    };
  };
}

export interface DeconstructionConfig {
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

export const DEFAULT_CONFIG: DeconstructionConfig = {
  name: 'DE10',
  version: '1.0.0',
  eventEmitter: new EventEmitter(),
  telemetryEnabled: false,
  logger: console,
};

// Event types
export interface AnalysisCompleteEvent {
  requestId: string;
  result: DeconstructionOutput;
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
    DE10Analytics?: {
      onAnalysisComplete: (handler: AnalysisEventHandler<AnalysisCompleteEvent>) => void;
      onAnalysisError: (handler: AnalysisEventHandler<AnalysisErrorEvent>) => void;
    };
  }
}