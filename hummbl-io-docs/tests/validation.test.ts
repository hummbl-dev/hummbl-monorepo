import { validateHUMMBLConcept, searchHUMMBL } from '../src/definitions';

describe('HUMMBL Validation', () => {
  test('validates known concepts', () => {
    const concept = validateHUMMBLConcept('EXAMPLE_001');
    expect(concept).toBeDefined();
    expect(concept?.name).toBe('Example Concept');
  });

  test('rejects unknown concepts', () => {
    const concept = validateHUMMBLConcept('FAKE_CONCEPT');
    expect(concept).toBeNull();
  });

  test('search returns validated results', () => {
    const results = searchHUMMBL('example');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(concept => {
      expect(concept.validation.source).toBe('authoritative');
    });
  });
});
