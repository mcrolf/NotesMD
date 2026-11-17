-- Sign out everywhere: access tokens issued at or before this instant are rejected. NULL means none are revoked.
ALTER TABLE users ADD COLUMN tokens_valid_after TIMESTAMP WITH TIME ZONE;
