// Test file for validation utilities - updated to test pre-push hook
import { describe, it, expect } from 'vitest';
import { validateMentalModel, validateMentalModels } from '../validation';

describe('Mental Model Validation', () => {
  const validModel = {
    id: '1',
    name: 'First Principles',
    code: 'FP',
    description: 'Breaking down problems',
    category: 'Problem Solving',
    tags: ['thinking'],
    transformations: ['P'],
    sources: [{ name: 'Aristotle', reference: 'Metaphysics' }],
    meta: { added: '2025-01-01', updated: '2025-01-01', isCore: true, difficulty: 3 },
  };

  it('validates a complete mental model', () => {
    expect(validateMentalModel(validModel)).toBe(true);
  });

  it('rejects non-object values', () => {
    expect(validateMentalModel(null)).toBe(false);
    expect(validateMentalModel(undefined)).toBe(false);
    expect(validateMentalModel('string')).toBe(false);
    expect(validateMentalModel(123)).toBe(false);
  });

  it('requires all mandatory fields', () => {
    const { id, ...missingId } = validModel;
    expect(validateMentalModel(missingId)).toBe(false);
  });

  it('validates transformation values', () => {
    const invalidTransform = { ...validModel, transformations: ['INVALID'] };
    expect(validateMentalModel(invalidTransform)).toBe(false);
  });

  it('validates array of models', () => {
    const models = [validModel, { ...validModel, id: '2' }];
    expect(validateMentalModels(models)).toBe(true);

    const invalidModels = [validModel, { invalid: 'model' }];
    expect(validateMentalModels(invalidModels)).toBe(false);
  });
});
