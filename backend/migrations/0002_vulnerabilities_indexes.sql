-- Add indexes to optimize filtering & sorting
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities (severity);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities (status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_reported_at ON vulnerabilities (reported_at DESC);
-- Composite index for common severity+status filters
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity_status ON vulnerabilities (severity, status);
-- Simple trigram extension (optional) skipped; name ILIKE currently uses sequential scan; consider pg_trgm later.
