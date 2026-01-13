# Therapy Session Processor

A web application for therapists to upload, transcribe, summarize, and semantically search therapy session audio recordings.

## High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js       │     │    NestJS       │     │    Supabase     │
│   Frontend      │────▶│    Backend      │────▶│    Postgres     │
│   (Tailwind)    │     │                 │     │   + pgvector    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              AssemblyAI    OpenAI     OpenAI
              (Transcribe   (GPT-4     (Embeddings)
              +Diarize)     Summary)
```

### Technology Stack

- **Frontend**: Next.js 15 + Tailwind CSS + TypeScript
- **Backend**: NestJS + TypeScript
- **Database**: Supabase (PostgreSQL with pgvector extension)
- **APIs**:
  - AssemblyAI - Audio transcription with speaker diarization
  - OpenAI GPT-4o-mini - Session summarization
  - OpenAI text-embedding-ada-002 - Vector embeddings for semantic search

## Data Model

### Sessions Table

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Audio file info
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    duration_seconds INTEGER,

    -- Processing status: uploaded → transcribing → summarizing → vectorizing → completed
    status VARCHAR(50) DEFAULT 'uploaded',
    error_message TEXT,

    -- Processed content
    transcript JSONB,           -- Array of {speaker, text, start, end}
    transcript_text TEXT,       -- Plain text version
    summary TEXT,

    -- Vectorization
    embedding vector(1536),     -- OpenAI ada-002 embedding
    vectorized_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    speaker_count INTEGER,
    word_count INTEGER
);
```

## Processing Pipeline

### How Transcription Works
1. **Upload**: Audio file is uploaded via multipart form data to the backend
2. **Storage**: File is temporarily stored on disk
3. **AssemblyAI**: File is sent to AssemblyAI with `speaker_labels: true` for diarization
4. **Parsing**: Response is parsed into structured segments with speaker labels, timestamps, and text

**Why AssemblyAI?**
- Native speaker diarization (the assignment requires identifying 2+ speakers)
- Industry standard for medical/therapy transcription
- Single API call handles both transcription and speaker identification

### How Summarization Works
1. The full transcript text is sent to OpenAI GPT-4o-mini
2. A system prompt instructs the model to create a therapy-focused summary including:
   - Main topics discussed
   - Key emotional themes
   - Progress or insights noted
   - Action items mentioned
3. Summary is stored in the database

### How Vectorization Works
1. Transcript + summary text is combined
2. Text is sent to OpenAI's text-embedding-ada-002 model
3. Returns a 1536-dimensional vector representation
4. Vector is stored in Supabase using pgvector extension
5. Enables semantic (meaning-based) search across all sessions

**Semantic Search Query Flow**:
```
User Query → Generate Embedding → Cosine Similarity Search → Return Ranked Results
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sessions/upload` | Upload audio file, starts processing pipeline |
| GET | `/sessions` | List all sessions |
| GET | `/sessions/:id` | Get session details |
| GET | `/sessions/:id/status` | Get processing status (for polling) |
| POST | `/sessions/search` | Semantic search across sessions |

## Setup Instructions

### Prerequisites
1. Node.js 18+ installed
2. pnpm installed (`npm install -g pnpm`)
3. Supabase account (free tier works)
4. AssemblyAI API key (free tier includes 100 hours)
5. OpenAI API key

### 1. Supabase Setup
1. Create a new project at https://supabase.com
2. Go to SQL Editor and run the schema:
   ```sql
   -- Copy contents from backend/src/database/schema.sql
   ```
3. Copy your project URL and service key from Settings → API

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env

# Edit .env with your keys:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_KEY=your_service_role_key
# ASSEMBLYAI_API_KEY=your_assemblyai_key
# OPENAI_API_KEY=your_openai_key

# Start the server
pnpm run start:dev
```
Backend runs on http://localhost:3001

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Start the dev server
pnpm run dev
```
Frontend runs on http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Upload an audio file (MP3, WAV, M4A, etc.)
3. Wait for processing (status updates automatically)
4. View the transcript with speaker labels
5. Read the AI-generated summary
6. Use semantic search to find sessions by meaning

## Assumptions & Tradeoffs

### Assumptions
- Audio files are under 100MB
- Single-user scenario (no authentication needed per spec)
- Processing completes in reasonable time (no background jobs per spec)

### Tradeoffs Made

1. **AssemblyAI vs OpenAI Whisper**
   - Chose AssemblyAI because it provides native speaker diarization
   - OpenAI Whisper doesn't identify speakers, would need additional processing
   - Trade: External dependency vs simpler implementation

2. **pgvector vs Dedicated Vector DB (Pinecone/Weaviate)**
   - Chose pgvector to keep all data in Supabase
   - Simpler architecture, no additional infrastructure
   - Trade: Less scalable for millions of sessions, but sufficient for this scope

3. **Polling vs WebSockets**
   - Used polling (3-second interval) for status updates
   - Simpler to implement, no persistent connections
   - Trade: Slightly higher latency, more HTTP requests

4. **Synchronous Processing Start**
   - Processing starts immediately after upload (fire-and-forget)
   - Frontend polls for status updates
   - Trade: Could block the server for large files, but acceptable for scope

## Scaling Considerations

If this needed to scale to production:

1. **Background Jobs**: Use Bull/Redis for async processing queue
2. **File Storage**: Store audio in S3/Supabase Storage instead of local disk
3. **Chunking**: Split large transcripts into chunks for better embedding quality
4. **Caching**: Cache embeddings for common search queries
5. **Rate Limiting**: Add rate limiting for API endpoints
6. **Authentication**: Add user auth to scope sessions per therapist

## Project Structure

```
therapy-session-app/
├── frontend/                 # Next.js app
│   ├── src/
│   │   ├── app/             # Pages and layouts
│   │   ├── components/      # React components
│   │   └── lib/             # API client and utilities
│   └── .env.example
│
├── backend/                  # NestJS app
│   ├── src/
│   │   ├── sessions/        # Session CRUD and orchestration
│   │   ├── transcription/   # AssemblyAI integration
│   │   ├── summarization/   # OpenAI GPT integration
│   │   ├── vectorization/   # OpenAI Embeddings integration
│   │   └── database/        # Supabase client and schema
│   └── .env.example
│
└── README.md
```
