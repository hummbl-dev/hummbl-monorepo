/**
 * IN2: Error Utilization
 * 
 * This model converts detected error patterns into improvement signals for the system.
 * It's part of the Inversion transformation category.
 */

/**
 * Represents a detected error pattern
 */
export interface ErrorPattern {
  /** Unique identifier for the error pattern */
  id: string;
  
  /** The error message or pattern that was detected */
  pattern: string | RegExp;
  
  /** Category of the error */
  category: ErrorCategory;
  
  /** Severity level of the error */
  severity: ErrorSeverity;
  
  /** Context in which this error occurs */
  context: string;
  
  /** Confidence score for this pattern match (0-1) */
  confidence: number;
  
  /** Tags for categorization */
  tags: string[];
  
  /** Timestamp when this error was first detected */
  firstSeen: Date;
  
  /** Timestamp when this error was last seen */
  lastSeen: Date;
  
  /** Number of times this error has occurred */
  occurrenceCount: number;
  
  /** Related error patterns (by ID) */
  relatedErrors: string[];
  
  /** Metadata */
  meta: {
    source: string;
    isActive: boolean;
    isFalsePositive: boolean;
    notes?: string;
  };
}

/**
 * Represents an improvement signal generated from an error pattern
 */
export interface ImprovementSignal {
  /** Unique identifier */
  id: string;
  
  /** The improvement suggestion */
  suggestion: string;
  
  /** Impact of implementing this improvement (0-1) */
  impact: number;
  
  /** Effort required to implement (0-1, where 0 is low effort) */
  effort: number;
  
  /** Priority level for implementation */
  priority: ImprovementPriority;
  
  /** IDs of the error patterns that led to this improvement */
  sourceErrors: string[];
  
  /** Status of this improvement */
  status: ImprovementStatus;
  
  /** Tags for categorization */
  tags: string[];
  
  /** Metadata */
  meta: {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    lastUpdatedBy?: string;
  };
}

/**
 * Represents a feedback loop for error patterns
 */
export interface FeedbackLoop {
  /** Unique identifier */
  id: string;
  
  /** Name of the feedback loop */
  name: string;
  
  /** Description of what this feedback loop monitors */
  description: string;
  
  /** The error patterns being monitored */
  errorPatterns: ErrorPattern[];
  
  /** The improvements generated from these errors */
  improvements: ImprovementSignal[];
  
  /** Configuration for the feedback loop */
  config: {
    isActive: boolean;
    samplingRate: number; // 0-1, what percentage of errors to process
    minSeverity: ErrorSeverity;
    maxImprovementsPerCycle: number;
    cooldownPeriod: number; // ms between processing cycles
  };
  
  /** Metrics about the feedback loop's performance */
  metrics: {
    totalErrorsProcessed: number;
    improvementsGenerated: number;
    averageProcessingTime: number; // ms
    errorReductionRate: number; // 0-1, reduction in errors over time
    lastProcessed: Date | null;
  };
  
  /** Metadata */
  meta: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

/**
 * Analysis result from processing errors
 */
export interface ErrorAnalysis {
  /** Error patterns found */
  errors: ErrorPattern[];
  
  /** Improvements generated */
  improvements: ImprovementSignal[];
  
  /** Overall quality metrics */
  metrics: {
    totalErrors: number;
    uniqueErrorTypes: number;
    improvementsGenerated: number;
    averageImpact: number;
    averageEffort: number;
    errorReductionPotential: number; // 0-1, potential reduction in errors
  };
}

/**
 * Parameters for detecting error patterns
 */
export interface DetectErrorsParams {
  /** The text or data to analyze for errors */
  input: string | Record<string, any>;
  
  /** Minimum confidence threshold (0-1) */
  minConfidence?: number;
  
  /** Minimum severity level to include */
  minSeverity?: ErrorSeverity;
  
  /** Maximum number of errors to return */
  limit?: number;
  
  /** Context for the analysis */
  context?: string;
  
  /** Additional metadata */
  meta?: Record<string, any>;
}

/**
 * Parameters for generating improvements from errors
 */
export interface GenerateImprovementsParams {
  /** Errors to analyze */
  errors: ErrorPattern[];
  
  /** Additional context */
  context?: string;
  
  /** Maximum number of improvements to generate */
  limit?: number;
  
  /** Minimum impact threshold (0-1) */
  minImpact?: number;
  
  /** Maximum effort threshold (0-1) */
  maxEffort?: number;
}

/**
 * The main model interface
 */
export interface ErrorUtilizationModel {
  /** Model metadata */
  id: string;
  name: string;
  description: string;
  version: string;
  
  /** Core methods */
  detectErrors(params: DetectErrorsParams): Promise<ErrorPattern[]>;
  generateImprovements(params: GenerateImprovementsParams): Promise<ImprovementSignal[]>;
  analyzeErrors(input: string | Record<string, any>): Promise<ErrorAnalysis>;
  
  /** Feedback loop management */
  createFeedbackLoop(config: Partial<Omit<FeedbackLoop, 'id'>>): FeedbackLoop;
  updateFeedbackLoop(id: string, updates: Partial<FeedbackLoop>): FeedbackLoop | null;
  getFeedbackLoop(id: string): FeedbackLoop | null;
  listFeedbackLoops(): FeedbackLoop[];
  
  /** Utility methods */
  calculateImpact(error: ErrorPattern): number;
  calculateEffort(improvement: string): number;
  
  /** Configuration */
  config: {
    defaultMinConfidence: number;
    defaultMinSeverity: ErrorSeverity;
    maxErrorsPerRequest: number;
    maxImprovementsPerRequest: number;
    errorPatternLifetime: number; // ms
  };
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',    // System failure, data loss, security breach
  HIGH = 'high',            // Major functionality impacted
  MEDIUM = 'medium',        // Partial or degraded functionality
  LOW = 'low',              // Minor issue, workaround exists
  INFO = 'info',            // Informational, not an error
}

/**
 * Error categories
 */
export enum ErrorCategory {
  SYNTAX = 'syntax',
  LOGIC = 'logic',
  DATA = 'data',
  NETWORK = 'network',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  USABILITY = 'usability',
  COMPATIBILITY = 'compatibility',
  CONFIGURATION = 'configuration',
  DEPENDENCY = 'dependency',
  RESOURCE = 'resource',
  TIMEOUT = 'timeout',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  THROTTLING = 'throttling',
  SERIALIZATION = 'serialization',
  PARSING = 'parsing',
  OTHER = 'other',
}

/**
 * Improvement priority levels
 */
export enum ImprovementPriority {
  CRITICAL = 'critical',   // Fix immediately
  HIGH = 'high',           // Fix in next release
  MEDIUM = 'medium',       // Plan to fix in future release
  LOW = 'low',             // Backlog, consider if time permits
  FUTURE = 'future',       // Keep in mind for future consideration
}

/**
 * Improvement status
 */
export enum ImprovementStatus {
  PROPOSED = 'proposed',       // Newly generated, not yet reviewed
  APPROVED = 'approved',       // Approved for implementation
  IN_PROGRESS = 'in_progress', // Currently being worked on
  COMPLETED = 'completed',     // Successfully implemented
  REJECTED = 'rejected',       // Decided not to implement
  DEFERRED = 'deferred',       // Postponed to a later time
  DUPLICATE = 'duplicate',     // Duplicate of another improvement
}
