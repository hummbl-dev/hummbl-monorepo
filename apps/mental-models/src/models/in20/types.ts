import { EventEmitter } from 'events';

export interface InversionInput {
  /** The input to be analyzed */
  input: string;
  
  /** Optional context for the analysis */
  context?: Record<string, any>;
  
  /** Additional options specific to the inversion model */
  options?: {
    /** Whether to include detailed reasoning in the output */
    includeReasoning?: boolean;
    
    /** Maximum number of alternative perspectives to generate */
    maxAlternatives?: number;
    
    /** Whether to include confidence scores for each insight */
    includeConfidenceScores?: boolean;
  };
}

export interface InversionAnalysis {
  /** The inverted or alternative perspective */
  inverted: any;
  
  /** Key insights from the inversion process */
  insights: string[];
  
  /** Any additional metadata about the analysis */
  metadata?: Record<string, any>;
}

export interface InversionOutput {
  /** Unique identifier for this analysis */
  id: string;
  
  /** The analysis results */
  analysis: InversionAnalysis;
  
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
      /** Length of the input */
      inputLength: number;
      
      /** Keys present in the context */
      contextKeys: string[];
      
      /** Any additional telemetry data */
      [key: string]: any;
    };
  };
}

export interface InversionConfig {
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

export const DEFAULT_CONFIG: InversionConfig = {
  name: 'IN20',
  version: '1.0.0',
  eventEmitter: new EventEmitter(),
  telemetryEnabled: false,
  logger: console,
};

// Event types
export interface AnalysisCompleteEvent {
  requestId: string;
  result: InversionOutput;
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
    IN20Analytics?: {
      onAnalysisComplete: (handler: AnalysisEventHandler<AnalysisCompleteEvent>) => void;
      onAnalysisError: (handler: AnalysisEventHandler<AnalysisErrorEvent>) => void;
    };
  }
}