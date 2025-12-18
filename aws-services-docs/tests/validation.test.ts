import { validateAWSServicesConcept, searchAWSServices } from '../src/definitions';

describe('AWSServices Validation', () => {
  test('validates known concepts', () => {
    const concept = validateAWSServicesConcept('EXAMPLE_001');
    expect(concept).toBeDefined();
    expect(concept?.name).toBe('Example Concept');
  });

  test('rejects unknown concepts', () => {
    const concept = validateAWSServicesConcept('FAKE_CONCEPT');
    expect(concept).toBeNull();
  });

  test('search returns validated results', () => {
    const results = searchAWSServices('example');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(concept => {
      expect(concept.validation.source).toBe('authoritative');
    });
  });
});
