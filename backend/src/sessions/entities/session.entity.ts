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
