'use client';

import Link from 'next/link';
import { Session, formatDuration, formatFileSize, getStatusLabel } from '@/lib/api';

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  const isProcessing = ['transcribing', 'summarizing', 'vectorizing'].includes(session.status);

  const getStatusStyles = () => {
    switch (session.status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'failed': return 'bg-red-50 text-red-700 border-red-200';
      case 'uploaded': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusDotColor = () => {
    switch (session.status) {
      case 'completed': return 'bg-emerald-500';
      case 'failed': return 'bg-red-500';
      case 'uploaded': return 'bg-slate-400';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Link href={`/sessions/${session.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                  {session.original_filename}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(session.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyles()}`}>
            <span className={`w-2 h-2 rounded-full ${getStatusDotColor()} ${isProcessing ? 'animate-pulse' : ''}`} />
            <span>{getStatusLabel(session.status)}</span>
          </div>
        </div>

        {session.status === 'completed' && (
          <div className="mt-4 flex items-center flex-wrap gap-4 text-sm">
            <span className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(session.duration_seconds)}
            </span>
            {session.speaker_count && (
              <span className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {session.speaker_count} speaker{session.speaker_count !== 1 ? 's' : ''}
              </span>
            )}
            <span className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {formatFileSize(session.file_size)}
            </span>
          </div>
        )}

        {session.summary && (
          <div className="mt-4 p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{session.summary}</p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-indigo-600 font-medium flex items-center">
            View details
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
