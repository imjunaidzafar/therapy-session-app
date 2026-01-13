import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class VectorizationService {
  private readonly logger = new Logger(VectorizationService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('Missing OpenAI API key');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    this.logger.log('Generating embedding...');

    try {
      // Truncate text if too long (ada-002 has 8191 token limit)
      const truncatedText = this.truncateText(text, 8000);

      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: truncatedText,
      });

      const embedding = response.data[0]?.embedding;

      if (!embedding) {
        throw new Error('No embedding returned from OpenAI');
      }

      this.logger.log(`Embedding generated: ${embedding.length} dimensions`);
      return embedding;
    } catch (error) {
      this.logger.error('Embedding generation failed', error);
      throw error;
    }
  }

  private truncateText(text: string, maxChars: number): string {
    // Simple truncation - in production, use proper tokenization
    if (text.length <= maxChars) {
      return text;
    }
    return text.substring(0, maxChars) + '...';
  }
}
