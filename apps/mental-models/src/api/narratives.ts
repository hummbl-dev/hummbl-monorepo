// Narrative API endpoints

import { apiClient } from './client';
import type { Narrative, NarrativesResponse } from '@cascade/types/narrative';

export const narrativesAPI = {
  /**
   * Get all narratives
   */
  getAll: async (): Promise<NarrativesResponse> => {
    return apiClient.get<NarrativesResponse>('/narratives');
  },

  /**
   * Get single narrative by ID
   */
  getById: async (id: string): Promise<Narrative> => {
    return apiClient.get<Narrative>(`/narratives/${id}`);
  },

  /**
   * Search narratives by criteria
   */
  search: async (query: {
    category?: string;
    evidence_quality?: 'A' | 'B' | 'C';
    min_confidence?: number;
    tags?: string[];
  }): Promise<Narrative[]> => {
    const params = new URLSearchParams();
    if (query.category) params.append('category', query.category);
    if (query.evidence_quality) params.append('evidence_quality', query.evidence_quality);
    if (query.min_confidence) params.append('min_confidence', query.min_confidence.toString());
    if (query.tags) query.tags.forEach((tag) => params.append('tags', tag));

    return apiClient.get<Narrative[]>(`/narratives/search?${params.toString()}`);
  },
};
