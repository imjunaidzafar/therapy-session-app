import { API_URL } from '@/constants';
import {
  Session,
  SessionWithSimilarity,
  UploadResponse,
  StatusResponse,
} from '@/types';

class SessionService {
  private baseUrl = `${API_URL}/sessions`;

  async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async getAll(): Promise<Session[]> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    return response.json();
  }

  async getById(id: string): Promise<Session> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }

    return response.json();
  }

  async getStatus(id: string): Promise<StatusResponse> {
    const response = await fetch(`${this.baseUrl}/${id}/status`);

    if (!response.ok) {
      throw new Error('Failed to fetch session status');
    }

    return response.json();
  }

  async search(query: string, limit: number = 10): Promise<SessionWithSimilarity[]> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit }),
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    return response.json();
  }
}

export const sessionService = new SessionService();
