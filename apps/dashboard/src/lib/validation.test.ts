import { describe, it, expect } from 'vitest';
import { validateReason, validateIncidentId, validateAction } from './validation';

describe('validation', () => {
  describe('validateReason', () => {
    it('should accept valid reason', () => {
      expect(validateReason('Valid reason')).toBe('Valid reason');
    });

    it('should throw for empty reason', () => {
      expect(() => validateReason('')).toThrow('Reason is required');
    });

    it('should sanitize HTML characters', () => {
      expect(validateReason('Test <script>')).toBe('Test script');
    });
  });

  describe('validateIncidentId', () => {
    it('should accept valid incident ID', () => {
      expect(validateIncidentId('INC-001')).toBe('INC-001');
    });

    it('should uppercase incident ID', () => {
      expect(validateIncidentId('inc-123')).toBe('INC-123');
    });

    it('should throw for invalid format', () => {
      expect(() => validateIncidentId('invalid')).toThrow('Invalid incident ID format');
    });
  });

  describe('validateAction', () => {
    it('should accept valid action', () => {
      expect(validateAction('read')).toBe('read');
    });

    it('should accept all valid actions', () => {
      const validActions = ['read', 'commit', 'push', 'deploy', 'delete', 'schema_change', 'approve', 'execute'];
      for (const action of validActions) {
        expect(validateAction(action)).toBe(action);
      }
    });

    it('should throw for invalid action', () => {
      expect(() => validateAction('invalid')).toThrow();
    });
  });
});
