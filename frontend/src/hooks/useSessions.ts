'use client';

import { useState, useEffect, useCallback } from 'react';
import { Session } from '@/types';
import { sessionService } from '@/services';
import { POLLING_INTERVAL } from '@/constants';

interface UseSessionsResult {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSessions(): UseSessionsResult {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await sessionService.getAll();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Poll for updates if any session is processing
  useEffect(() => {
    const hasProcessing = sessions.some((s) =>
      ['transcribing', 'summarizing', 'vectorizing'].includes(s.status)
    );

    if (!hasProcessing) return;

    const interval = setInterval(fetchSessions, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [sessions, fetchSessions]);

  return { sessions, loading, error, refetch: fetchSessions };
}
