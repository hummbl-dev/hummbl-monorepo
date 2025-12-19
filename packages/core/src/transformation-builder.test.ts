import { describe, it, expect } from 'vitest';
import { TransformationBuilder, TRANSFORMATION_TEMPLATES } from './transformation-builder.js';

describe('TransformationBuilder', () => {
  it('should create a valid transformation', () => {
    const result = TransformationBuilder.create()
      .withCode('AN')
      .withName('Analysis')
      .withDescription('Break down complex problems')
      .withAuthor('Test Author')
      .addModel({
        code: 'AN1',
        name: 'Root Cause Analysis',
        definition: 'Identify fundamental causes',
        whenToUse: 'When problems recur',
        priority: 1,
      })
      .build();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.code).toBe('AN');
      expect(result.value.name).toBe('Analysis');
      expect(result.value.models).toHaveLength(1);
      expect(result.value.author).toBe('Test Author');
    }
  });

  it('should validate required fields', () => {
    const result = TransformationBuilder.create().build();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('code is required');
    }
  });

  it('should enforce code length limit', () => {
    const result = TransformationBuilder.create()
      .withCode('TOOLONG')
      .withName('Test')
      .withDescription('Test')
      .addModel({
        code: 'T1',
        name: 'Test',
        definition: 'Test',
        whenToUse: 'Test',
        priority: 1,
      })
      .build();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('3 characters or less');
    }
  });

  it('should enforce model count limit', () => {
    let builder = TransformationBuilder.create()
      .withCode('T')
      .withName('Test')
      .withDescription('Test');

    // Add 21 models (over limit)
    for (let i = 1; i <= 21; i++) {
      builder = builder.addModel({
        code: `T${i}`,
        name: `Test ${i}`,
        definition: 'Test',
        whenToUse: 'Test',
        priority: 1,
      });
    }

    const result = builder.build();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Maximum 20 models');
    }
  });
});

describe('TRANSFORMATION_TEMPLATES', () => {
  it('should have valid templates', () => {
    expect(TRANSFORMATION_TEMPLATES).toHaveLength(3);
    expect(TRANSFORMATION_TEMPLATES[0].name).toBe('Analysis');
    expect(TRANSFORMATION_TEMPLATES[0].examples).toContain('Root Cause Analysis');
  });
});
