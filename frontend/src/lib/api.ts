const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface TranscriptSegment {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

export type SessionStatus =
  | 'uploaded'
  | 'transcribing'
  | 'summarizing'
  | 'vectorizing'
  | 'completed'
  | 'failed';

export interface Session {
  id: string;
  created_at: string;
  updated_at: string;
  original_filename: string;
  file_size: number | null;
  duration_seconds: number | null;
  status: SessionStatus;
  error_message: string | null;
  transcript: TranscriptSegment[] | null;
  transcript_text: string | null;
  summary: string | null;
  vectorized_at: string | null;
  speaker_count: number | null;
  word_count: number | null;
}

export interface SessionWithSimilarity extends Session {
  similarity: number;
}

export interface UploadResponse {
  id: string;
  message: string;
}

export interface StatusResponse {
  id: string;
  status: SessionStatus;
  error_message: string | null;
}

export async function uploadAudio(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('audio', file);

  const response = await fetch(`${API_URL}/sessions/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

export async function getSessions(): Promise<Session[]> {
  const response = await fetch(`${API_URL}/sessions`);

  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }

  return response.json();
}

export async function getSession(id: string): Promise<Session> {
  const response = await fetch(`${API_URL}/sessions/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }

  return response.json();
}

export async function getSessionStatus(id: string): Promise<StatusResponse> {
  const response = await fetch(`${API_URL}/sessions/${id}/status`);

  if (!response.ok) {
    throw new Error('Failed to fetch session status');
  }

  return response.json();
}

export async function searchSessions(
  query: string,
  limit: number = 10
): Promise<SessionWithSimilarity[]> {
  const response = await fetch(`${API_URL}/sessions/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, limit }),
  });

  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getStatusLabel(status: SessionStatus): string {
  const labels: Record<SessionStatus, string> = {
    uploaded: 'Uploaded',
    transcribing: 'Transcribing...',
    summarizing: 'Summarizing...',
    vectorizing: 'Vectorizing...',
    completed: 'Completed',
    failed: 'Failed',
  };
  return labels[status];
}

export function getStatusColor(status: SessionStatus): string {
  const colors: Record<SessionStatus, string> = {
    uploaded: 'bg-gray-500',
    transcribing: 'bg-blue-500',
    summarizing: 'bg-yellow-500',
    vectorizing: 'bg-purple-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  };
  return colors[status];
}
