-- Soft-archive: null archived_at = active note; non-null = archived with timestamp.
ALTER TABLE notes ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;

-- Composite index for active-list queries by owner (full index for H2 test parity; Postgres partial index optional later).
CREATE INDEX idx_notes_owner_active ON notes (owner_id, created_at DESC);
