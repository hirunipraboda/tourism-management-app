import { useState, useEffect, useCallback } from 'react';
import { getDestinations, createDestination, deleteDestination } from '../api/destinationApi';
import type { Destination, CreateDestinationInput } from '../api/destinationApi';
export function useDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDestinations();
      setDestinations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDestination = async (input: CreateDestinationInput) => {
    await createDestination(input);
    await refresh();
  };

  const removeDestination = async (id: string) => {
    await deleteDestination(id);
    await refresh();
  };

  return { destinations, loading, error, refresh, addDestination, removeDestination };
}
