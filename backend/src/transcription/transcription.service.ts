import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssemblyAI, TranscriptUtterance } from 'assemblyai';

export interface TranscriptSegment {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

export interface TranscriptionResult {
  segments: TranscriptSegment[];
  fullText: string;
  speakerCount: number;
  wordCount: number;
  durationSeconds: number;
}

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private client: AssemblyAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ASSEMBLYAI_API_KEY');
    if (!apiKey) {
      throw new Error('Missing AssemblyAI API key');
    }
    this.client = new AssemblyAI({ apiKey });
  }

  async transcribe(filePath: string): Promise<TranscriptionResult> {
    this.logger.log(`Starting transcription for file: ${filePath}`);

    try {
      // Request transcription with speaker diarization
      const transcript = await this.client.transcripts.transcribe({
        audio: filePath,
        speaker_labels: true,
      });

      if (transcript.status === 'error') {
        throw new Error(transcript.error || 'Transcription failed');
      }

      // Format the response
      const segments = this.formatUtterances(transcript.utterances || []);
      const fullText = segments.map((s) => `${s.speaker}: ${s.text}`).join('\n');

      // Count unique speakers
      const speakers = new Set(segments.map((s) => s.speaker));

      // Count words
      const wordCount = transcript.words?.length || 0;

      // Duration in seconds
      const durationSeconds = Math.round(
        (transcript.audio_duration || 0),
      );

      this.logger.log(
        `Transcription complete: ${speakers.size} speakers, ${wordCount} words`,
      );

      return {
        segments,
        fullText,
        speakerCount: speakers.size,
        wordCount,
        durationSeconds,
      };
    } catch (error) {
      this.logger.error('Transcription failed', error);
      throw error;
    }
  }

  private formatUtterances(utterances: TranscriptUtterance[]): TranscriptSegment[] {
    return utterances.map((utterance) => ({
      speaker: `Speaker ${utterance.speaker}`,
      text: utterance.text,
      start: utterance.start / 1000, // Convert ms to seconds
      end: utterance.end / 1000,
    }));
  }
}
