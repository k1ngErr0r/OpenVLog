-- Account lockout support
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lock_until TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_users_lock_until ON users (lock_until);
