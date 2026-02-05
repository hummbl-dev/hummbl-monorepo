// Tests for code quality metrics

import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateQualityScore,
  saveQualityMetrics,
  getQualityHistory,
  getLatestQualityMetrics,
  getQualityTrend,
  compareWithBaseline,
  generateQualityReport,
  passesQualityGate,
  clearQualityHistory,
  type CodeQualityMetrics,
} from '../codeQualityMetrics';

describe('Code Quality Metrics', () => {
  const mockMetrics: CodeQualityMetrics = {
    testCoverage: 85,
    componentCount: 15,
    utilityCount: 8,
    averageFileSize: 250,
    typeScriptUsage: 95,
    lintIssues: 2,
    buildTime: 1800,
    bundleSize: 180000,
    timestamp: Date.now(),
  };

  beforeEach(() => {
    clearQualityHistory();
  });

  describe('calculateQualityScore', () => {
    it('calculates quality score for excellent metrics', () => {
      const score = calculateQualityScore(mockMetrics);

      expect(score.overall).toBeGreaterThan(80);
      expect(score.grade).toMatch(/^[AB]$/);
      expect(score.categories.testing).toBeGreaterThan(0);
      expect(score.categories.structure).toBeGreaterThan(0);
      expect(score.categories.performance).toBeGreaterThan(0);
      expect(score.categories.maintainability).toBeGreaterThan(0);
    });

    it('provides recommendations for areas needing improvement', () => {
      const poorMetrics: CodeQualityMetrics = {
        ...mockMetrics,
        testCoverage: 55,
        averageFileSize: 400,
        lintIssues: 8,
      };

      const score = calculateQualityScore(poorMetrics);
      expect(score.recommendations.length).toBeGreaterThan(0);
      expect(score.recommendations.some((r) => r.includes('coverage'))).toBe(true);
    });

    it('assigns grade A for score >= 90', () => {
      const excellentMetrics: CodeQualityMetrics = {
        testCoverage: 95,
        componentCount: 20,
        utilityCount: 8,
        averageFileSize: 180,
        typeScriptUsage: 100,
        lintIssues: 0,
        buildTime: 1500,
        bundleSize: 150000,
        timestamp: Date.now(),
      };

      const score = calculateQualityScore(excellentMetrics);
      expect(score.grade).toBe('A');
    });

    it('assigns grade F for score < 60', () => {
      const poorMetrics: CodeQualityMetrics = {
        testCoverage: 30,
        componentCount: 5,
        utilityCount: 10,
        averageFileSize: 500,
        typeScriptUsage: 40,
        lintIssues: 25,
        buildTime: 8000,
        bundleSize: 450000,
        timestamp: Date.now(),
      };

      const score = calculateQualityScore(poorMetrics);
      expect(score.grade).toBe('F');
    });
  });

  describe('saveQualityMetrics and getQualityHistory', () => {
    it('saves and retrieves quality metrics', () => {
      saveQualityMetrics(mockMetrics);

      const history = getQualityHistory();
      expect(history).toHaveLength(1);
      expect(history[0].testCoverage).toBe(85);
    });

    it('maintains history of multiple metrics', () => {
      saveQualityMetrics(mockMetrics);
      saveQualityMetrics({ ...mockMetrics, testCoverage: 90 });

      const history = getQualityHistory();
      expect(history).toHaveLength(2);
    });

    it('limits history to 30 entries', () => {
      for (let i = 0; i < 35; i++) {
        saveQualityMetrics({ ...mockMetrics, testCoverage: 80 + i });
      }

      const history = getQualityHistory();
      expect(history.length).toBeLessThanOrEqual(30);
    });
  });

  describe('getLatestQualityMetrics', () => {
    it('returns latest metrics', () => {
      saveQualityMetrics({ ...mockMetrics, testCoverage: 80 });
      saveQualityMetrics({ ...mockMetrics, testCoverage: 90 });

      const latest = getLatestQualityMetrics();
      expect(latest?.testCoverage).toBe(90);
    });

    it('returns null when no metrics exist', () => {
      const latest = getLatestQualityMetrics();
      expect(latest).toBeNull();
    });
  });

  describe('getQualityTrend', () => {
    it('detects improving trend', () => {
      const metrics = [75, 78, 80, 83, 85];
      metrics.forEach((coverage) => {
        saveQualityMetrics({ ...mockMetrics, testCoverage: coverage });
      });

      const trend = getQualityTrend('testCoverage');
      expect(trend).toBe('improving');
    });

    it('detects declining trend', () => {
      const metrics = [85, 83, 80, 78, 75];
      metrics.forEach((coverage) => {
        saveQualityMetrics({ ...mockMetrics, testCoverage: coverage });
      });

      const trend = getQualityTrend('testCoverage');
      expect(trend).toBe('declining');
    });

    it('detects stable trend', () => {
      const metrics = [80, 81, 80, 81, 80];
      metrics.forEach((coverage) => {
        saveQualityMetrics({ ...mockMetrics, testCoverage: coverage });
      });

      const trend = getQualityTrend('testCoverage');
      expect(trend).toBe('stable');
    });

    it('returns stable for insufficient data', () => {
      saveQualityMetrics(mockMetrics);
      const trend = getQualityTrend('testCoverage');
      expect(trend).toBe('stable');
    });
  });

  describe('compareWithBaseline', () => {
    it('compares metrics with baseline', () => {
      const baseline: CodeQualityMetrics = {
        ...mockMetrics,
        testCoverage: 75,
        buildTime: 2000,
      };

      const current: CodeQualityMetrics = {
        ...mockMetrics,
        testCoverage: 85,
        buildTime: 1800,
      };

      const diff = compareWithBaseline(current, baseline);

      expect(diff.testCoverage).toBe(10);
      expect(diff.buildTime).toBe(-200);
    });
  });

  describe('generateQualityReport', () => {
    it('generates quality report', () => {
      saveQualityMetrics(mockMetrics);

      const report = generateQualityReport();

      expect(report).toContain('Code Quality Report');
      expect(report).toContain('Overall Score');
      expect(report).toContain('Category Scores');
      expect(report).toContain('Metrics');
    });

    it('returns message when no metrics available', () => {
      const report = generateQualityReport();
      expect(report).toContain('No quality metrics available');
    });
  });

  describe('passesQualityGate', () => {
    it('passes quality gate with good metrics', () => {
      const result = passesQualityGate(mockMetrics);

      expect(result.passed).toBe(true);
      expect(result.failures).toHaveLength(0);
    });

    it('fails quality gate with low test coverage', () => {
      const badMetrics: CodeQualityMetrics = {
        ...mockMetrics,
        testCoverage: 50,
      };

      const result = passesQualityGate(badMetrics);

      expect(result.passed).toBe(false);
      expect(result.failures.some((f) => f.includes('coverage'))).toBe(true);
    });

    it('fails quality gate with too many lint issues', () => {
      const badMetrics: CodeQualityMetrics = {
        ...mockMetrics,
        lintIssues: 15,
      };

      const result = passesQualityGate(badMetrics);

      expect(result.passed).toBe(false);
      expect(result.failures.some((f) => f.includes('lint'))).toBe(true);
    });

    it('fails quality gate with long build time', () => {
      const badMetrics: CodeQualityMetrics = {
        ...mockMetrics,
        buildTime: 12000,
      };

      const result = passesQualityGate(badMetrics);

      expect(result.passed).toBe(false);
      expect(result.failures.some((f) => f.includes('Build time'))).toBe(true);
    });

    it('fails quality gate with large bundle size', () => {
      const badMetrics: CodeQualityMetrics = {
        ...mockMetrics,
        bundleSize: 600000,
      };

      const result = passesQualityGate(badMetrics);

      expect(result.passed).toBe(false);
      expect(result.failures.some((f) => f.includes('Bundle size'))).toBe(true);
    });
  });

  describe('clearQualityHistory', () => {
    it('clears quality history', () => {
      saveQualityMetrics(mockMetrics);
      clearQualityHistory();

      const history = getQualityHistory();
      expect(history).toHaveLength(0);
    });
  });
});
