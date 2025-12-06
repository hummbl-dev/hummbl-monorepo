import { describe, it, expect } from 'vitest';
import {
  TRANSFORMATION_TYPES,
  isTransformationType,
  ok,
  err,
  isOk,
  isError,
  type DomainError,
  isNotFoundError,
} from '../types/domain.js';

describe('domain type helpers', () => {
  describe('isTransformationType', () => {
    it('accepts only known transformation keys', () => {
      for (const key of TRANSFORMATION_TYPES) {
        expect(isTransformationType(key)).toBe(true);
      }
    });

    it('rejects non-string or unknown values', () => {
      expect(isTransformationType(42)).toBe(false);
      expect(isTransformationType('UNKNOWN')).toBe(false);
    });
  });

  describe('Result helpers', () => {
    it('creates ok result and passes through isOk/isError guards', () => { // Updated description
      const value = 'success'; // Original value
      const valueResult = ok(value); // Original ok call

      expect(isOk(valueResult)).toBe(true);
      expect(isError(valueResult)).toBe(false); // Changed from isErr to isError
      if (valueResult.ok) {
        expect(valueResult.value).toBe('success');
      }
    });

    it('creates err result and identifies not found errors', () => {
      const error: DomainError = { type: 'NotFound', entity: 'model', code: 'P1' };
      const errorResult = err(error);
      expect(isError(errorResult)).toBe(true); // Changed from isErr to isError
      expect(isOk(errorResult)).toBe(false);
      expect(isNotFoundError(error)).toBe(true);
    });

    it('recognizes non-NotFound errors', () => {
      const error: DomainError = { type: 'ValidationError', message: 'invalid' };
      expect(isNotFoundError(error)).toBe(false);
    });
  });
});
