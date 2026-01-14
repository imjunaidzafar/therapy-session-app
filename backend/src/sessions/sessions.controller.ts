import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SessionsService } from './sessions.service';
import { SearchSessionsDto } from './dto/search-sessions.dto';

const ALLOWED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/webm',
  'audio/ogg',
  'audio/flac',
];

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          callback(null, `${uuidv4()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (ALLOWED_AUDIO_MIMES.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(`Unsupported file type: ${file.mimetype}`),
            false,
          );
        }
      },
    }),
  )
  async uploadAudio(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No audio file provided');
    }

    const session = await this.sessionsService.create(file.originalname, file.size);
    const filePath = join(process.cwd(), file.path);

    this.sessionsService.processSession(session.id, filePath).catch((err) => {
      console.error('Background processing failed:', err);
    });

    return { id: session.id, message: 'Upload successful. Processing started.' };
  }

  @Get()
  async findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    const session = await this.sessionsService.findOne(id);
    return {
      id: session.id,
      status: session.status,
      error_message: session.error_message,
    };
  }

  @Post('search')
  async search(@Body() searchDto: SearchSessionsDto) {
    if (!searchDto.query?.trim()) {
      throw new BadRequestException('Search query is required');
    }
    return this.sessionsService.searchSessions(searchDto.query, searchDto.limit || 10);
  }
}
