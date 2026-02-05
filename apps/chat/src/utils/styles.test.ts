// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { createStyleObject, setCSSVariable, setCSSVariables } from './styles';

describe('styles utils', () => {
  describe('createStyleObject', () => {
    it('creates a CSS properties object from a record', () => {
      const input = {
        '--custom-color': 'red',
        '--custom-size': '10px',
      };
      const result = createStyleObject(input);
      expect(result).toEqual({
        '--custom-color': 'red',
        '--custom-size': '10px',
      });
    });

    it('handles empty input', () => {
      const result = createStyleObject({});
      expect(result).toEqual({});
    });
  });

  describe('CSS Variable setters', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
    });

    it('setCSSVariable sets a single variable', () => {
      setCSSVariable(element, '--test-var', 'blue');
      expect(element.style.getPropertyValue('--test-var')).toBe('blue');
    });

    it('setCSSVariables sets multiple variables', () => {
      setCSSVariables(element, {
        '--var-1': '1',
        '--var-2': '2',
      });
      expect(element.style.getPropertyValue('--var-1')).toBe('1');
      expect(element.style.getPropertyValue('--var-2')).toBe('2');
    });
  });
});
