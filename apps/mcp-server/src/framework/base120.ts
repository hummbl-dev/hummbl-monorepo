/**
 * HUMMBL Base120 Mental Models Framework
 * Version: 1.0-beta (Definitive Reference)
 * Validation Date: October 16, 2025
 * Quality Score: 9.2/10
 */

import type {
  MentalModel,
  Transformation,
  TransformationType,
  DomainError,
} from '../types/domain.js';
import { type Result, ok, err } from '../types/domain.js';
import {
  TRANSFORMATIONS,
  getAllModels as coreGetAllModels,
  getModelByCode as coreGetModelByCode,
} from '@hummbl/core';

export { TRANSFORMATIONS };

export const PROBLEM_PATTERNS = [
  { pattern: 'Unclear problem definition', transformations: ['P'], topModels: ['P1', 'P2', 'P4'] },
  {
    pattern: 'Stuck in conventional thinking',
    transformations: ['IN'],
    topModels: ['IN1', 'IN2', 'IN3'],
  },
  {
    pattern: 'Need to assemble solution',
    transformations: ['CO'],
    topModels: ['CO1', 'CO2', 'CO4'],
  },
  {
    pattern: 'Complex system to understand',
    transformations: ['DE'],
    topModels: ['DE1', 'DE2', 'DE7'],
  },
  {
    pattern: 'Feedback or iteration issues',
    transformations: ['RE'],
    topModels: ['RE1', 'RE2', 'RE3'],
  },
  {
    pattern: 'Strategic or coordination challenge',
    transformations: ['SY'],
    topModels: ['SY1', 'SY2', 'SY19'],
  },
];

export function getAllModels(): MentalModel[] {
  return coreGetAllModels();
}

export function getModelByCode(code: string): Result<MentalModel, DomainError> {
  const model = coreGetModelByCode(code);

  if (!model) {
    return err({ type: 'NotFound', entity: 'MentalModel', code: code.toUpperCase() });
  }

  return ok(model);
}

export function getTransformationByKey(
  key: TransformationType
): Result<Transformation, DomainError> {
  const transformation = TRANSFORMATIONS[key] ?? null;

  if (!transformation) {
    return err({ type: 'NotFound', entity: 'Transformation', code: key });
  }

  return ok(transformation);
}

export function searchModels(query: string): Result<MentalModel[], DomainError> {
  const lowerQuery = query.toLowerCase();
  const results = getAllModels().filter(
    m =>
      m.code.toLowerCase().includes(lowerQuery) ||
      m.name.toLowerCase().includes(lowerQuery) ||
      m.definition.toLowerCase().includes(lowerQuery)
  );

  return ok(results);
}

export function getModelsByPriority(priority: number): Result<MentalModel[], DomainError> {
  const models = getAllModels().filter(m => m.priority === priority);
  return ok(models);
}

export function getModelsByTransformation(
  transformationKey: TransformationType
): Result<MentalModel[], DomainError> {
  const trans = TRANSFORMATIONS[transformationKey] ?? null;

  if (!trans) {
    return err({ type: 'NotFound', entity: 'Transformation', code: transformationKey });
  }

  return ok(trans.models);
}
