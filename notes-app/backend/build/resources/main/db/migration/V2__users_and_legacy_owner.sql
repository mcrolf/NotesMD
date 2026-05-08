-- Application users. A dedicated placeholder row owns pre-existing notes; see V3.
CREATE TABLE users (
    id UUID NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_users_username ON users (username);

-- BCrypt for well-known test password "password"; this account is not for interactive login.
INSERT INTO users (id, username, password_hash, created_at, updated_at)
VALUES (
    '00000000-0000-4000-8000-000000000001',
    '__legacy_unowned_notes__',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
