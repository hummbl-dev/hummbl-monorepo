/**
 * SY1: Base Synthesis Model Types
 * 
 * Type definitions for the SY1 Synthesis Model
 */

import { EventEmitter } from 'events';

export interface SY1Config {
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

export interface SynthesisInput {
  /** Array of model outputs to synthesize */
  models: any[];
  
  /** Additional context for the synthesis */
  context?: Record<string, any>;
  
  /** Synthesis options */
  options?: {
    /** Depth of synthesis analysis */
    depth?: number;
    
    /** Whether to include example data in results */
    includeExamples?: boolean;
    
    /** Additional options */
    [key: string]: any;
  };
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface SynthesisOutput {
  /** Unique identifier for this synthesis result */
  id: string;
  
  /** The synthesized result */
  synthesizedResult: any;
  
  /** Key insights from the synthesis */
  insights: string[];
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** Metadata about the synthesis */
  metadata: {
    /** Version of the model used */
    modelVersion: string;
    
    /** When the synthesis was performed */
    timestamp: string;
    
    /** Time taken for synthesis in milliseconds */
    executionTimeMs: number;
    
    /** Additional telemetry data */
    telemetry?: Record<string, any>;
  };
}

/** Event emitted when synthesis completes successfully */
export interface SynthesisCompleteEvent {
  requestId: string;
  result: SynthesisOutput;
  timestamp: string;
}

/** Event emitted when an error occurs during synthesis */
export interface SynthesisErrorEvent {
  requestId: string;
  error: string;
  timestamp: string;
}

/** Type for synthesis event callbacks */
export type SynthesisEventHandler = (event: SynthesisCompleteEvent | SynthesisErrorEvent) => void;
