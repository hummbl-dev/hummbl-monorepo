import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Priority Classification', () => {
  const config = {
    rules: [
      { pattern: '(production|critical|urgent)', tier: 'critical' },
      { pattern: '(user-facing|customer)', source: 'api', tier: 'high' },
      { pattern: '(internal|development)', tier: 'normal' },
      { pattern: '(background|scheduled)', tier: 'low' },
      { pattern: '(batch|bulk)', tier: 'batch' },
    ],
    defaultTier: 'normal',
  };

  function checkRule(rule, prompt, taskType, source) {
    const regex = new RegExp(rule.pattern, 'i');
    if (!regex.test(prompt)) return false;
    if (rule.taskType && rule.taskType !== taskType) return false;
    if (rule.source && rule.source !== source) return false;
    return true;
  }

  function assignPriority(context, config) {
    const { prompt, taskType, source, priority } = context;

    if (priority) {
      return { tier: priority, reason: 'Explicitly set in request context' };
    }

    for (const rule of config.rules) {
      if (checkRule(rule, prompt, taskType, source)) {
        return { tier: rule.tier, matchedRule: rule, reason: `Rule match: "${rule.pattern}"` };
      }
    }

    return { tier: config.defaultTier, reason: 'Default tier (no rules matched)' };
  }

  describe('Rule matching', () => {
    it('should match critical patterns', () => {
      const result = assignPriority({ prompt: 'critical production issue' }, config);
      assert.strictEqual(result.tier, 'critical');
    });

    it('should match high priority with source', () => {
      const result = assignPriority({ prompt: 'user-facing request', source: 'api' }, config);
      assert.strictEqual(result.tier, 'high');
    });

    it('should not match high priority without correct source', () => {
      // This falls through since source doesn't match, then matches 'internal' pattern
      const result = assignPriority({ prompt: 'user-facing internal request', source: 'internal' }, config);
      assert.strictEqual(result.tier, 'normal');
    });

    it('should match batch patterns', () => {
      const result = assignPriority({ prompt: 'batch processing job' }, config);
      assert.strictEqual(result.tier, 'batch');
    });
  });

  describe('Explicit priority', () => {
    it('should use explicitly set priority', () => {
      const result = assignPriority({ prompt: 'some request', priority: 'critical' }, config);
      assert.strictEqual(result.tier, 'critical');
      assert.strictEqual(result.reason, 'Explicitly set in request context');
    });
  });

  describe('Default tier', () => {
    it('should use default tier when no rules match', () => {
      const result = assignPriority({ prompt: 'unmatched request xyz' }, config);
      assert.strictEqual(result.tier, 'normal');
    });
  });

  describe('Tier weights', () => {
    function getTierWeight(tier) {
      const weights = {
        critical: 100,
        high: 75,
        normal: 50,
        low: 25,
        batch: 0,
      };
      return weights[tier];
    }

    it('should rank critical highest', () => {
      assert.ok(getTierWeight('critical') > getTierWeight('high'));
      assert.ok(getTierWeight('high') > getTierWeight('normal'));
      assert.ok(getTierWeight('normal') > getTierWeight('low'));
      assert.ok(getTierWeight('low') > getTierWeight('batch'));
    });
  });
});
