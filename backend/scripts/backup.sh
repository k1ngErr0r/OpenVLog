#!/usr/bin/env bash
# PostgreSQL backup script for OpenVLog
# Requirements: docker / docker compose, pg_dump available in db container image
set -euo pipefail

# Configurable vars
BACKUP_DIR=${BACKUP_DIR:-"./backups"}
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
FILENAME="openvlog-backup-$TIMESTAMP.sql.gz"
DB_SERVICE=${DB_SERVICE:-"db"}
COMPOSE_FILE_ARGS=${COMPOSE_FILE_ARGS:-""} # e.g. "-f docker-compose.yml -f docker-compose.prod.yml"

mkdir -p "$BACKUP_DIR"

# Run pg_dump inside the db container (assumes POSTGRES_USER / POSTGRES_DB env present in service)
echo "[backup] Creating compressed dump $BACKUP_DIR/$FILENAME"
docker compose $COMPOSE_FILE_ARGS exec -T $DB_SERVICE pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_DIR/$FILENAME"

# Optional: prune old backups (keep last 14)
KEEP=${KEEP:-14}
COUNT=$(ls -1t "$BACKUP_DIR"/openvlog-backup-*.sql.gz 2>/dev/null | wc -l || true)
if [ "$COUNT" -gt "$KEEP" ]; then
  ls -1t "$BACKUP_DIR"/openvlog-backup-*.sql.gz | tail -n +$((KEEP+1)) | xargs -r rm --
fi

echo "[backup] Done -> $BACKUP_DIR/$FILENAME"
