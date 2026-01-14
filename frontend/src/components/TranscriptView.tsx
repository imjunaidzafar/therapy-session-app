'use client';

import { TranscriptSegment } from '@/lib/api';

interface TranscriptViewProps {
  transcript: TranscriptSegment[] | null;
}

const speakerColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  'Speaker A': { bg: 'bg-gradient-to-r from-blue-50 to-indigo-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'bg-blue-500' },
  'Speaker B': { bg: 'bg-gradient-to-r from-emerald-50 to-teal-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'bg-emerald-500' },
  'Speaker C': { bg: 'bg-gradient-to-r from-purple-50 to-violet-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'bg-purple-500' },
  'Speaker D': { bg: 'bg-gradient-to-r from-amber-50 to-orange-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'bg-amber-500' },
  'Speaker E': { bg: 'bg-gradient-to-r from-pink-50 to-rose-50', text: 'text-pink-700', border: 'border-pink-200', icon: 'bg-pink-500' },
};

function getSpeakerColor(speaker: string) {
  return speakerColors[speaker] || {
    bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: 'bg-gray-500',
  };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getSpeakerInitial(speaker: string): string {
  const match = speaker.match(/Speaker\s+([A-Z])/i);
  return match ? match[1].toUpperCase() : speaker.charAt(0).toUpperCase();
}

export default function TranscriptView({ transcript }: TranscriptViewProps) {
  if (!transcript || transcript.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No transcript available yet</p>
        <p className="text-gray-400 text-sm">The transcript will appear here once processing is complete</p>
      </div>
    );
  }

  const uniqueSpeakers = [...new Set(transcript.map(s => s.speaker))];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-gray-100">
        {uniqueSpeakers.map((speaker) => {
          const colors = getSpeakerColor(speaker);
          return (
            <div key={speaker} className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
              <span className={`w-2 h-2 rounded-full ${colors.icon} mr-2`} />
              {speaker}
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {transcript.map((segment, index) => {
          const colors = getSpeakerColor(segment.speaker);
          return (
            <div key={index} className={`relative p-4 rounded-xl border ${colors.bg} ${colors.border} transition-all hover:shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg ${colors.icon} flex items-center justify-center text-white text-sm font-bold`}>
                    {getSpeakerInitial(segment.speaker)}
                  </div>
                  <span className={`font-semibold ${colors.text}`}>{segment.speaker}</span>
                </div>
                <span className="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-md font-mono">
                  {formatTime(segment.start)} - {formatTime(segment.end)}
                </span>
              </div>
              <p className="text-gray-800 leading-relaxed pl-11">{segment.text}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          {transcript.length} segment{transcript.length !== 1 ? 's' : ''} from {uniqueSpeakers.length} speaker{uniqueSpeakers.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
