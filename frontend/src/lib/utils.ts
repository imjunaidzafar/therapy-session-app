import { SessionStatus } from '@/types';
import { SESSION_STATUS_LABELS, SESSION_STATUS_COLORS } from '@/constants';

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
  return SESSION_STATUS_LABELS[status] || status;
}

export function getStatusColor(status: SessionStatus): string {
  return SESSION_STATUS_COLORS[status] || 'bg-gray-500';
}

export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function isProcessing(status: SessionStatus): boolean {
  return ['transcribing', 'summarizing', 'vectorizing'].includes(status);
}
