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
      const truncatedText = text.length > 8000 ? text.substring(0, 8000) + '...' : text;

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
}
