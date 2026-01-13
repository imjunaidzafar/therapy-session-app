import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class SummarizationService {
  private readonly logger = new Logger(SummarizationService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('Missing OpenAI API key');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async summarize(transcript: string): Promise<string> {
    this.logger.log('Starting summarization...');

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert therapy session summarizer. Your task is to provide concise, professional summaries of therapy sessions that capture the key elements while maintaining patient confidentiality and clinical relevance.`,
          },
          {
            role: 'user',
            content: `Please summarize the following therapy session transcript. Include:
1. Main topics discussed
2. Key emotional themes or concerns expressed
3. Any progress or insights noted
4. Action items or follow-ups mentioned (if any)

Keep the summary concise (2-4 paragraphs).

Transcript:
${transcript}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const summary = response.choices[0]?.message?.content || '';
      this.logger.log('Summarization complete');

      return summary;
    } catch (error) {
      this.logger.error('Summarization failed', error);
      throw error;
    }
  }
}
