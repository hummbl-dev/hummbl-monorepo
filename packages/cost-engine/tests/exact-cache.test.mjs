import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createHash } from 'node:crypto';

describe('Exact Cache', () => {
  describe('generateCacheKey', () => {
    function generateCacheKey(prompt, model) {
      const hash = createHash('sha256');
      hash.update(`${model}:${prompt}`);
      return hash.digest('hex');
    }

    it('should generate consistent hashes for same input', () => {
      const key1 = generateCacheKey('test prompt', 'claude-sonnet-4');
      const key2 = generateCacheKey('test prompt', 'claude-sonnet-4');

      assert.strictEqual(key1, key2);
    });

    it('should generate different hashes for different inputs', () => {
      const key1 = generateCacheKey('test prompt 1', 'claude-sonnet-4');
      const key2 = generateCacheKey('test prompt 2', 'claude-sonnet-4');

      assert.notStrictEqual(key1, key2);
    });

    it('should differentiate by model', () => {
      const key1 = generateCacheKey('test prompt', 'claude-sonnet-4');
      const key2 = generateCacheKey('test prompt', 'claude-haiku-3-5');

      assert.notStrictEqual(key1, key2);
    });
  });

  describe('Cache operations', () => {
    it('should store and retrieve entries', () => {
      const entries = new Map();

      const entry = {
        type: 'exact',
        key: 'test-key',
        hash: 'test-hash',
        response: { content: 'test', model: 'claude-sonnet-4', tokenUsage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 } },
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000,
        hitCount: 0,
        lastAccessedAt: Date.now(),
      };

      entries.set(entry.key, entry);
      const retrieved = entries.get('test-key');

      assert.strictEqual(retrieved.response.content, 'test');
    });

    it('should return undefined for missing entries', () => {
      const entries = new Map();
      const retrieved = entries.get('missing-key');

      assert.strictEqual(retrieved, undefined);
    });

    it('should delete entries', () => {
      const entries = new Map();
      entries.set('key', { value: 'test' });

      assert.strictEqual(entries.delete('key'), true);
      assert.strictEqual(entries.has('key'), false);
    });
  });

  describe('Cache bypass', () => {
    function shouldBypassCache(prompt, taskType, headers, bypassConditions) {
      for (const condition of bypassConditions) {
        if (condition.type === 'task_type' && taskType === condition.value) {
          return true;
        }
        if (condition.type === 'header' && headers?.[condition.value]) {
          return true;
        }
        if (condition.type === 'prompt_pattern') {
          const regex = new RegExp(condition.value, 'i');
          if (regex.test(prompt)) return true;
        }
      }
      return false;
    }

    it('should bypass for streaming task type', () => {
      const bypass = shouldBypassCache(
        'test',
        'streaming',
        {},
        [{ type: 'task_type', value: 'streaming' }]
      );

      assert.strictEqual(bypass, true);
    });

    it('should bypass for no-cache header', () => {
      const bypass = shouldBypassCache(
        'test',
        undefined,
        { 'x-no-cache': 'true' },
        [{ type: 'header', value: 'x-no-cache' }]
      );

      assert.strictEqual(bypass, true);
    });

    it('should bypass for pattern match', () => {
      const bypass = shouldBypassCache(
        'current weather forecast',
        undefined,
        {},
        [{ type: 'prompt_pattern', value: '^current' }]
      );

      assert.strictEqual(bypass, true);
    });

    it('should not bypass when no conditions match', () => {
      const bypass = shouldBypassCache(
        'explain how authentication works',
        'chat',
        {},
        [
          { type: 'task_type', value: 'streaming' },
          { type: 'header', value: 'x-no-cache' },
        ]
      );

      assert.strictEqual(bypass, false);
    });
  });
});
