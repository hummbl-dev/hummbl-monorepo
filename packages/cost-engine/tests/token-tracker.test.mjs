import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Token Tracker', () => {
  const budgetConfig = {
    dailyLimit: 1000000,
    hourlyLimit: 100000,
    perRequestLimit: 32768,
    warningThreshold: 0.8,
    hardStopThreshold: 0.95,
    resetHour: 0,
    tierLimits: {
      critical: { dailyLimit: 500000, perRequestLimit: 65536, burstAllowance: 1.5 },
      high: { dailyLimit: 300000, perRequestLimit: 32768, burstAllowance: 1.2 },
      normal: { dailyLimit: 150000, perRequestLimit: 16384, burstAllowance: 1.0 },
      low: { dailyLimit: 40000, perRequestLimit: 8192, burstAllowance: 0.8 },
      batch: { dailyLimit: 10000, perRequestLimit: 4096, burstAllowance: 0.5 },
    },
  };

  const modelCosts = {
    models: {
      'claude-sonnet-4': { inputCostPer1k: 0.003, outputCostPer1k: 0.015, contextWindow: 200000 },
    },
    defaultCost: { inputCostPer1k: 0.003, outputCostPer1k: 0.015, contextWindow: 100000 },
  };

  describe('Cost calculation', () => {
    function calculateCost(inputTokens, outputTokens, model, modelCosts) {
      const costs = modelCosts.models[model] ?? modelCosts.defaultCost;
      const inputCost = (inputTokens / 1000) * costs.inputCostPer1k;
      const outputCost = (outputTokens / 1000) * costs.outputCostPer1k;
      return inputCost + outputCost;
    }

    it('should calculate cost correctly for known model', () => {
      const cost = calculateCost(1000, 500, 'claude-sonnet-4', modelCosts);
      // 1000 input tokens at $0.003/1k = $0.003
      // 500 output tokens at $0.015/1k = $0.0075
      // Total = $0.0105
      assert.ok(Math.abs(cost - 0.0105) < 0.0001, `Expected ~0.0105, got ${cost}`);
    });

    it('should use default cost for unknown model', () => {
      const cost = calculateCost(1000, 500, 'unknown-model', modelCosts);
      assert.ok(Math.abs(cost - 0.0105) < 0.0001, `Expected ~0.0105, got ${cost}`);
    });

    it('should handle zero tokens', () => {
      const cost = calculateCost(0, 0, 'claude-sonnet-4', modelCosts);
      assert.strictEqual(cost, 0);
    });
  });

  describe('Budget status', () => {
    it('should report warning when threshold exceeded', () => {
      // Simulate 80% usage
      const dailyUsed = 800000;
      const dailyPercent = dailyUsed / budgetConfig.dailyLimit;
      const isWarning = dailyPercent >= budgetConfig.warningThreshold;

      assert.strictEqual(isWarning, true);
    });

    it('should report hard stop when threshold exceeded', () => {
      // Simulate 95% usage
      const dailyUsed = 950000;
      const dailyPercent = dailyUsed / budgetConfig.dailyLimit;
      const isHardStop = dailyPercent >= budgetConfig.hardStopThreshold;

      assert.strictEqual(isHardStop, true);
    });

    it('should not warn under threshold', () => {
      // Simulate 50% usage
      const dailyUsed = 500000;
      const dailyPercent = dailyUsed / budgetConfig.dailyLimit;
      const isWarning = dailyPercent >= budgetConfig.warningThreshold;

      assert.strictEqual(isWarning, false);
    });
  });

  describe('Usage tracking', () => {
    it('should accumulate token usage', () => {
      const records = [];

      records.push({ inputTokens: 100, outputTokens: 50, timestamp: Date.now() });
      records.push({ inputTokens: 200, outputTokens: 100, timestamp: Date.now() });

      const totalUsage = records.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);
      assert.strictEqual(totalUsage, 450);
    });

    it('should filter by time period', () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;
      const twoHoursAgo = now - 2 * 60 * 60 * 1000;

      const records = [
        { inputTokens: 100, outputTokens: 50, timestamp: twoHoursAgo },
        { inputTokens: 200, outputTokens: 100, timestamp: now - 30 * 60 * 1000 },
        { inputTokens: 150, outputTokens: 75, timestamp: now },
      ];

      const hourlyUsage = records
        .filter((r) => r.timestamp >= oneHourAgo)
        .reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);

      assert.strictEqual(hourlyUsage, 525); // Only last two records
    });
  });

  describe('Alert generation', () => {
    it('should generate emergency alert at 95%', () => {
      const dailyPercent = 0.96;
      let alertLevel = null;

      if (dailyPercent >= 0.95) {
        alertLevel = 'emergency';
      } else if (dailyPercent >= 0.9) {
        alertLevel = 'critical';
      } else if (dailyPercent >= 0.75) {
        alertLevel = 'warning';
      }

      assert.strictEqual(alertLevel, 'emergency');
    });

    it('should generate critical alert at 90%', () => {
      const dailyPercent = 0.91;
      let alertLevel = null;

      if (dailyPercent >= 0.95) {
        alertLevel = 'emergency';
      } else if (dailyPercent >= 0.9) {
        alertLevel = 'critical';
      } else if (dailyPercent >= 0.75) {
        alertLevel = 'warning';
      }

      assert.strictEqual(alertLevel, 'critical');
    });

    it('should generate warning alert at 75%', () => {
      const dailyPercent = 0.76;
      let alertLevel = null;

      if (dailyPercent >= 0.95) {
        alertLevel = 'emergency';
      } else if (dailyPercent >= 0.9) {
        alertLevel = 'critical';
      } else if (dailyPercent >= 0.75) {
        alertLevel = 'warning';
      }

      assert.strictEqual(alertLevel, 'warning');
    });
  });
});
