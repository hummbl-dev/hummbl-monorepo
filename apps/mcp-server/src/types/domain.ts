/**
 * HUMMBL Base120 Domain Types
 * Core type definitions for mental models, transformations, and framework operations
 */

// Import shared types from @hummbl/core
import type {
  TransformationType,
  MentalModel as CoreMentalModel,
  Transformation as CoreTransformation,
  Result,
} from '@hummbl/core';

import { isOk, isError } from '@hummbl/core';

export type { TransformationType, Result };
export { isOk, isError };

export const TRANSFORMATION_TYPES: readonly TransformationType[] = [
  'P',
  'IN',
  'CO',
  'DE',
  'RE',
  'SY',
] as const;

export const isTransformationType = (value: unknown): value is TransformationType => {
  if (typeof value !== 'string') {
    return false;
  }
  return TRANSFORMATION_TYPES.includes(value as TransformationType);
};

// Extend MentalModel with priority field for MCP server
export interface MentalModel extends CoreMentalModel {
  priority: number;
}

// Use Core Transformation directly (which uses 'code' property)
export type Transformation = CoreTransformation;

export interface ProblemPattern {
  pattern: string;
  transformations: TransformationType[];
  topModels: string[];
}

export interface ModelRecommendation {
  model: MentalModel;
  relevance_score: number;
  reasoning: string;
}

export interface AnalysisGuide {
  problem_type: string;
  recommended_approach: string;
  primary_models: string[];
  secondary_models: string[];
  workflow: string[];
}

export type DialecticalStageId =
  | 'thesis'
  | 'antithesis'
  | 'synthesis'
  | 'convergence'
  | 'meta_reflection';

export interface StageModelMapping {
  stage: DialecticalStageId;
  title: string;
  description: string;
  modelCodes: string[];
}

export interface DialecticalMethodology {
  id: string;
  title: string;
  version: string;
  summary: string;
  documentUrl?: string;
  totalPages?: number;
  modelsReferenced: string[];
  stages: StageModelMapping[];
  metaModels: string[];
}

export type ModelReferenceIssueType = 'NotFound' | 'WrongTransformation' | 'Duplicate' | 'Unknown';

export interface ModelReferenceIssue {
  code: string;
  issueType: ModelReferenceIssueType;
  message: string;
  expectedTransformation?: TransformationType;
  actualTransformation?: TransformationType;
}

export interface MethodologyAuditResult {
  methodologyId: string;
  documentVersion: string;
  totalReferences: number;
  validCount: number;
  invalidCount: number;
  issues: ModelReferenceIssue[];
}

/**
 * Domain-wide error type for HUMMBL Base120 operations.
 */
export type DomainError =
  | { type: 'NotFound'; entity: string; code?: string }
  | { type: 'ValidationError'; field?: string; message: string }
  | { type: 'Conflict'; entity: string; message: string }
  | { type: 'Internal'; message: string }
  | { type: 'Unknown'; message: string };

// Helper constructors for Result type
export const ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

export const err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

export function isNotFoundError(
  error: DomainError
): error is Extract<DomainError, { type: 'NotFound' }> {
  return error.type === 'NotFound';
}

/**
 * API Key tiers with rate limits and permissions
 */
export type ApiKeyTier = 'free' | 'pro' | 'enterprise';

export interface ApiKeyInfo {
  id: string;
  key: string;
  tier: ApiKeyTier;
  name: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  rateLimit: {
    requestsPerHour: number;
    requestsPerDay: number;
  };
  permissions: readonly string[];
  isActive: boolean;
}

/**
 * Authentication result types
 */
export type AuthResult = Result<ApiKeyInfo, AuthError>;

export type AuthError =
  | { type: 'MISSING_AUTH'; message: string }
  | { type: 'INVALID_FORMAT'; message: string }
  | { type: 'KEY_NOT_FOUND'; message: string }
  | { type: 'KEY_INACTIVE'; message: string }
  | { type: 'RATE_LIMIT_EXCEEDED'; message: string }
  | { type: 'INTERNAL_ERROR'; message: string };
