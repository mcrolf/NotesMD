-- The legacy placeholder user from V2 must never sign in. Its seeded hash is published in this repo
-- (and V2's comment about the plaintext is wrong). Remove the row when no note still belongs to it;
-- otherwise keep it as the owner of those notes with a hash that BCrypt never matches.
DELETE FROM users
WHERE id = '00000000-0000-4000-8000-000000000001'
  AND NOT EXISTS (SELECT 1 FROM notes WHERE owner_id = '00000000-0000-4000-8000-000000000001');

UPDATE users
SET password_hash = '!disabled', updated_at = CURRENT_TIMESTAMP
WHERE id = '00000000-0000-4000-8000-000000000001';
