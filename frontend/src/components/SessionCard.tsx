'use client';

import Link from 'next/link';
import {
  Session,
  formatDuration,
  formatFileSize,
  getStatusLabel,
  getStatusColor,
} from '@/lib/api';

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  const isProcessing = ['transcribing', 'summarizing', 'vectorizing'].includes(
    session.status
  );

  return (
    <Link href={`/sessions/${session.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {session.original_filename}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(session.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div
            className={`
              flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium
              ${session.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
              ${session.status === 'failed' ? 'bg-red-100 text-red-700' : ''}
              ${isProcessing ? 'bg-blue-100 text-blue-700' : ''}
              ${session.status === 'uploaded' ? 'bg-gray-100 text-gray-700' : ''}
            `}
          >
            <span
              className={`w-2 h-2 rounded-full ${getStatusColor(session.status)} ${
                isProcessing ? 'animate-pulse' : ''
              }`}
            />
            <span>{getStatusLabel(session.status)}</span>
          </div>
        </div>

        {session.status === 'completed' && (
          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatDuration(session.duration_seconds)}
            </span>
            {session.speaker_count && (
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {session.speaker_count} speakers
              </span>
            )}
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              {formatFileSize(session.file_size)}
            </span>
          </div>
        )}

        {session.summary && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {session.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
