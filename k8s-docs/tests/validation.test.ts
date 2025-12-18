import { validateKubernetesConcept, searchKubernetes } from '../src/definitions';

describe('Kubernetes Validation', () => {
  test('validates known concepts', () => {
    const concept = validateKubernetesConcept('EXAMPLE_001');
    expect(concept).toBeDefined();
    expect(concept?.name).toBe('Example Concept');
  });

  test('rejects unknown concepts', () => {
    const concept = validateKubernetesConcept('FAKE_CONCEPT');
    expect(concept).toBeNull();
  });

  test('search returns validated results', () => {
    const results = searchKubernetes('example');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(concept => {
      expect(concept.validation.source).toBe('authoritative');
    });
  });
});
