<#
.SYNOPSIS
    PostgreSQL backup script for OpenVLog (PowerShell)
.DESCRIPTION
    Creates a compressed pg_dump of the database inside the running db container.
.PARAMETER BackupDir
    Destination directory (defaults to ./backups)
.PARAMETER DbService
    Docker compose DB service name (default 'db')
.PARAMETER Keep
    Number of most recent backups to retain (default 14)
.PARAMETER ComposeArgs
    Extra docker compose -f arguments string
#>
param(
    [string]$BackupDir = "./backups",
    [string]$DbService = "db",
    [int]$Keep = 14,
    [string]$ComposeArgs = ""
)

$ErrorActionPreference = 'Stop'
if (!(Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir | Out-Null }
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$filename = "openvulog-backup-$timestamp.sql.gz"
Write-Host "[backup] Creating $BackupDir/$filename"

$compose = "docker compose $ComposeArgs exec -T $DbService pg_dump -U $env:POSTGRES_USER $env:POSTGRES_DB"
# Run pg_dump and gzip
$bytes = & bash -c "$compose" 2>$null | gzip
[IO.File]::WriteAllBytes((Join-Path $BackupDir $filename), $bytes)

# Prune old backups
$files = Get-ChildItem $BackupDir -Filter 'openvulog-backup-*.sql.gz' | Sort-Object LastWriteTime -Descending
if ($files.Count -gt $Keep) {
    $files | Select-Object -Skip $Keep | Remove-Item
}
Write-Host "[backup] Done -> $BackupDir/$filename"
