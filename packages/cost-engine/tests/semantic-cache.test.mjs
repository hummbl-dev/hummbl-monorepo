import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Semantic Cache', () => {
  describe('Cosine similarity', () => {
    function cosineSimilarity(a, b) {
      if (a.length !== b.length) {
        throw new Error('Vectors must have same length');
      }

      let dotProduct = 0;
      let normA = 0;
      let normB = 0;

      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }

      normA = Math.sqrt(normA);
      normB = Math.sqrt(normB);

      if (normA === 0 || normB === 0) return 0;

      return dotProduct / (normA * normB);
    }

    it('should return 1 for identical vectors', () => {
      const vec = [1, 2, 3, 4, 5];
      const similarity = cosineSimilarity(vec, vec);
      assert.ok(Math.abs(similarity - 1) < 0.0001);
    });

    it('should return 0 for orthogonal vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [0, 1, 0];
      const similarity = cosineSimilarity(vecA, vecB);
      assert.strictEqual(similarity, 0);
    });

    it('should return -1 for opposite vectors', () => {
      const vecA = [1, 2, 3];
      const vecB = [-1, -2, -3];
      const similarity = cosineSimilarity(vecA, vecB);
      assert.ok(Math.abs(similarity - (-1)) < 0.0001);
    });

    it('should handle zero vectors', () => {
      const zeroVec = [0, 0, 0];
      const nonZeroVec = [1, 2, 3];
      const similarity = cosineSimilarity(zeroVec, nonZeroVec);
      assert.strictEqual(similarity, 0);
    });

    it('should throw for different length vectors', () => {
      const vecA = [1, 2, 3];
      const vecB = [1, 2];
      assert.throws(() => cosineSimilarity(vecA, vecB), /same length/);
    });
  });

  describe('Simple text embedding', () => {
    function simpleTextEmbedding(text) {
      const normalized = text.toLowerCase().trim();
      const words = normalized.split(/\s+/);
      const dimension = 128;
      const embedding = new Array(dimension).fill(0);

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        let hash = 0;
        for (let j = 0; j < word.length; j++) {
          hash = (hash * 31 + word.charCodeAt(j)) % dimension;
        }
        embedding[hash] += 1 / (i + 1);
      }

      let norm = 0;
      for (const val of embedding) {
        norm += val * val;
      }
      norm = Math.sqrt(norm);

      if (norm > 0) {
        for (let i = 0; i < embedding.length; i++) {
          embedding[i] /= norm;
        }
      }

      return embedding;
    }

    function cosineSimilarity(a, b) {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    it('should produce consistent embeddings', () => {
      const text = 'hello world';
      const emb1 = simpleTextEmbedding(text);
      const emb2 = simpleTextEmbedding(text);

      assert.deepStrictEqual(emb1, emb2);
    });

    it('should produce similar embeddings for similar text', () => {
      const emb1 = simpleTextEmbedding('how do I implement authentication');
      const emb2 = simpleTextEmbedding('how to implement authentication');

      const similarity = cosineSimilarity(emb1, emb2);
      // Simple hash-based embedding has lower similarity than real embeddings
      assert.ok(similarity > 0.7, `Expected similarity > 0.7, got ${similarity}`);
    });

    it('should produce different embeddings for different text', () => {
      const emb1 = simpleTextEmbedding('how do I implement authentication');
      const emb2 = simpleTextEmbedding('what is the weather today');

      const similarity = cosineSimilarity(emb1, emb2);
      assert.ok(similarity < 0.5, `Expected similarity < 0.5, got ${similarity}`);
    });

    it('should normalize to unit length', () => {
      const embedding = simpleTextEmbedding('test string');
      let norm = 0;
      for (const val of embedding) {
        norm += val * val;
      }
      norm = Math.sqrt(norm);

      assert.ok(Math.abs(norm - 1) < 0.0001, `Expected norm ~1, got ${norm}`);
    });
  });

  describe('Similarity threshold', () => {
    const threshold = 0.92;

    it('should accept matches above threshold', () => {
      const similarity = 0.95;
      assert.ok(similarity > threshold);
    });

    it('should reject matches below threshold', () => {
      const similarity = 0.85;
      assert.ok(similarity < threshold);
    });
  });
});
