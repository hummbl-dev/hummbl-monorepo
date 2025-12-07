import { useAuth } from './useAuth';
import { useCallback } from 'react';

const API_BASE = 'https://hummbl-workers.hummbl.workers.dev';

export interface ProgressEntry {
  model_id: string;
  completed_at: string;
}

export const useProgress = () => {
  const { token } = useAuth();

  const getProgress = useCallback(async (): Promise<string[]> => {
    if (!token) return [];

    try {
      const response = await fetch(`${API_BASE}/v1/user/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to get progress');

      const data = await response.json();
      return data.progress.map((entry: ProgressEntry) => entry.model_id);
    } catch (error) {
      console.error('Get progress error:', error);
      return [];
    }
  }, [token]);

  const addProgress = useCallback(
    async (modelId: string): Promise<boolean> => {
      if (!token) return false;

      try {
        const response = await fetch(`${API_BASE}/v1/user/progress`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model_id: modelId }),
        });

        return response.ok;
      } catch (error) {
        console.error('Add progress error:', error);
        return false;
      }
    },
    [token]
  );

  const removeProgress = useCallback(
    async (modelId: string): Promise<boolean> => {
      if (!token) return false;

      try {
        const response = await fetch(`${API_BASE}/v1/user/progress/${modelId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return response.ok;
      } catch (error) {
        console.error('Remove progress error:', error);
        return false;
      }
    },
    [token]
  );

  return {
    getProgress,
    addProgress,
    removeProgress,
  };
};
