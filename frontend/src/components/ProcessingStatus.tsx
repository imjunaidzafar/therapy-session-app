'use client';

import { SessionStatus, getStatusLabel, getStatusColor } from '@/lib/api';

interface ProcessingStatusProps {
  status: SessionStatus;
  errorMessage?: string | null;
}

const statusSteps: SessionStatus[] = [
  'uploaded',
  'transcribing',
  'summarizing',
  'vectorizing',
  'completed',
];

export default function ProcessingStatus({
  status,
  errorMessage,
}: ProcessingStatusProps) {
  const currentStepIndex = statusSteps.indexOf(status);
  const isProcessing = ['transcribing', 'summarizing', 'vectorizing'].includes(status);
  const isFailed = status === 'failed';

  return (
    <div className="w-full">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-2">
        {statusSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isCurrent && !isFailed ? `${getStatusColor(status)} text-white` : ''}
                  ${isCurrent && isFailed ? 'bg-red-500 text-white' : ''}
                  ${isPending ? 'bg-gray-200 text-gray-500' : ''}
                  ${isCurrent && isProcessing ? 'animate-pulse' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < statusSteps.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-2
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Labels */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Upload</span>
        <span>Transcribe</span>
        <span>Summarize</span>
        <span>Vectorize</span>
        <span>Done</span>
      </div>

      {/* Current Status */}
      <div className="mt-4 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2">
          <span
            className={`w-3 h-3 rounded-full ${getStatusColor(status)} ${
              isProcessing ? 'animate-pulse' : ''
            }`}
          />
          <span className="font-medium">{getStatusLabel(status)}</span>
        </div>
        {isFailed && errorMessage && (
          <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
