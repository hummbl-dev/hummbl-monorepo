// Semantic search using vector embeddings and cosine similarity

export interface EmbeddingConfig {
  provider: 'openai' | 'local' | 'mock';
  apiKey?: string;
  model?: string;
  dimensions?: number;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface EmbeddingCache {
  [key: string]: number[];
}

const CACHE_KEY = 'hummbl_embeddings_cache';
const BATCH_SIZE = 50;

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);

  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Euclidean distance between two vectors
 */
export function euclideanDistance(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same dimensions');
  }

  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Normalize vector to unit length
 */
export function normalizeVector(vec: number[]): number[] {
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));

  if (magnitude === 0) return vec;

  return vec.map((val) => val / magnitude);
}

/**
 * Semantic Search Engine
 */
export class SemanticSearch {
  private config: EmbeddingConfig;
  private cache: EmbeddingCache;

  constructor(config: EmbeddingConfig) {
    this.config = {
      provider: config.provider || 'mock',
      model: config.model || 'text-embedding-3-small',
      dimensions: config.dimensions || 384,
      ...config,
    };

    this.cache = this.loadCache();
  }

  /**
   * Load embedding cache from localStorage
   */
  private loadCache(): EmbeddingCache {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load embedding cache:', error);
    }
    return {};
  }

  /**
   * Save embedding cache to localStorage
   */
  private saveCache(): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.warn('Failed to save embedding cache:', error);
    }
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const cacheKey = `${this.config.provider}:${text.substring(0, 100)}`;

    // Check cache first
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    let embedding: number[];

    switch (this.config.provider) {
      case 'openai':
        embedding = await this.generateOpenAIEmbedding(text);
        break;

      case 'local':
        embedding = await this.generateLocalEmbedding(text);
        break;

      case 'mock':
      default:
        embedding = this.generateMockEmbedding(text);
        break;
    }

    // Cache the result
    this.cache[cacheKey] = embedding;
    this.saveCache();

    return embedding;
  }

  /**
   * Generate embedding using OpenAI API
   */
  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key required');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: this.config.model,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Generate embedding using local model
   * (Placeholder - would use transformers.js or similar)
   */
  private async generateLocalEmbedding(text: string): Promise<number[]> {
    // TODO: Implement local embedding using transformers.js
    // For now, fallback to mock
    console.warn('Local embeddings not yet implemented, using mock');
    return this.generateMockEmbedding(text);
  }

  /**
   * Generate mock embedding (for testing/demo)
   */
  private generateMockEmbedding(text: string): number[] {
    const dimensions = this.config.dimensions || 384;
    const embedding: number[] = [];

    // Simple hash-based mock embedding
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash = hash & hash;
    }

    // Generate deterministic vector from hash
    const rng = this.seededRandom(hash);

    for (let i = 0; i < dimensions; i++) {
      embedding.push((rng() - 0.5) * 2);
    }

    return normalizeVector(embedding);
  }

  /**
   * Seeded random number generator for mock embeddings
   */
  private seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    };
  }

  /**
   * Search for similar items using vector similarity
   */
  async search(
    query: string,
    corpus: Array<{ id: string; content: string; metadata?: Record<string, unknown> }>,
    limit = 10,
    threshold = 0.5
  ): Promise<VectorSearchResult[]> {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Generate embeddings for corpus items (with caching)
    const results: VectorSearchResult[] = [];

    for (const item of corpus) {
      const itemEmbedding = await this.generateEmbedding(item.content);
      const score = cosineSimilarity(queryEmbedding, itemEmbedding);

      if (score >= threshold) {
        results.push({
          id: item.id,
          score,
          content: item.content,
          metadata: item.metadata,
        });
      }
    }

    // Sort by score descending and limit
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Find similar items to a given item
   */
  async findSimilar(
    itemId: string,
    itemContent: string,
    corpus: Array<{ id: string; content: string; metadata?: Record<string, unknown> }>,
    limit = 5
  ): Promise<VectorSearchResult[]> {
    const itemEmbedding = await this.generateEmbedding(itemContent);
    const results: VectorSearchResult[] = [];

    for (const item of corpus) {
      // Skip the item itself
      if (item.id === itemId) continue;

      const otherEmbedding = await this.generateEmbedding(item.content);
      const score = cosineSimilarity(itemEmbedding, otherEmbedding);

      results.push({
        id: item.id,
        score,
        content: item.content,
        metadata: item.metadata,
      });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Batch generate embeddings
   */
  async batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    // Process in batches
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const batchEmbeddings = await Promise.all(batch.map((text) => this.generateEmbedding(text)));
      embeddings.push(...batchEmbeddings);
    }

    return embeddings;
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.cache = {};
    localStorage.removeItem(CACHE_KEY);
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return Object.keys(this.cache).length;
  }

  /**
   * Export cache for backup
   */
  exportCache(): string {
    return JSON.stringify(this.cache, null, 2);
  }

  /**
   * Import cache from backup
   */
  importCache(json: string): void {
    try {
      this.cache = JSON.parse(json);
      this.saveCache();
    } catch (error) {
      console.error('Failed to import cache:', error);
    }
  }
}

/**
 * Singleton instance
 */
let searchInstance: SemanticSearch | null = null;

export function getSemanticSearch(config?: EmbeddingConfig): SemanticSearch {
  if (!searchInstance) {
    searchInstance = new SemanticSearch(config || { provider: 'mock' });
  }
  return searchInstance;
}

export function resetSemanticSearch(): void {
  searchInstance = null;
}
