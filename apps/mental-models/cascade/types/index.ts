export interface HummblPacket {
  id: string;
  timestamp: number;
  context: {
    userId: string;
    sessionId: string;
    [key: string]: any; // Allow additional context properties
  };
  payload: Record<string, any>;
  [key: string]: any; // Allow additional top-level properties
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
