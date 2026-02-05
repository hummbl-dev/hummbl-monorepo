// Hook for fetching all narratives

import { useState, useEffect } from 'react';
import { loadNarratives } from '../utils/dataLoader';
import type { Narrative } from '@cascade/types/narrative';

export function useNarratives() {
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNarratives = async () => {
    try {
      setLoading(true);
      const data = await loadNarratives();
      setNarratives(data.narratives || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load narratives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNarratives();
  }, []);

  return {
    narratives,
    loading,
    error,
    refetch: fetchNarratives,
  };
}
