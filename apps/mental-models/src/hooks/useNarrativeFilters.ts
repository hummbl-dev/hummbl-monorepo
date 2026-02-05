// Hook for filtering and sorting narratives

import { useMemo } from 'react';
import type { Narrative } from '@cascade/types/narrative';

export interface FilterOptions {
  searchTerm: string;
  category: string | null;
  evidenceGrade: string | null;
  complexityLevel: string | null;
  sortBy: 'title' | 'confidence' | 'citations' | 'default';
  sortDirection: 'asc' | 'desc';
}

export function useNarrativeFilters(narratives: Narrative[], filters: FilterOptions) {
  const filteredAndSorted = useMemo(() => {
    let result = [...narratives];

    // Apply search filter
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter((narrative) => {
        const searchableText = [
          narrative.title,
          narrative.summary,
          narrative.category,
          ...(narrative.tags || []),
          ...(narrative.domain || []),
        ]
          .join(' ')
          .toLowerCase();

        return searchableText.includes(searchLower);
      });
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter((n) => n.category === filters.category);
    }

    // Apply evidence grade filter
    if (filters.evidenceGrade) {
      result = result.filter((n) => n.evidence_quality === filters.evidenceGrade);
    }

    // Apply complexity level filter
    if (filters.complexityLevel) {
      result = result.filter((n) => n.complexity?.cognitive_load === filters.complexityLevel);
    }

    // Apply sorting
    if (filters.sortBy !== 'default') {
      result.sort((a, b) => {
        let compareValue = 0;

        switch (filters.sortBy) {
          case 'title':
            compareValue = a.title.localeCompare(b.title);
            break;
          case 'confidence':
            compareValue = (b.confidence || 0) - (a.confidence || 0);
            break;
          case 'citations':
            compareValue = (b.citations?.length || 0) - (a.citations?.length || 0);
            break;
        }

        return filters.sortDirection === 'asc' ? compareValue : -compareValue;
      });
    }

    return result;
  }, [narratives, filters]);

  return {
    filteredNarratives: filteredAndSorted,
    resultCount: filteredAndSorted.length,
    totalCount: narratives.length,
  };
}
