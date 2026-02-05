import { MentalModel } from '../models/mentalModels';
import { transformationMap } from '../../cascade/types/transformation';

/**
 * Validates a single mental model against the schema
 */
export function validateMentalModel(model: unknown): model is MentalModel {
  if (!model || typeof model !== 'object') {
    console.error('Invalid model: not an object', model);
    return false;
  }

  const m = model as Partial<MentalModel>;

  // Required fields check
  const requiredFields: Array<keyof MentalModel> = [
    'id',
    'name',
    'code',
    'description',
    'category',
    'tags',
    'transformations',
    'sources',
  ];

  for (const field of requiredFields) {
    if (m[field] === undefined) {
      console.error(`Missing required field: ${field}`, model);
      return false;
    }
  }

  // Type checks
  if (
    typeof m.id !== 'string' ||
    typeof m.name !== 'string' ||
    typeof m.code !== 'string' ||
    typeof m.description !== 'string' ||
    typeof m.category !== 'string' ||
    !Array.isArray(m.tags) ||
    !Array.isArray(m.transformations) ||
    !Array.isArray(m.sources)
  ) {
    console.error('Type mismatch in model fields', model);
    return false;
  }

  // Validate transformations against allowed keys
  const allowed: Set<string> = new Set(Object.keys(transformationMap)); // ['P','IN','CO','DE','RE','SY']
  if (!m.transformations.every((t) => typeof t === 'string' && allowed.has(t))) {
    console.error('Invalid transformation keys', model);
    return false;
  }

  // Validate sources
  if (
    !m.sources.every(
      (s) =>
        s && typeof s === 'object' && typeof s.name === 'string' && typeof s.reference === 'string'
    )
  ) {
    console.error('Invalid source format', model);
    return false;
  }

  // Validate meta if present
  if (m.meta && typeof m.meta === 'object') {
    const meta = m.meta as Record<string, unknown>;

    if ('added' in meta && typeof meta.added !== 'string') {
      console.error('Invalid meta.added', model);
      return false;
    }

    if (
      'difficulty' in meta &&
      (typeof meta.difficulty !== 'number' || meta.difficulty < 1 || meta.difficulty > 5)
    ) {
      console.error('Invalid meta.difficulty (must be 1-5)', model);
      return false;
    }
  }

  return true;
}

/**
 * Validates an array of mental models
 */
export function validateMentalModels(models: unknown[]): models is MentalModel[] {
  if (!Array.isArray(models)) {
    console.error('Expected an array of models');
    return false;
  }

  return models.every(validateMentalModel);
}
