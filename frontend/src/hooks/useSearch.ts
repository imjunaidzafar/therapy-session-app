'use client';

import { useState, useCallback } from 'react';
import { SessionWithSimilarity } from '@/types';
import { sessionService } from '@/services';

interface UseSearchResult {
  results: SessionWithSimilarity[] | null;
  searching: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

export function useSearch(): UseSearchResult {
  const [results, setResults] = useState<SessionWithSimilarity[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    setSearching(true);
    setError(null);

    try {
      const data = await sessionService.search(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { results, searching, error, search, clearResults };
}
