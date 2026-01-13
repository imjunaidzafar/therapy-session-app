import { Module } from '@nestjs/common';
import { VectorizationService } from './vectorization.service';

@Module({
  providers: [VectorizationService],
  exports: [VectorizationService],
})
export class VectorizationModule {}
