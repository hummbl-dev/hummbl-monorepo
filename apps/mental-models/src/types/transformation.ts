/**
 * Transformation types used in the HUMMBL framework
 * These represent different transformation categories that mental models can be associated with
 */

export type TransformationKey = 
  | 'P'   // Perspective/Identity
  | 'IN'  // Information
  | 'CO'  // Communication
  | 'DE'  // Decision Making
  | 'RE'  // Relationships
  | 'SY'  // Systems Thinking
  | 'ST'  // Strategic Thinking
  | 'CR'  // Creative Thinking
  | 'EM'  // Emotional Intelligence
  | 'LE'  // Learning & Growth
  | 'CH'  // Change Management
  | 'INN' // Innovation
  | 'PR'  // Problem Solving
  | 'AN'  // Analysis
  | 'EV'  // Evaluation
  | 'PL'  // Planning
  | 'IM'  // Implementation
  | 'MO'  // Motivation
  | 'LEA' // Leadership
  | 'TE'  // Teamwork
  | 'COG' // Cognitive Biases
  | 'ME'  // Mental Models
  | 'ET'  // Ethics
  | string; // Allow for future extensions

/**
 * Transformation category with metadata
 */
export interface TransformationCategory {
  /** Unique key */
  key: TransformationKey;
  /** Display name */
  name: string;
  /** Description of the transformation category */
  description: string;
  /** Related categories */
  related?: TransformationKey[];
  /** Icon or visual representation */
  icon?: string;
  /** Color for UI representation */
  color?: string;
}

/**
 * Map of all transformation categories
 */
export const TRANSFORMATIONS: Record<TransformationKey, TransformationCategory> = {
  P: {
    key: 'P',
    name: 'Perspective/Identity',
    description: 'Transforming how we see ourselves and our relationship to the world',
    color: '#4F46E5', // indigo
    icon: 'eye'
  },
  IN: {
    key: 'IN',
    name: 'Information',
    description: 'Processing and interpreting information',
    color: '#10B981', // emerald
    icon: 'information-circle'
  },
  CO: {
    key: 'CO',
    name: 'Communication',
    description: 'Effective exchange of information and ideas',
    color: '#3B82F6', // blue
    icon: 'chat-bubble-oval-left-ellipsis'
  },
  DE: {
    key: 'DE',
    name: 'Decision Making',
    description: 'Processes for making effective decisions',
    color: '#8B5CF6', // violet
    icon: 'check-circle'
  },
  RE: {
    key: 'RE',
    name: 'Relationships',
    description: 'Building and maintaining effective relationships',
    color: '#EC4899', // pink
    icon: 'user-group'
  },
  SY: {
    key: 'SY',
    name: 'Systems Thinking',
    description: 'Understanding complex systems and their interactions',
    color: '#06B6D4', // cyan
    icon: 'puzzle-piece'
  },
  // Add other transformation categories as needed
} as const;

/**
 * Get a transformation category by its key
 */
export function getTransformation(key: TransformationKey): TransformationCategory | undefined {
  return TRANSFORMATIONS[key];
}

/**
 * Get all transformation categories
 */
export function getAllTransformations(): TransformationCategory[] {
  return Object.values(TRANSFORMATIONS);
}

/**
 * Check if a value is a valid transformation key
 */
export function isTransformationKey(value: string): value is TransformationKey {
  return value in TRANSFORMATIONS;
}
