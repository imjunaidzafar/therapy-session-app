export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const POLLING_INTERVAL = 3000; // 3 seconds

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const ACCEPTED_AUDIO_TYPES = {
  'audio/*': ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac'],
};

export const SESSION_STATUS_LABELS: Record<string, string> = {
  uploaded: 'Uploaded',
  transcribing: 'Transcribing...',
  summarizing: 'Summarizing...',
  vectorizing: 'Vectorizing...',
  completed: 'Completed',
  failed: 'Failed',
};

export const SESSION_STATUS_COLORS: Record<string, string> = {
  uploaded: 'bg-gray-500',
  transcribing: 'bg-blue-500',
  summarizing: 'bg-yellow-500',
  vectorizing: 'bg-purple-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};
