'use client';

import { ReactNode } from 'react';
import { SessionStatus, getStatusLabel } from '@/lib/api';

interface ProcessingStatusProps {
  status: SessionStatus;
  errorMessage?: string | null;
}

const statusSteps: { key: SessionStatus; label: string; icon: ReactNode }[] = [
  {
    key: 'uploaded',
    label: 'Upload',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
  },
  {
    key: 'transcribing',
    label: 'Transcribe',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  },
  {
    key: 'summarizing',
    label: 'Summarize',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  {
    key: 'vectorizing',
    label: 'Vectorize',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>,
  },
  {
    key: 'completed',
    label: 'Done',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  },
];

export default function ProcessingStatus({ status, errorMessage }: ProcessingStatusProps) {
  const currentStepIndex = statusSteps.findIndex(s => s.key === status);
  const isProcessing = ['transcribing', 'summarizing', 'vectorizing'].includes(status);
  const isFailed = status === 'failed';
  const isCompleted = status === 'completed';

  const getStepColor = (index: number) => {
    if (index < currentStepIndex) return 'bg-emerald-500';
    if (index === currentStepIndex && !isFailed) {
      return isCompleted ? 'bg-emerald-500' : 'bg-indigo-500';
    }
    if (isFailed && index === currentStepIndex) return 'bg-red-500';
    return 'bg-gray-200';
  };

  const getLineColor = (index: number) => {
    if (index < currentStepIndex) return 'bg-emerald-500';
    if (index === currentStepIndex && isCompleted) return 'bg-emerald-500';
    return 'bg-gray-200';
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => {
            const isStepCompleted = index < currentStepIndex || (index === currentStepIndex && isCompleted);
            const isCurrent = index === currentStepIndex && !isCompleted;
            const isPending = index > currentStepIndex;

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                      ${getStepColor(index)}
                      ${isStepCompleted ? 'text-white' : ''}
                      ${isCurrent && !isFailed ? 'text-white shadow-lg shadow-indigo-200' : ''}
                      ${isCurrent && isFailed ? 'text-white shadow-lg shadow-red-200' : ''}
                      ${isPending ? 'text-gray-400' : ''}
                      ${isCurrent && isProcessing ? 'animate-pulse' : ''}
                    `}
                  >
                    {isStepCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : isFailed && isCurrent ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`
                      mt-2 text-xs font-semibold transition-colors
                      ${isStepCompleted ? 'text-emerald-600' : ''}
                      ${isCurrent && !isFailed ? 'text-indigo-600' : ''}
                      ${isCurrent && isFailed ? 'text-red-600' : ''}
                      ${isPending ? 'text-gray-400' : ''}
                    `}
                  >
                    {step.label}
                  </span>
                </div>
                {index < statusSteps.length - 1 && (
                  <div className="flex-1 px-2 -mt-6">
                    <div className={`h-1 rounded-full transition-all duration-500 ${getLineColor(index)}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`
        mt-6 p-4 rounded-xl border transition-all
        ${isCompleted ? 'bg-emerald-50 border-emerald-200' : ''}
        ${isFailed ? 'bg-red-50 border-red-200' : ''}
        ${isProcessing ? 'bg-indigo-50 border-indigo-200' : ''}
        ${status === 'uploaded' ? 'bg-gray-50 border-gray-200' : ''}
      `}>
        <div className="flex items-center space-x-3">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            ${isCompleted ? 'bg-emerald-100' : ''}
            ${isFailed ? 'bg-red-100' : ''}
            ${isProcessing ? 'bg-indigo-100' : ''}
            ${status === 'uploaded' ? 'bg-gray-100' : ''}
          `}>
            {isCompleted && (
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {isFailed && (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {isProcessing && (
              <svg className="w-5 h-5 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {status === 'uploaded' && (
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <span className={`
              font-semibold
              ${isCompleted ? 'text-emerald-700' : ''}
              ${isFailed ? 'text-red-700' : ''}
              ${isProcessing ? 'text-indigo-700' : ''}
              ${status === 'uploaded' ? 'text-gray-700' : ''}
            `}>
              {getStatusLabel(status)}
            </span>
            {isProcessing && <p className="text-sm text-indigo-600 mt-0.5">This may take a few minutes...</p>}
          </div>
        </div>
        {isFailed && errorMessage && (
          <div className="mt-3 p-3 bg-red-100 rounded-lg">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
