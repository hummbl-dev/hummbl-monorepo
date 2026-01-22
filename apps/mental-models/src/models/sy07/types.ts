/**
 * SY07 Types
 * 
 * This file contains type definitions for the SY07 Synthesis Model.
 */

import { EventEmitter } from 'events';

/**
 * Configuration for the SY07 model
 */
export interface SY07Config {
  /** Unique identifier for this model instance */
  id?: string;
  
  /** Display name of the model */
  name?: string;
  
  /** Version of the model */
  version?: string;
  
  /** Event emitter for analytics and monitoring */
  eventEmitter?: EventEmitter;
  
  /** Whether to enable telemetry */
  telemetryEnabled?: boolean;
  
  /** Logger instance */
  logger?: Console;
  
  /** Model-specific configuration */
  options?: {
    /** Maximum depth for synthesis */
    maxDepth?: number;
    
    /** Whether to include examples in the output */
    includeExamples?: boolean;
    
    /** Whether to include detailed reasoning */
    includeReasoning?: boolean;
    
    /** Confidence threshold for including results */
    confidenceThreshold?: number;
  };
}

/**
 * Input for the synthesis operation
 */
export interface SynthesisInput {
  /** Array of model outputs to synthesize */
  models: any[];
  
  /** Additional context for the synthesis */
  context?: Record<string, any>;
  
  /** Options for this synthesis operation */
  options?: {
    /** Depth of synthesis to perform */
    depth?: number;
    
    /** Whether to include examples in the output */
    includeExamples?: boolean;
    
    /** Whether to include potential issues */
    includeIssues?: boolean;
    
    /** Whether to include related models */
    includeRelated?: boolean;
  };
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Output from the synthesis operation
 */
export interface SynthesisOutput {
  /** Unique identifier for this synthesis */
  id: string;
  
  /** The synthesized result */
  synthesizedResult: any;
  
  /** Key insights from the synthesis */
  insights: string[];
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** Additional metadata */
  metadata: {
    /** Version of the model */
    modelVersion: string;
    
    /** When the synthesis was performed */
    timestamp: string;
    
    /** How long the synthesis took in milliseconds */
    executionTimeMs: number;
    
    /** Telemetry data (if enabled) */
    telemetry?: {
      /** Number of models synthesized */
      modelCount: number;
      
      /** Keys in the context object */
      contextKeys: string[];
      
      /** Any additional telemetry data */
      [key: string]: any;
    };
  };
}

/**
 * Event emitted when synthesis completes successfully
 */
export interface SynthesisCompleteEvent {
  /** Unique identifier for the request */
  requestId: string;
  
  /** The synthesis result */
  result: SynthesisOutput;
  
  /** When the event was emitted */
  timestamp: string;
}

/**
 * Event emitted when an error occurs during synthesis
 */
export interface SynthesisErrorEvent {
  /** Unique identifier for the request */
  requestId: string;
  
  /** Error message */
  error: string;
  
  /** When the error occurred */
  timestamp: string;
}

/**
 * Type for synthesis event handlers
 */
export type SynthesisEventHandler<T> = (event: T) => void;

// Extend the global Window interface for browser usage
declare global {
  interface Window {
    SY07Analytics?: {
      onSynthesisComplete: (handler: SynthesisEventHandler<SynthesisCompleteEvent>) => void;
      onSynthesisError: (handler: SynthesisEventHandler<SynthesisErrorEvent>) => void;
    };
  }
}