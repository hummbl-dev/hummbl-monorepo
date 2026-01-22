export interface IN1Config {
  id?: string;
  name?: string;
  description?: string;
  version?: string;
  eventEmitter?: EventEmitter;
  telemetryEnabled?: boolean;
}

export interface IN1Input {
  problem: string;
  context?: Record<string, any>;
  options?: {
    maxDepth?: number;
    includeExamples?: boolean;
  };
  metadata?: Record<string, any>;
}

export interface IN1Output {
  id: string;
  problem: string;
  solution: string;
  inverseProblem: string;
  failureModes: string[];
  avoidanceStrategies: string[];
  insights: string[];
  confidence: number;
  metadata: {
    modelVersion: string;
    timestamp: string;
    executionTimeMs: number;
    telemetry?: {
      model: string;
      version: string;
      timestamp: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}