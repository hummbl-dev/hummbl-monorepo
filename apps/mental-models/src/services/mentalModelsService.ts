import React from 'react';
import type { MentalModel } from '@cascade/types/mental-model';
import { validateMentalModel } from '../utils/validation';

// Types
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  schemaVersion: number;
};

type MentalModelsResponse = {
  version: string;
  lastUpdated: string;
  models: MentalModel[];
};

// Constants
const CACHE_KEY = 'hummbl:mental-models:cache';
// Bump this number to invalidate all existing caches in the field
const CACHE_SCHEMA_VERSION = 2;
// Keep TTL but allow schema to force-refresh regardless of TTL
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const DATA_URL = '/models.json';

/**
 * Fetches mental models from the server
 */
export async function fetchMentalModels(): Promise<MentalModel[]> {
  try {
    // Try to get from cache first
    const cached = getFromCache<MentalModelsResponse>();
    if (cached) {
      return cached.models;
    }

    // Fetch from network
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch mental models: ${response.statusText}`);
    }

    const data: any = await response.json();

    // Check if this is the old models.json format (has 'definition' field)
    // or the new format (has 'description' and proper structure)
    const needsTransformation =
      data.models.length > 0 && data.models[0].definition && !data.models[0].description;

    let finalData: MentalModelsResponse;

    if (needsTransformation) {
      // Transform old models.json format to expected format
      finalData = {
        version: data.version,
        lastUpdated: data.lastUpdated,
        models: data.models.map((model: any) => ({
          id: model.code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: model.name,
          code: model.code,
          description: model.definition,
          example: model.example,
          category: getCategoryFromTransformation(model.transformation),
          tags: [model.transformation?.toLowerCase() || 'general'],
          transformations: [model.transformation],
          sources: [],
          meta: {
            isCore: true,
            difficulty: 3,
          },
        })),
      };
    } else {
      // Data is already in correct format
      finalData = data as MentalModelsResponse;
    }

    // Validate the response
    if (!isValidMentalModelsResponse(finalData)) {
      throw new Error('Invalid mental models data format');
    }

    // Cache the response
    saveToCache(finalData);

    return finalData.models;
  } catch (error) {
    console.error('Error fetching mental models:', error);
    throw error;
  }
}

/**
 * React hook for using mental models
 */
export function useMentalModels() {
  const [models, setModels] = React.useState<MentalModel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await fetchMentalModels();
        if (isMounted) {
          setModels(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load mental models'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { models, isLoading, error };
}

// Transformation helpers
function getCategoryFromTransformation(transformation: string): string {
  const categoryMap: Record<string, string> = {
    P: 'Perspective & Identity',
    IN: 'Inversion & Reversal',
    CO: 'Composition & Integration',
    DE: 'Decomposition & Analysis',
    RE: 'Recursion & Self-Reference',
    SY: 'Meta-Systems & Emergence',
  };
  return categoryMap[transformation] || 'General';
}

// Cache helpers
function getFromCache<T>(): T | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as Partial<CacheEntry<T>> & { data?: T };
    const data = parsed.data as T;
    const timestamp = parsed.timestamp as number;
    const schemaVersion = parsed.schemaVersion as number | undefined;

    // Invalidate only if schemaVersion exists and mismatches; allow older entries without schemaVersion
    if (schemaVersion !== undefined && schemaVersion !== CACHE_SCHEMA_VERSION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Check if cache is still valid
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Failed to read from cache:', error);
    return null;
  }
}

function saveToCache<T>(data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      schemaVersion: CACHE_SCHEMA_VERSION,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
}

/**
 * Clears the mental models cache explicitly (used by settings or manual refresh)
 */
export function clearMentalModelsCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // no-op
  }
}

// Validation
function isValidMentalModelsResponse(data: unknown): data is MentalModelsResponse {
  if (!data || typeof data !== 'object') return false;

  const response = data as Partial<MentalModelsResponse>;

  if (!response.version || !response.lastUpdated || !Array.isArray(response.models)) {
    return false;
  }

  // Validate each model in the response
  return response.models.every(validateMentalModel);
}

// Export types for testing
export type { MentalModelsResponse, CacheEntry };
