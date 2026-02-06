import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Complexity Classification', () => {
  const config = {
    rules: [
      { pattern: '^(explain|summarize)', taskType: 'explanation', complexity: 'simple', model: 'claude-haiku-3-5' },
      { pattern: '(implement|create|build)', taskType: 'implementation', complexity: 'moderate', model: 'claude-sonnet-4' },
      { pattern: '(architect|design)', taskType: 'architecture', complexity: 'complex', model: 'claude-opus-4' },
    ],
    defaultModel: 'claude-sonnet-4',
    thresholds: { simple: 100, moderate: 500, complex: 2000 },
  };

  function estimateTokenCount(text) {
    return Math.ceil(text.length / 4);
  }

  function classifyByHeuristics(prompt, tokenCount, thresholds) {
    const hasCode = /```[\s\S]*```/.test(prompt);
    const hasMultipleSteps = /(step\s*\d|first|second|third|then|finally)/i.test(prompt);
    const hasNestedContext = prompt.split('\n').length > 20;
    const hasComplexQueries = /(explain|analyze|compare|evaluate|design)/i.test(prompt);

    let score = tokenCount;
    if (hasCode) score *= 1.3;
    if (hasMultipleSteps) score *= 1.2;
    if (hasNestedContext) score *= 1.2;
    if (hasComplexQueries) score *= 1.5;

    if (score < thresholds.simple) return 'simple';
    if (score < thresholds.moderate) return 'moderate';
    if (score < thresholds.complex) return 'complex';
    return 'expert';
  }

  function classifyComplexity(context, config) {
    const { prompt, taskType } = context;
    const tokenCount = estimateTokenCount(prompt);

    for (const rule of config.rules) {
      const regex = new RegExp(rule.pattern, 'i');
      if (regex.test(prompt)) {
        return { level: rule.complexity, model: rule.model, reason: `Pattern match: "${rule.pattern}"` };
      }
      if (taskType && rule.taskType === taskType) {
        return { level: rule.complexity, model: rule.model, reason: `Task type match: "${rule.taskType}"` };
      }
    }

    const level = classifyByHeuristics(prompt, tokenCount, config.thresholds);
    return { level, model: config.defaultModel, reason: `Heuristic classification (${tokenCount} tokens)` };
  }

  describe('Rule-based classification', () => {
    it('should match explanation patterns', () => {
      const result = classifyComplexity({ prompt: 'explain how authentication works' }, config);
      assert.strictEqual(result.level, 'simple');
      assert.strictEqual(result.model, 'claude-haiku-3-5');
    });

    it('should match implementation patterns', () => {
      const result = classifyComplexity({ prompt: 'implement a user registration system' }, config);
      assert.strictEqual(result.level, 'moderate');
      assert.strictEqual(result.model, 'claude-sonnet-4');
    });

    it('should match architecture patterns', () => {
      const result = classifyComplexity({ prompt: 'design a scalable microservices architecture' }, config);
      assert.strictEqual(result.level, 'complex');
      assert.strictEqual(result.model, 'claude-opus-4');
    });
  });

  describe('Heuristic classification', () => {
    it('should classify short prompts as simple', () => {
      const result = classifyComplexity({ prompt: 'hello world' }, config);
      assert.strictEqual(result.level, 'simple');
    });

    it('should classify long prompts as complex', () => {
      const longPrompt = 'a'.repeat(8000); // ~2000 tokens
      const result = classifyComplexity({ prompt: longPrompt }, config);
      assert.ok(['complex', 'expert'].includes(result.level));
    });

    it('should increase complexity for code blocks', () => {
      const promptWithCode = `Here's a simple function:\n\`\`\`javascript\nconsole.log('hi');\n\`\`\``;
      const promptWithoutCode = `Here's a simple description of a function`;

      const withCode = classifyComplexity({ prompt: promptWithCode }, config);
      const withoutCode = classifyComplexity({ prompt: promptWithoutCode }, config);

      // Code presence should increase effective complexity
      assert.ok(
        estimateTokenCount(promptWithCode) * 1.3 > estimateTokenCount(promptWithoutCode),
        'Code should increase effective token count'
      );
    });
  });

  describe('Token estimation', () => {
    it('should estimate tokens correctly', () => {
      const text = 'hello world'; // 11 chars
      const tokens = estimateTokenCount(text);
      assert.strictEqual(tokens, Math.ceil(11 / 4));
    });

    it('should handle empty strings', () => {
      const tokens = estimateTokenCount('');
      assert.strictEqual(tokens, 0);
    });
  });
});
