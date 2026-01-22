// Hook for fetching network graph data

import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { NetworkData } from '../types/network';

interface UseNetworkResult {
  network: NetworkData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useNetwork(format: 'd3' | 'cytoscape' | 'raw' = 'raw'): UseNetworkResult {
  const [network, setNetwork] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNetwork = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<NetworkData>(`/network?format=${format}`);
      setNetwork(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch network data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, [format]);

  return {
    network,
    loading,
    error,
    refetch: fetchNetwork,
  };
}
