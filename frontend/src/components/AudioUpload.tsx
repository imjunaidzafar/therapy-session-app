'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadAudio } from '@/lib/api';

interface AudioUploadProps {
  onUploadSuccess: (sessionId: string) => void;
}

export default function AudioUpload({ onUploadSuccess }: AudioUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setFileName(file.name);
      setUploading(true);
      setError(null);

      try {
        const result = await uploadAudio(file);
        onUploadSuccess(result.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        setFileName(null);
      } finally {
        setUploading(false);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
    disabled: uploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
          ${uploading ? 'opacity-70 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragActive ? 'bg-indigo-100' : 'bg-gray-100'}`}>
            {uploading ? (
              <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className={`h-8 w-8 transition-colors ${isDragActive ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          {uploading ? (
            <div className="space-y-2">
              <p className="text-gray-900 font-semibold">Uploading your file...</p>
              {fileName && <p className="text-sm text-gray-500 truncate max-w-xs mx-auto">{fileName}</p>}
              <div className="w-48 h-1.5 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          ) : isDragActive ? (
            <div className="space-y-1">
              <p className="text-indigo-600 font-semibold text-lg">Drop your audio file here</p>
              <p className="text-sm text-indigo-500">Release to start upload</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-900 font-medium">
                <span className="text-indigo-600 font-semibold hover:text-indigo-700">Click to browse</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500">Supports MP3, WAV, M4A, WebM, OGG, FLAC up to 100MB</p>
            </div>
          )}
        </div>

        {isDragActive && (
          <>
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-indigo-500 rounded-tl" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-indigo-500 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-indigo-500 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-indigo-500 rounded-br" />
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-red-700 font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
