import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter, LoggingInterceptor } from './common';
import { ensureDirectoryExists } from './utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Ensure uploads directory exists
  const uploadDir = configService.get<string>('upload.destination') || './uploads';
  ensureDirectoryExists(uploadDir);

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable CORS for frontend
  const corsOrigins = configService.get<string[]>('cors.origins') || [
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const port = configService.get<number>('port') || 3001;
  await app.listen(port);
  logger.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
