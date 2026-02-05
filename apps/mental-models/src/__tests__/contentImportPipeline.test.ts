import { ContentImportPipeline } from '../utils/contentImportPipeline';

describe('ContentImportPipeline', () => {
  let pipeline: ContentImportPipeline;

  beforeEach(() => {
    pipeline = new ContentImportPipeline();
  });

  it('should validate a valid narrative', () => {
    const validNarrative = {
      id: 'test-1',
      title: 'Test Narrative',
      content: 'This is a test narrative',
      category: 'test',
      narrative_id: 'narr-test-1',
      version: '1.0.0',
      provenance_hash: 'abc123',
      summary: 'Test summary',
      tags: ['test'],
      domain: ['test'],
      evidence_quality: 'A',
      confidence: 90,
      complexity: {
        cognitive_load: 'low',
        time_to_elicit: 'low',
        expertise_required: 'beginner',
      },
      examples: [
        {
          scenario: 'Test scenario',
          application: 'Test application',
          outcome: 'Test outcome',
        },
      ],
    };

    const result = pipeline['validateNarrative'](validNarrative, 0);
    expect(result).toBeTruthy();
    expect(result?.id).toBe('test-1');
    expect(result?.title).toBe('Test Narrative');
  });

  it('should handle invalid narrative', () => {
    const invalidNarrative = {
      // Missing required fields
      title: 'Invalid Narrative',
    };

    expect(() => {
      pipeline['validateNarrative'](invalidNarrative, 0);
    }).toThrow();
  });
});
