import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { TranscriptionService } from '../transcription/transcription.service';
import { SummarizationService } from '../summarization/summarization.service';
import { VectorizationService } from '../vectorization/vectorization.service';
import {
  Session,
  SessionStatus,
  SessionWithSimilarity,
} from './entities/session.entity';
import * as fs from 'fs';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private supabaseService: SupabaseService,
    private transcriptionService: TranscriptionService,
    private summarizationService: SummarizationService,
    private vectorizationService: VectorizationService,
  ) {}

  async create(
    originalFilename: string,
    fileSize: number,
  ): Promise<Session> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('sessions')
      .insert({
        original_filename: originalFilename,
        file_size: fileSize,
        status: 'uploaded',
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create session', error);
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return data as Session;
  }

  async findAll(): Promise<Session[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to fetch sessions', error);
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    return data as Session[];
  }

  async findOne(id: string): Promise<Session> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return data as Session;
  }

  async updateStatus(
    id: string,
    status: SessionStatus,
    errorMessage?: string,
  ): Promise<void> {
    const updateData: Record<string, unknown> = { status };
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('sessions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      this.logger.error(`Failed to update session status: ${error.message}`);
    }
  }

  async processSession(sessionId: string, filePath: string): Promise<void> {
    this.logger.log(`Starting processing for session: ${sessionId}`);

    try {
      // Step 1: Transcription
      await this.updateStatus(sessionId, 'transcribing');
      const transcriptionResult =
        await this.transcriptionService.transcribe(filePath);

      // Update with transcription results
      await this.supabaseService
        .getClient()
        .from('sessions')
        .update({
          transcript: transcriptionResult.segments,
          transcript_text: transcriptionResult.fullText,
          speaker_count: transcriptionResult.speakerCount,
          word_count: transcriptionResult.wordCount,
          duration_seconds: transcriptionResult.durationSeconds,
          status: 'summarizing',
        })
        .eq('id', sessionId);

      // Step 2: Summarization
      const summary = await this.summarizationService.summarize(
        transcriptionResult.fullText,
      );

      await this.supabaseService
        .getClient()
        .from('sessions')
        .update({
          summary,
          status: 'vectorizing',
        })
        .eq('id', sessionId);

      // Step 3: Vectorization
      // Combine transcript and summary for embedding
      const textForEmbedding = `${transcriptionResult.fullText}\n\nSummary:\n${summary}`;
      const embedding =
        await this.vectorizationService.generateEmbedding(textForEmbedding);

      // Store embedding as JSON array string for pgvector
      const embeddingStr = `[${embedding.join(',')}]`;

      await this.supabaseService
        .getClient()
        .from('sessions')
        .update({
          embedding: embeddingStr,
          vectorized_at: new Date().toISOString(),
          status: 'completed',
        })
        .eq('id', sessionId);

      this.logger.log(`Processing completed for session: ${sessionId}`);

      // Clean up temp file
      try {
        fs.unlinkSync(filePath);
      } catch {
        this.logger.warn(`Failed to delete temp file: ${filePath}`);
      }
    } catch (error) {
      this.logger.error(`Processing failed for session: ${sessionId}`, error);
      await this.updateStatus(
        sessionId,
        'failed',
        error instanceof Error ? error.message : 'Unknown error',
      );

      // Clean up temp file on error too
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignore cleanup errors
      }

      throw error;
    }
  }

  async searchSessions(
    query: string,
    limit: number = 10,
  ): Promise<SessionWithSimilarity[]> {
    this.logger.log(`Searching sessions with query: "${query}"`);

    // Generate embedding for query
    const queryEmbedding =
      await this.vectorizationService.generateEmbedding(query);
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    // Perform semantic search using pgvector
    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('search_sessions', {
        query_embedding: embeddingStr,
        match_count: limit,
      });

    if (error) {
      this.logger.error('Search failed', error);
      throw new Error(`Search failed: ${error.message}`);
    }

    return data as SessionWithSimilarity[];
  }
}
