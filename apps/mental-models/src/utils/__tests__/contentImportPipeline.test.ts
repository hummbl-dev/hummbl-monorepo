// Tests for contentImportPipeline

import { describe, it, expect, beforeEach } from 'vitest';
import { ContentImportPipeline } from '../contentImportPipeline';

describe('ContentImportPipeline', () => {
  let pipeline: ContentImportPipeline;

  beforeEach(() => {
    pipeline = new ContentImportPipeline();
  });

  describe('Narrative Import', () => {
    it('imports valid narratives', async () => {
      const data = [
        {
          narrative_id: 'N999',
          title: 'Test Narrative',
          summary: 'Test summary',
          category: 'Test',
          evidence_quality: 'High',
          confidence_level: 0.9,
        },
      ];

      const result = await pipeline.importNarratives(data);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.stats.imported).toBe(1);
    });

    it('rejects narratives with missing required fields', async () => {
      const data = [
        {
          narrative_id: 'N999',
          // Missing title
          summary: 'Test',
          category: 'Test',
          evidence_quality: 'High',
          confidence_level: 0.9,
        },
      ];

      const result = await pipeline.importNarratives(data);

      expect(result.success).toBe(false);
      expect(result.stats.failed).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('validates evidence_quality enum', async () => {
      const data = [
        {
          narrative_id: 'N999',
          title: 'Test',
          summary: 'Test',
          category: 'Test',
          evidence_quality: 'Invalid',
          confidence_level: 0.9,
        },
      ];

      const result = await pipeline.importNarratives(data);

      expect(result.errors.some((e) => e.field === 'evidence_quality')).toBe(true);
    });

    it('handles multiple narratives', async () => {
      const data = [
        {
          narrative_id: 'N1',
          title: 'Test 1',
          summary: 'Test',
          category: 'Test',
          evidence_quality: 'High',
          confidence_level: 0.9,
        },
        {
          narrative_id: 'N2',
          title: 'Test 2',
          summary: 'Test',
          category: 'Test',
          evidence_quality: 'Medium',
          confidence_level: 0.8,
        },
      ];

      const result = await pipeline.importNarratives(data);

      expect(result.data).toHaveLength(2);
      expect(result.stats.imported).toBe(2);
    });
  });

  describe('Mental Model Import', () => {
    it('imports valid mental models', async () => {
      const data = [
        {
          id: 'MM999',
          name: 'Test Model',
          category: 'Test',
        },
      ];

      const result = await pipeline.importMentalModels(data);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.stats.imported).toBe(1);
    });

    it('rejects models with missing required fields', async () => {
      const data = [
        {
          id: 'MM999',
          // Missing name
          category: 'Test',
        },
      ];

      const result = await pipeline.importMentalModels(data);

      expect(result.success).toBe(false);
      expect(result.stats.failed).toBe(1);
    });

    it('validates difficulty enum', async () => {
      const data = [
        {
          id: 'MM999',
          name: 'Test',
          category: 'Test',
          difficulty: 'Expert', // Invalid
        },
      ];

      const result = await pipeline.importMentalModels(data);

      expect(result.errors.some((e) => e.field === 'difficulty')).toBe(true);
    });

    it('validates tags as array', async () => {
      const data = [
        {
          id: 'MM999',
          name: 'Test',
          category: 'Test',
          tags: 'not-an-array',
        },
      ];

      const result = await pipeline.importMentalModels(data);

      expect(result.errors.some((e) => e.field === 'tags')).toBe(true);
    });
  });

  describe('Content Merging', () => {
    it('replaces existing items', () => {
      const existing = [{ id: '1', name: 'Old' }];
      const imported = [{ id: '1', name: 'New' }];

      const merged = pipeline.mergeContent(existing, imported, 'replace');

      expect(merged).toHaveLength(1);
      expect(merged[0].name).toBe('New');
    });

    it('skips existing items', () => {
      const existing = [{ id: '1', name: 'Old' }];
      const imported = [{ id: '1', name: 'New' }];

      const merged = pipeline.mergeContent(existing, imported, 'skip');

      expect(merged).toHaveLength(1);
      expect(merged[0].name).toBe('Old');
    });

    it('merges properties', () => {
      const existing = [{ id: '1', name: 'Old', extra: 'keep' }];
      const imported = [{ id: '1', name: 'New' }];

      const merged = pipeline.mergeContent(existing, imported, 'merge');

      expect(merged).toHaveLength(1);
      expect(merged[0].name).toBe('New');
      expect((merged[0] as (typeof existing)[0]).extra).toBe('keep');
    });

    it('adds new items', () => {
      const existing = [{ id: '1', name: 'Old' }];
      const imported = [{ id: '2', name: 'New' }];

      const merged = pipeline.mergeContent(existing, imported, 'replace');

      expect(merged).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('tracks errors', async () => {
      const data = [
        { id: 'valid', name: 'Valid', category: 'Test' },
        { id: 'invalid' }, // Missing name
      ];

      await pipeline.importMentalModels(data);

      expect(pipeline.getErrors().length).toBeGreaterThan(0);
    });

    it('clears errors', () => {
      pipeline.clearErrors();

      expect(pipeline.getErrors()).toHaveLength(0);
    });
  });

  describe('Statistics', () => {
    it('calculates correct stats', async () => {
      const data = [
        { id: '1', name: 'Valid 1', category: 'Test' },
        { id: '2', name: 'Valid 2', category: 'Test' },
        { id: '3' }, // Invalid
      ];

      const result = await pipeline.importMentalModels(data);

      expect(result.stats.total).toBe(3);
      expect(result.stats.imported).toBe(2);
      expect(result.stats.failed).toBe(1);
      expect(result.stats.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
