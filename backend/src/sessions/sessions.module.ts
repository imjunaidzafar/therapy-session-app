import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { TranscriptionModule } from '../transcription/transcription.module';
import { SummarizationModule } from '../summarization/summarization.module';
import { VectorizationModule } from '../vectorization/vectorization.module';

@Module({
  imports: [TranscriptionModule, SummarizationModule, VectorizationModule],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
