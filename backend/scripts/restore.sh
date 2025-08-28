#!/usr/bin/env bash
# Restore PostgreSQL backup for OpenVLog
# Usage: BACKUP=path/to/file.sql.gz ./backend/scripts/restore.sh
set -euo pipefail

BACKUP=${BACKUP:-}
if [ -z "$BACKUP" ]; then
  echo "BACKUP env var (path to .sql.gz) required" >&2
  exit 1
fi
DB_SERVICE=${DB_SERVICE:-"db"}
COMPOSE_FILE_ARGS=${COMPOSE_FILE_ARGS:-""}

echo "[restore] Restoring $BACKUP"
if [[ "$BACKUP" == *.gz ]]; then
  gunzip -c "$BACKUP" | docker compose $COMPOSE_FILE_ARGS exec -T $DB_SERVICE psql -U "$POSTGRES_USER" "$POSTGRES_DB"
else
  cat "$BACKUP" | docker compose $COMPOSE_FILE_ARGS exec -T $DB_SERVICE psql -U "$POSTGRES_USER" "$POSTGRES_DB"
fi

echo "[restore] Completed"
