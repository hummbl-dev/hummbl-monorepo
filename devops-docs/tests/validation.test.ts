import { validateDevOpsConcept, searchDevOps } from '../src/definitions';

describe('DevOps Validation', () => {
  test('validates known concepts', () => {
    const concept = validateDevOpsConcept('EXAMPLE_001');
    expect(concept).toBeDefined();
    expect(concept?.name).toBe('Example Concept');
  });

  test('rejects unknown concepts', () => {
    const concept = validateDevOpsConcept('FAKE_CONCEPT');
    expect(concept).toBeNull();
  });

  test('search returns validated results', () => {
    const results = searchDevOps('example');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(concept => {
      expect(concept.validation.source).toBe('authoritative');
    });
  });
});
