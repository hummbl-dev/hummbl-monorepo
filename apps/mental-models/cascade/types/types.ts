/**
 * Core types for the HUMMBL system
 */

export interface HummblContext {
  /** Unique identifier for the user */
  userId: string;

  /** Session identifier */
  sessionId: string;

  /** Environment (e.g., 'development', 'staging', 'production') */
  environment: string;

  /** Application version */
  version: string;

  /** Optional: Additional context properties */
  [key: string]: any;
}

export interface HummblPayload {
  /** Type of the payload (e.g., 'interaction', 'error', 'performance') */
  type: string;

  /** Payload data */
  data: Record<string, any>;

  /** Optional: Timestamp specific to this payload */
  timestamp?: number;
}

export interface HummblPacket {
  /** Unique identifier for the packet */
  id: string;

  /** Timestamp when the packet was created */
  timestamp: number;

  /** Context information */
  context: HummblContext;

  /** The actual payload data */
  payload: HummblPayload;

  /** Optional: Metadata */
  metadata?: Record<string, any>;
}

/** Result of a validation operation */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;

  /** Array of error messages */
  errors: string[];

  /** Array of warning messages */
  warnings: string[];
}
