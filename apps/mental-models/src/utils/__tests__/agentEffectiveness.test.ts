// Tests for agent effectiveness

import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordTask,
  calculateAgentMetrics,
  generateAgentReport,
  getTaskTypeDistribution,
  getProductivityTrend,
  getQualityTrend,
  exportAgentReport,
  clearAgentTasks,
  type AgentTask,
} from '../agentEffectiveness';

describe('Agent Effectiveness', () => {
  const mockTask: AgentTask = {
    id: 'task1',
    type: 'feature',
    description: 'Add new feature',
    startTime: Date.now() - 3600000,
    endTime: Date.now(),
    success: true,
    linesAdded: 150,
    linesModified: 50,
    linesDeleted: 20,
    filesModified: 3,
    testsAdded: 5,
    buildPassed: true,
    feedbackScore: 4,
  };

  beforeEach(() => {
    clearAgentTasks();
  });

  describe('recordTask', () => {
    it('records a task', () => {
      recordTask(mockTask);

      const metrics = calculateAgentMetrics();
      expect(metrics.totalTasks).toBe(1);
    });

    it('records multiple tasks', () => {
      recordTask(mockTask);
      recordTask({ ...mockTask, id: 'task2' });

      const metrics = calculateAgentMetrics();
      expect(metrics.totalTasks).toBe(2);
    });

    it('limits stored tasks to MAX_TASKS', () => {
      for (let i = 0; i < 60; i++) {
        recordTask({ ...mockTask, id: `task${i}` });
      }

      const metrics = calculateAgentMetrics();
      expect(metrics.totalTasks).toBeLessThanOrEqual(50);
    });
  });

  describe('calculateAgentMetrics', () => {
    it('calculates metrics correctly', () => {
      recordTask(mockTask);
      recordTask({ ...mockTask, id: 'task2', success: false, buildPassed: false });

      const metrics = calculateAgentMetrics();

      expect(metrics.totalTasks).toBe(2);
      expect(metrics.successfulTasks).toBe(1);
      expect(metrics.successRate).toBe(0.5);
      expect(metrics.buildSuccessRate).toBe(0.5);
    });

    it('calculates productivity (lines per hour)', () => {
      const oneHourAgo = Date.now() - 3600000;
      recordTask({
        ...mockTask,
        startTime: oneHourAgo,
        endTime: Date.now(),
        linesAdded: 500,
        linesModified: 100,
      });

      const metrics = calculateAgentMetrics();
      expect(metrics.productivity).toBeGreaterThan(0);
    });

    it('calculates average feedback score', () => {
      recordTask({ ...mockTask, feedbackScore: 5 });
      recordTask({ ...mockTask, id: 'task2', feedbackScore: 3 });

      const metrics = calculateAgentMetrics();
      expect(metrics.averageFeedbackScore).toBe(4);
    });

    it('handles tasks without feedback scores', () => {
      recordTask({ ...mockTask, feedbackScore: undefined });

      const metrics = calculateAgentMetrics();
      expect(metrics.averageFeedbackScore).toBe(0);
    });

    it('returns zero metrics when no tasks exist', () => {
      const metrics = calculateAgentMetrics();

      expect(metrics.totalTasks).toBe(0);
      expect(metrics.successRate).toBe(0);
      expect(metrics.productivity).toBe(0);
    });
  });

  describe('generateAgentReport', () => {
    it('generates comprehensive report', () => {
      recordTask(mockTask);
      recordTask({ ...mockTask, id: 'task2', feedbackScore: 5 });

      const report = generateAgentReport();

      expect(report.metrics).toBeDefined();
      expect(report.recentTasks).toHaveLength(2);
      expect(report.strengths).toBeDefined();
      expect(report.improvements).toBeDefined();
      expect(report.grade).toMatch(/^[ABCDF]$/);
    });

    it('identifies strengths for high performance', () => {
      for (let i = 0; i < 10; i++) {
        recordTask({
          ...mockTask,
          id: `task${i}`,
          feedbackScore: 5,
          linesAdded: 300,
        });
      }

      const report = generateAgentReport();
      expect(report.strengths.length).toBeGreaterThan(0);
    });

    it('identifies improvements for low performance', () => {
      for (let i = 0; i < 10; i++) {
        recordTask({
          ...mockTask,
          id: `task${i}`,
          success: false,
          buildPassed: false,
          feedbackScore: 2,
          linesAdded: 50,
        });
      }

      const report = generateAgentReport();
      expect(report.improvements.length).toBeGreaterThan(0);
    });

    it('assigns appropriate grade', () => {
      // Excellent performance
      for (let i = 0; i < 5; i++) {
        recordTask({
          ...mockTask,
          id: `task${i}`,
          success: true,
          buildPassed: true,
          feedbackScore: 5,
        });
      }

      const report = generateAgentReport();
      expect(['A', 'B']).toContain(report.grade);
    });
  });

  describe('getTaskTypeDistribution', () => {
    it('calculates task type distribution', () => {
      recordTask({ ...mockTask, type: 'feature' });
      recordTask({ ...mockTask, id: 'task2', type: 'fix' });
      recordTask({ ...mockTask, id: 'task3', type: 'feature' });
      recordTask({ ...mockTask, id: 'task4', type: 'test' });

      const distribution = getTaskTypeDistribution();

      expect(distribution.feature).toBe(2);
      expect(distribution.fix).toBe(1);
      expect(distribution.test).toBe(1);
      expect(distribution.refactor).toBe(0);
      expect(distribution.docs).toBe(0);
    });
  });

  describe('getProductivityTrend', () => {
    it('detects improving productivity', () => {
      const baseTime = Date.now();

      // First half: low productivity
      for (let i = 0; i < 5; i++) {
        recordTask({
          ...mockTask,
          id: `task${i}`,
          startTime: baseTime - 7200000 + i * 1000,
          endTime: baseTime - 3600000 + i * 1000,
          linesAdded: 100,
          linesModified: 20,
        });
      }

      // Second half: high productivity
      for (let i = 5; i < 10; i++) {
        recordTask({
          ...mockTask,
          id: `task${i}`,
          startTime: baseTime - 3600000 + i * 1000,
          endTime: baseTime + i * 1000,
          linesAdded: 400,
          linesModified: 100,
        });
      }

      const trend = getProductivityTrend();
      expect(trend).toBe('improving');
    });

    it('returns stable for insufficient data', () => {
      recordTask(mockTask);
      const trend = getProductivityTrend();
      expect(trend).toBe('stable');
    });
  });

  describe('getQualityTrend', () => {
    it('detects improving quality', () => {
      // First half: poor quality
      for (let i = 0; i < 5; i++) {
        recordTask({
          ...mockTask,
          id: `task${i}`,
          success: false,
          buildPassed: false,
        });
      }

      // Second half: good quality
      for (let i = 5; i < 10; i++) {
        recordTask({
          ...mockTask,
          id: `task${i}`,
          success: true,
          buildPassed: true,
        });
      }

      const trend = getQualityTrend();
      expect(trend).toBe('improving');
    });

    it('returns stable for insufficient data', () => {
      recordTask(mockTask);
      const trend = getQualityTrend();
      expect(trend).toBe('stable');
    });
  });

  describe('exportAgentReport', () => {
    it('exports report as text', () => {
      recordTask(mockTask);

      const report = exportAgentReport();

      expect(report).toContain('Cascade Agent Effectiveness Report');
      expect(report).toContain('Overall Grade');
      expect(report).toContain('Performance Metrics');
      expect(report).toContain('Task Distribution');
    });

    it('includes all sections', () => {
      recordTask(mockTask);
      recordTask({ ...mockTask, id: 'task2', feedbackScore: 5 });

      const report = exportAgentReport();

      expect(report).toContain('Total Tasks');
      expect(report).toContain('Success Rate');
      expect(report).toContain('Productivity');
      expect(report).toContain('feature');
    });
  });

  describe('clearAgentTasks', () => {
    it('clears all tasks', () => {
      recordTask(mockTask);
      clearAgentTasks();

      const metrics = calculateAgentMetrics();
      expect(metrics.totalTasks).toBe(0);
    });
  });
});
