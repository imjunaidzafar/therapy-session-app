export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),

  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  assemblyai: {
    apiKey: process.env.ASSEMBLYAI_API_KEY,
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    embeddingModel: 'text-embedding-ada-002',
    chatModel: 'gpt-4o-mini',
  },

  upload: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    destination: './uploads',
    allowedMimeTypes: [
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
    ],
  },

  cors: {
    origins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  },
});
