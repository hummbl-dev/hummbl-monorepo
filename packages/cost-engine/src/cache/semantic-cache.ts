/**
 * Semantic Cache
 *
 * Similarity-based cache for semantically equivalent prompts.
 * Uses cosine similarity between prompt embeddings.
 */

import type {
  Cache,
  CacheEntry,
  SemanticCacheEntry,
  CachedResponse,
  CacheStats,
  CachePolicyConfig,
} from '../types.js';

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
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

/**
 * Simple text-based embedding (placeholder for real embedding model)
 * In production, this would call an embedding API
 */
export function simpleTextEmbedding(text: string): number[] {
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);
  const dimension = 128;
  const embedding = new Array(dimension).fill(0);

  // Create a simple hash-based embedding
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash * 31 + word.charCodeAt(j)) % dimension;
    }
    embedding[hash] += 1 / (i + 1); // Weight by position
  }

  // Normalize the embedding
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

/**
 * Create a semantic cache
 */
export function createSemanticCache(config: CachePolicyConfig['semanticMatch']): Cache & {
  findSimilar(embedding: number[]): SemanticCacheEntry | undefined;
} {
  const entries = new Map<string, SemanticCacheEntry>();
  let hits = 0;
  let misses = 0;

  /**
   * Check if entry is expired
   */
  function isExpired(entry: SemanticCacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Evict oldest entries when cache is full
   */
  function evictIfNeeded(): void {
    if (entries.size < config.maxEntries) return;

    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of entries) {
      if (entry.lastAccessedAt < oldestTime) {
        oldestTime = entry.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      entries.delete(oldestKey);
    }
  }

  /**
   * Find most similar entry above threshold
   */
  function findSimilar(queryEmbedding: number[]): SemanticCacheEntry | undefined {
    let bestMatch: SemanticCacheEntry | undefined;
    let bestSimilarity = config.similarityThreshold;

    for (const entry of entries.values()) {
      if (isExpired(entry)) {
        entries.delete(entry.key);
        continue;
      }

      if (!entry.embedding) continue;

      const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = entry;
      }
    }

    if (bestMatch) {
      bestMatch.hitCount++;
      bestMatch.lastAccessedAt = Date.now();
      bestMatch.similarity = bestSimilarity;
      hits++;
    } else {
      misses++;
    }

    return bestMatch;
  }

  return {
    get(key: string): CacheEntry | undefined {
      const entry = entries.get(key);

      if (!entry) {
        misses++;
        return undefined;
      }

      if (isExpired(entry)) {
        entries.delete(key);
        misses++;
        return undefined;
      }

      entry.hitCount++;
      entry.lastAccessedAt = Date.now();
      hits++;

      return entry;
    },

    set(key: string, entry: CacheEntry): void {
      if (entry.type !== 'semantic') {
        throw new Error('SemanticCache only accepts semantic cache entries');
      }

      evictIfNeeded();
      entries.set(key, entry as SemanticCacheEntry);
    },

    delete(key: string): boolean {
      return entries.delete(key);
    },

    clear(): void {
      entries.clear();
      hits = 0;
      misses = 0;
    },

    getStats(): CacheStats {
      let memoryEstimate = 0;
      for (const entry of entries.values()) {
        memoryEstimate += entry.key.length * 2;
        memoryEstimate += entry.response.content.length * 2;
        memoryEstimate += (entry.embedding?.length ?? 0) * 8; // Float64
        memoryEstimate += 200;
      }

      return {
        exactHits: 0,
        exactMisses: 0,
        semanticHits: hits,
        semanticMisses: misses,
        totalEntries: entries.size,
        memoryUsageBytes: memoryEstimate,
      };
    },

    prune(): number {
      const now = Date.now();
      let pruned = 0;

      for (const [key, entry] of entries) {
        if (now > entry.expiresAt) {
          entries.delete(key);
          pruned++;
        }
      }

      return pruned;
    },

    findSimilar,
  };
}

/**
 * Create a semantic cache entry
 */
export function createSemanticCacheEntry(
  prompt: string,
  response: CachedResponse,
  ttlSeconds: number
): SemanticCacheEntry {
  const now = Date.now();
  const embedding = simpleTextEmbedding(prompt);

  // Use prompt hash as key
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = ((hash << 5) - hash + prompt.charCodeAt(i)) | 0;
  }
  const key = `sem_${hash.toString(16)}`;

  return {
    type: 'semantic',
    key,
    embedding,
    response,
    createdAt: now,
    expiresAt: now + ttlSeconds * 1000,
    hitCount: 0,
    lastAccessedAt: now,
  };
}
