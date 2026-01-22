/**
 * P17: Type Definitions
 */

import { EventEmitter } from 'events';

export interface P17Config {
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

/** Input for P17 analysis */
export interface P17Input {
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

/** Output from P17 analysis */
export interface P17Output {
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
export interface P17CompleteEvent {
  requestId: string;
  result: P17Output;
  timestamp: string;
}

/** Event emitted when an error occurs during analysis */
export interface P17ErrorEvent {
  requestId: string;
  error: string;
  timestamp: string;
}

/** Type for analysis event callbacks */
export type P17EventHandler = (event: P17CompleteEvent | P17ErrorEvent) => void;