'use client';

import { useState, useEffect, useCallback } from 'react';
import { Session } from '@/types';
import { sessionService } from '@/services';
import { POLLING_INTERVAL } from '@/constants';

interface UseSessionResult {
  session: Session | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSession(id: string): UseSessionResult {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      const data = await sessionService.getById(id);
      setSession(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Poll for updates while processing
  useEffect(() => {
    if (!session) return;
    if (['completed', 'failed'].includes(session.status)) return;

    const interval = setInterval(fetchSession, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [session, fetchSession]);

  return { session, loading, error, refetch: fetchSession };
}
