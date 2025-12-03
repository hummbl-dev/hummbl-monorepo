import { TRANSFORMATIONS } from './data.js';
import type { MentalModel } from './types.js';

export function getAllModels(): MentalModel[] {
  return Object.values(TRANSFORMATIONS).flatMap(t => t.models);
}

export function getModelByCode(code: string): MentalModel | undefined {
  const normalizedCode = code.toUpperCase();
  return getAllModels().find(m => m.code === normalizedCode);
}
