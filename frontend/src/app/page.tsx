'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AudioUpload from '@/components/AudioUpload';
import SessionCard from '@/components/SessionCard';
import SearchBar from '@/components/SearchBar';
import {
  Session,
  SessionWithSimilarity,
  getSessions,
  searchSessions,
} from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchResults, setSearchResults] = useState<SessionWithSimilarity[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Poll for session updates
  useEffect(() => {
    const hasProcessing = sessions.some((s) =>
      ['transcribing', 'summarizing', 'vectorizing'].includes(s.status)
    );

    if (!hasProcessing) return;

    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, [sessions, fetchSessions]);

  const handleUploadSuccess = (sessionId: string) => {
    router.push(`/sessions/${sessionId}`);
  };

  const handleSearch = async (query: string) => {
    setSearching(true);
    try {
      const results = await searchSessions(query);
      setSearchResults(results);
    } catch {
      setError('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Therapy Session Processor
          </h1>
          <p className="mt-2 text-gray-600">
            Upload audio recordings to transcribe, summarize, and search therapy
            sessions
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Upload New Session
          </h2>
          <AudioUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Semantic Search
          </h2>
          <SearchBar onSearch={handleSearch} isSearching={searching} />
          {searchResults !== null && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Found {searchResults.length} matching sessions
              </span>
              <button
                onClick={clearSearch}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Sessions List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {searchResults ? 'Search Results' : 'Recent Sessions'}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : searchResults ? (
            searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((session) => (
                  <div key={session.id} className="relative">
                    <SessionCard session={session} />
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {(session.similarity * 100).toFixed(0)}% match
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">
                No matching sessions found. Try a different search query.
              </p>
            )
          ) : sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              No sessions yet. Upload an audio file to get started.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
