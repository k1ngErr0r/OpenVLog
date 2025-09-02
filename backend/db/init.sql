-- Master initialization script for Postgres container
-- This file should represent the "latest" complete schema so that a brand new
-- environment does not depend on running incremental migrations. Incremental
-- migration files still exist under /backend/migrations for reference/history.

CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        two_factor_secret TEXT NULL,
        failed_attempts INT NOT NULL DEFAULT 0,
        lock_until TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS idx_users_lock_until ON users(lock_until);

CREATE TABLE IF NOT EXISTS vulnerabilities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        severity VARCHAR(50),
        status VARCHAR(50),
        reported_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- Vulnerability indexes (from migration 0002)
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities (severity);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities (status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_reported_at ON vulnerabilities (reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity_status ON vulnerabilities (severity, status);

-- Threaded comments (from migration 0003)
CREATE TABLE IF NOT EXISTS vulnerability_comments (
    id SERIAL PRIMARY KEY,
    vulnerability_id INT NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vuln_comments_vulnerability_id ON vulnerability_comments (vulnerability_id);
CREATE INDEX IF NOT EXISTS idx_vuln_comments_user_id ON vulnerability_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_vuln_comments_created_at ON vulnerability_comments (created_at DESC);

-- Password reset tokens (from migration 0005)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_prt_expires_at ON password_reset_tokens (expires_at);

-- Attachments (from migration 0006)
CREATE TABLE IF NOT EXISTS vulnerability_attachments (
        id SERIAL PRIMARY KEY,
        vulnerability_id INTEGER NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vulnerability_attachments_vulnerability_id ON vulnerability_attachments(vulnerability_id);

-- Notifications (supersedes earlier simple version) (from migration 0007)
CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        link VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);


