'use client';

import { TranscriptSegment } from '@/lib/api';

interface TranscriptViewProps {
  transcript: TranscriptSegment[] | null;
}

// Colors for different speakers
const speakerColors: Record<string, { bg: string; text: string; border: string }> = {
  'Speaker A': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Speaker B': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Speaker C': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Speaker D': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Speaker E': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
};

function getSpeakerColor(speaker: string) {
  return speakerColors[speaker] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function TranscriptView({ transcript }: TranscriptViewProps) {
  if (!transcript || transcript.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No transcript available yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transcript.map((segment, index) => {
        const colors = getSpeakerColor(segment.speaker);
        return (
          <div
            key={index}
            className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`font-medium text-sm ${colors.text}`}>
                {segment.speaker}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(segment.start)} - {formatTime(segment.end)}
              </span>
            </div>
            <p className="text-gray-800">{segment.text}</p>
          </div>
        );
      })}
    </div>
  );
}
