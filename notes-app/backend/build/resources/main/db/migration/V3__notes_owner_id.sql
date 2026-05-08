-- Assign all existing rows to the legacy placeholder user, then enforce FK + NOT NULL.
ALTER TABLE notes ADD COLUMN owner_id UUID;

UPDATE notes
SET owner_id = '00000000-0000-4000-8000-000000000001'
WHERE owner_id IS NULL;

ALTER TABLE notes ALTER COLUMN owner_id SET NOT NULL;

ALTER TABLE notes
    ADD CONSTRAINT fk_notes_owner FOREIGN KEY (owner_id) REFERENCES users (id);
