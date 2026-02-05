import type { Narrative } from '@cascade/types/narrative';
import type { MentalModel } from '@cascade/types/mental-model';
import type { TransformationKey } from '@cascade/types/transformation';

export type { Narrative, MentalModel, TransformationKey };

export interface ImportResult<T> {
  success: boolean;
  data?: T[];
  errors: ImportError[];
  stats: ImportStats;
}

export interface ImportError {
  file?: string;
  line?: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
  failed: number;
  duration: number;
}

export interface ValidationRule<T> {
  field: keyof T;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validator?: (value: unknown) => boolean;
}
