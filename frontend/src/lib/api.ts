// Re-export types
export type {
  Session,
  SessionStatus,
  SessionWithSimilarity,
  TranscriptSegment,
  UploadResponse,
  StatusResponse,
} from '@/types';

// Re-export service methods as functions (backward compatibility)
import { sessionService } from '@/services';

export const uploadAudio = sessionService.upload.bind(sessionService);
export const getSessions = sessionService.getAll.bind(sessionService);
export const getSession = sessionService.getById.bind(sessionService);
export const getSessionStatus = sessionService.getStatus.bind(sessionService);
export const searchSessions = sessionService.search.bind(sessionService);

// Re-export utils
export {
  formatDuration,
  formatFileSize,
  getStatusLabel,
  getStatusColor,
} from './utils';
