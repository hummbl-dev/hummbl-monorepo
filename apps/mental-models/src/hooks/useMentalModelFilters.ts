import { useState, useMemo } from 'react';
import type { MentalModel } from '@cascade/types/mental-model';
import type { FilterOptions } from '../components/mental-models/MentalModelsFilters';

export function useMentalModelFilters(models: MentalModel[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    category: null,
    transformation: null,
    sortBy: 'name-asc',
  });

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    models.forEach((model) => {
      if (model.category) cats.add(model.category);
    });
    return Array.from(cats).sort();
  }, [models]);

  // Get unique transformations
  const transformations = useMemo(() => {
    const trans = new Set<string>();
    models.forEach((model) => {
      model.transformations?.forEach((t) => trans.add(t));
    });
    return Array.from(trans).sort();
  }, [models]);

  // Filter and sort models
  const filteredModels = useMemo(() => {
    let result = [...models];

    // Apply search filter (minimum 2 characters for better accuracy)
    if (filters.searchTerm && filters.searchTerm.length >= 2) {
      const searchLower = filters.searchTerm.toLowerCase();
      const searchWords = searchLower.split(/\s+/).filter((w) => w.length > 0);

      result = result
        .map((model) => {
          let score = 0;
          const nameLower = model.name.toLowerCase();
          const descLower = model.description?.toLowerCase() || '';
          const codeLower = model.code?.toLowerCase() || '';

          // Exact name match (highest priority)
          if (nameLower === searchLower) {
            score += 1000;
          }
          // Name starts with search term
          else if (nameLower.startsWith(searchLower)) {
            score += 500;
          }
          // Name contains search at word boundary
          else if (
            new RegExp(`\\b${searchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(nameLower)
          ) {
            score += 300;
          }
          // Name contains search anywhere
          else if (nameLower.includes(searchLower)) {
            score += 100;
          }

          // Code exact match
          if (codeLower === searchLower) {
            score += 400;
          } else if (codeLower.includes(searchLower)) {
            score += 50;
          }

          // Check if all search words match
          const allWordsMatch = searchWords.every(
            (word) =>
              nameLower.includes(word) ||
              descLower.includes(word) ||
              model.tags?.some((tag) => tag.toLowerCase().includes(word))
          );

          if (allWordsMatch) {
            score += 200;
          }

          // Description contains search
          if (descLower.includes(searchLower)) {
            score += 50;
          }

          // Tags contain search
          if (model.tags?.some((tag) => tag.toLowerCase().includes(searchLower))) {
            score += 75;
          }

          return { model, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ model }) => model);
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter((model) => model.category === filters.category);
    }

    // Apply transformation filter
    if (filters.transformation) {
      result = result.filter((model) =>
        model.transformations?.includes(filters.transformation as any)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'difficulty-asc':
          return (a.meta?.difficulty || 0) - (b.meta?.difficulty || 0);
        case 'difficulty-desc':
          return (b.meta?.difficulty || 0) - (a.meta?.difficulty || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [models, filters]);

  return {
    filters,
    setFilters,
    filteredModels,
    categories,
    transformations,
    resultCount: filteredModels.length,
    totalCount: models.length,
  };
}
