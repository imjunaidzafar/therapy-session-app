import { SessionStatus } from './session';

export interface UploadResponse {
  id: string;
  message: string;
}

export interface StatusResponse {
  id: string;
  status: SessionStatus;
  error_message: string | null;
}

export interface SearchRequest {
  query: string;
  limit?: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
