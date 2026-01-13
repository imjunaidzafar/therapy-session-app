-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Sessions table for storing therapy session data
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Audio file info
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    duration_seconds INTEGER,

    -- Processing status
    -- Values: uploaded, transcribing, summarizing, vectorizing, completed, failed
    status VARCHAR(50) DEFAULT 'uploaded',
    error_message TEXT,

    -- Processed content
    transcript JSONB,           -- Array of {speaker, text, start, end}
    transcript_text TEXT,       -- Plain text version for display
    summary TEXT,

    -- Vectorization
    embedding vector(1536),     -- OpenAI text-embedding-ada-002 produces 1536 dimensions
    vectorized_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    speaker_count INTEGER,
    word_count INTEGER
);

-- Index for semantic search using cosine similarity
CREATE INDEX IF NOT EXISTS sessions_embedding_idx ON sessions
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function for semantic search
CREATE OR REPLACE FUNCTION search_sessions(
    query_embedding vector(1536),
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    original_filename VARCHAR(255),
    file_size INTEGER,
    duration_seconds INTEGER,
    status VARCHAR(50),
    error_message TEXT,
    transcript JSONB,
    transcript_text TEXT,
    summary TEXT,
    vectorized_at TIMESTAMPTZ,
    speaker_count INTEGER,
    word_count INTEGER,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.created_at,
        s.updated_at,
        s.original_filename,
        s.file_size,
        s.duration_seconds,
        s.status,
        s.error_message,
        s.transcript,
        s.transcript_text,
        s.summary,
        s.vectorized_at,
        s.speaker_count,
        s.word_count,
        1 - (s.embedding <=> query_embedding) AS similarity
    FROM sessions s
    WHERE s.embedding IS NOT NULL
    ORDER BY s.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
