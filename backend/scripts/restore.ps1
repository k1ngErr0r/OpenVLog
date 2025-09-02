<#
.SYNOPSIS
    Restore PostgreSQL backup for OpenVulog (PowerShell)
.DESCRIPTION
    Restores a SQL or gzipped SQL dump into the running db container.
.PARAMETER Backup
    Path to backup file (.sql or .sql.gz)
.PARAMETER DbService
    DB service name in docker compose (default 'db')
.PARAMETER ComposeArgs
    Extra compose -f arguments string
#>
param(
    [Parameter(Mandatory=$true)][string]$Backup,
    [string]$DbService = 'db',
    [string]$ComposeArgs = ''
)

$ErrorActionPreference = 'Stop'
if (!(Test-Path $Backup)) { throw "Backup file not found: $Backup" }
Write-Host "[restore] Restoring $Backup"

if ($Backup.EndsWith('.gz')) {
    & bash -c "gunzip -c '$Backup'" | docker compose $ComposeArgs exec -T $DbService psql -U $env:POSTGRES_USER $env:POSTGRES_DB
} else {
    Get-Content -Raw $Backup | docker compose $ComposeArgs exec -T $DbService psql -U $env:POSTGRES_USER $env:POSTGRES_DB
}
Write-Host '[restore] Completed'
