/**
 * P3: Type Definitions
 */

import { EventEmitter } from 'events';

export interface P3Config {
  /** Unique identifier for this model instance */
  id?: string;
  
  /** Display name for the model */
  name?: string;
  
  /** Version string */
  version?: string;
  
  /** Custom event emitter for model events */
  eventEmitter?: EventEmitter;
  
  /** Whether to collect telemetry data */
  telemetryEnabled?: boolean;
  
  /** Custom logger implementation */
  logger?: Console;
}

/** Input for P3 analysis */
export interface P3Input {
  /** The input data to analyze */
  input: any;
  
  /** Additional context for the analysis */
  context?: Record<string, any>;
  
  /** Analysis options */
  options?: {
    [key: string]: any;
  };
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/** Output from P3 analysis */
export interface P3Output {
  /** Unique identifier for this analysis */
  id: string;
  
  /** The analysis result */
  analysis: any;
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** Metadata about the analysis */
  metadata: {
    /** Version of the model used */
    modelVersion: string;
    
    /** When the analysis was performed */
    timestamp: string;
    
    /** Time taken for analysis in milliseconds */
    executionTimeMs: number;
    
    /** Additional telemetry data */
    telemetry?: Record<string, any>;
  };
}

/** Event emitted when analysis completes successfully */
export interface P3CompleteEvent {
  requestId: string;
  result: P3Output;
  timestamp: string;
}

/** Event emitted when an error occurs during analysis */
export interface P3ErrorEvent {
  requestId: string;
  error: string;
  timestamp: string;
}

/** Type for analysis event callbacks */
export type P3EventHandler = (event: P3CompleteEvent | P3ErrorEvent) => void;