-- Baseline for empty databases. Skipped when `notes` already exists (e.g. from prior Hibernate ddl-auto).
CREATE TABLE IF NOT EXISTS notes (
    id UUID NOT NULL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content_markdown TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
