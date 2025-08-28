# OpenVLog: Vulnerability Logging and Tracking Tool

OpenVLog is a web-based tool designed for logging and tracking security vulnerabilities. It provides a centralized platform for security teams to manage vulnerabilities, track their status, and ensure they are addressed in a timely manner.

## Features

- **Modern UI/UX:** A clean and intuitive interface built with React and shadcn/ui.
- **Collapsible Sidebar:** For easy navigation.
- **Interactive Data Tables:** With sorting, filtering, and pagination for vulnerabilities and users.
- **Secure Authentication:** Using JWT for user authentication.
- **Role-Based Access Control:** With admin and user roles.
- **Containerized Deployment:** With Docker and Docker Compose for easy setup and deployment.
- **Modular Backend:** A well-structured backend built with Node.js and Express.
- **Swagger API Docs:** Interactive OpenAPI docs at `/api-docs` (backend) for quick exploration & testing.
- **Comments & Discussion:** Threaded comments per vulnerability with username attribution.
- **File Attachments:** Upload supporting evidence (logs, PoCs) to vulnerabilities (admins) and download / delete.
- **Dashboard Visualizations:** Severity & status distributions plus recent items and date-range filtering.
- **In-App Notifications:** Polling notifications for vulnerability status changes.
- **Password Reset & Account Lockout:** Self-service password reset token flow and automatic lockout on repeated failed logins.
- **CSV Export:** One‑click export of filtered vulnerabilities list to CSV for external reporting.

## Technology Stack

**Frontend:**
- React
- shadcn/ui
- Vite
- TypeScript
- Tailwind CSS

**Backend:**
- Node.js with Express
- PostgreSQL

**Containerization:**
- Docker
- Docker Compose

## Setup and Installation

To get OpenVLog up and running on your local machine, follow these steps:

### Prerequisites
 - `POST /api/auth/request-password-reset`: Initiate a password reset (response is generic; in non-production returns token for manual testing).
 - `POST /api/auth/reset-password`: Reset password using `{ token, password }`.

 Account Lockout:
 - After `AUTH_LOCK_MAX_ATTEMPTS` consecutive failed logins (default 5) the account is locked for `AUTH_LOCK_DURATION_MIN` minutes (default 15).
 - While locked, login attempts return HTTP 423 `LOCKED` (metrics + logs record blocked attempts). Expired locks auto-clear on next attempt.

 Password Reset Flow (current development mode):
 1. Client posts `{ username }` to `/api/auth/request-password-reset`.
 2. If the user exists a token row is created (hashed in DB); in non-production the plaintext token is returned to facilitate manual testing until email delivery is integrated.
 3. Client posts `{ token, password }` to `/api/auth/reset-password` to update the password (token single-use, expires after TTL—default 30 minutes).
 4. On success old refresh tokens are not invalidated automatically yet (future improvement: token versioning / rotation).
```bash
cd OpenVLog
```

### 2. Configure Environment Variables

	- `auth_lockout_triggered_total`
	- `auth_lockout_blocked_total`
	- `auth_password_reset_requested_total`
	- `auth_password_reset_completed_total`
	- `auth_password_reset_failed_total`
Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in the required environment variables.

### 3. Build and Run with Docker Compose

From the project root directory, run the following command to build the Docker images and start the services:

```bash
docker-compose up --build
```

### 4. First-Run Web Setup (Admin User)

When the application starts with an empty `users` table, navigating to the frontend will automatically redirect you to an **Initial Setup** page. Provide a username and strong password to create the first administrator. Afterwards you'll be redirected to the login page.

 | AUTH_LOCK_MAX_ATTEMPTS | Failed logins before lockout (default 5) |
 | AUTH_LOCK_DURATION_MIN | Lockout duration minutes (default 15) |
 | PASSWORD_RESET_TTL_MIN | Password reset token lifetime minutes (default 30) |
If the setup page does not appear (e.g., database was partially initialized) or you prefer a CLI method, you can still use the legacy script:

```bash
docker-compose exec backend node create_admin.js
```

### 5. Access the Application

Once all services are running (and initial admin is created), access OpenVLog at:

[http://localhost:5173](http://localhost:5173)

Log in with the credentials you created during the setup step (or via the script fallback).

## API Endpoints

The backend API is accessible at `http://localhost:3001`.

### Authentication
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Log in and receive `{ token, user }` where `user = { id, username, isAdmin }`.
- `POST /api/auth/refresh`: Uses httpOnly refresh cookie; returns `{ token, user }`.
- `GET /api/auth/me`: Returns the current authenticated user `{ id, username, isAdmin }`.
- `POST /api/auth/logout`: Invalidates refresh cookie (client also clears cached `{ token, user }`).
- `POST /api/auth/request-password-reset`: Initiate password reset (generic response; in non-production returns token once created for manual testing).
- `POST /api/auth/reset-password`: Reset password via `{ token, password }` (single-use token, hashed server-side).

Password Reset UI: Accessible via links on the login page ("Forgot password?" and "Reset now"). Request page collects username; reset page accepts token + new password (enforces strong policy).

Account Lockout: After `AUTH_LOCK_MAX_ATTEMPTS` consecutive failures, account locks for `AUTH_LOCK_DURATION_MIN` minutes (HTTP 423). Metrics & logs capture events.

### Vulnerabilities
- `GET /api/vulnerabilities`: Get all vulnerabilities OR (when query params supplied) a paginated/filtering result object.
- `GET /api/vulnerabilities/:id`: Get a single vulnerability by ID.
- `POST /api/vulnerabilities`: Add a new vulnerability (Admin only).
- `PUT /api/vulnerabilities/:id`: Update a vulnerability (Admin only).
- `DELETE /api/vulnerabilities/:id`: Delete a vulnerability (Admin only).
- UI automatically hides create/delete actions for non‑admin users.
- `GET /api/vulnerabilities/export`: Export filtered vulnerabilities as CSV (same filters as list; no pagination; requires auth).

Allowed field values:
- severity: `Critical`, `High`, `Medium`, `Low`, `Informational`
- status: `Open`, `In Progress`, `Resolved`, `Closed`

Pagination & Filtering (optional query parameters):
```
GET /api/vulnerabilities?page=1&pageSize=20&severity=High&status=Open&search=sql
```
Parameters:
- `page` (default 1)
- `pageSize` (default 20, max 100)
- `severity` (must be valid constant)
- `status` (must be valid constant)
- `search` (case-insensitive search over name & description)
- `dateFrom` (YYYY-MM-DD inclusive lower bound on creation date)
- `dateTo` (YYYY-MM-DD inclusive upper bound on creation date)

If any pagination/filter parameter is present the response shape becomes:
```
{
	data: [...],
	page: 1,
	pageSize: 20,
	total: 57,
	totalPages: 3
}
```
If no parameters are provided the legacy array response is preserved for simplicity/compatibility.

CSV Export:
```
GET /api/vulnerabilities/export?severity=High&status=Open&search=sql&dateFrom=2025-01-01&dateTo=2025-08-31
```
Response: `text/csv` attachment `vulnerabilities.csv` with columns: id,name,description,severity,status,reported_at,updated_at.
Frontend: Use the "Export CSV" button on the Dashboard (respects current filter controls including date range & search). Sorting parameter (`sort=field:DIR`) is honored for ordering.

### Vulnerability Comments

- `GET /api/vulnerabilities/:id/comments`: List comments (chronological) with `id, body, created_at, user_id, username`.
- `POST /api/vulnerabilities/:id/comments`: Add a comment (authenticated users). Body: `{ body: "text" }`.

Frontend: Comments appear on the vulnerability detail page with optimistic posting and username display.

### Vulnerability Attachments

- `GET /api/vulnerabilities/:id/attachments`: List attachments (admins and regular users can view list & download; uploads restricted to admins by route guard).
- `POST /api/vulnerabilities/:id/attachments`: (Admin) `multipart/form-data` with field `attachment` (<=10MB) to upload supporting file. Stored with unique filename; original name preserved.
- `GET /api/attachments/:attachmentId/download`: Download binary content.
- `DELETE /api/attachments/:attachmentId`: (Admin) Delete attachment (DB + filesystem cleanup).

Security Notes: Filenames are randomized; only whitelisted path usage (no user-controlled directory elements). Consider future MIME/type validation & AV scanning for production hardening.

### Notifications

In-app notifications endpoint (polling) supplies recent events such as vulnerability status changes. Frontend polls periodically and displays a badge in the UI. (Future enhancement: migrate to WebSockets or Server-Sent Events.)

### User Management
- `GET /api/users`: Get all users OR (with query params) paginated results (Admin only).
- `POST /api/users`: Add a new user (Admin only).
- `DELETE /api/users/:id`: Delete a user (Admin only).
	(Non‑admins will not see the Add User button.)

User pagination & search (optional):
```
GET /api/users?page=1&pageSize=20&search=alice
```
Response (when paginated):
```
{ data: [...], page, pageSize, total, totalPages }
```
If no pagination params are present the legacy array is returned.

## Development

### Frontend Development Server

To run the frontend development server (with hot-reloading):

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

To run the backend development server (requires PostgreSQL running and configured):

```bash
cd backend
npm install
npm start
```

### Developer Convenience (Makefile & Root Scripts)

You can use GNU Make (macOS/Linux; on Windows install via Chocolatey or use WSL) or the root `package.json` scripts to speed up common tasks.

Make targets (from project root):
```
make bootstrap   # Install backend & frontend dependencies
make build       # Build all docker images
make up          # Start the full stack detached
make down        # Stop containers
make restart     # Down + up
make logs        # Follow backend logs
make migrate     # Run backend migrations if migrate.js exists
make backend-shell  # Interactive shell in backend container
make frontend-shell # Interactive shell in frontend container
make clean       # Down + remove volumes & orphans
make prune       # Docker system prune (dangling)
```

Equivalent npm scripts (cross‑platform friendly):
```
npm run bootstrap
npm run build
npm run up
npm run down
npm run restart
npm run logs
npm run migrate
npm run backend:shell
npm run frontend:shell
npm run clean
npm run prune
```

### Local HTTPS (Planned)

Run `npm run tls:hint` (or `node scripts/dev/tls.js`) for step‑by‑step instructions using `mkcert` and Traefik to enable HTTPS locally. This script does not generate certificates automatically; it guides you to:
1. Install `mkcert` and trust the local CA.
2. Generate `certs/local-cert.pem` and `certs/local-key.pem`.
3. Mount `./certs` into the Traefik container and reference the cert/key in its TLS configuration.
4. Switch `FRONTEND_ORIGIN` & `VITE_API_BASE_URL` to `https://localhost`.

Ensure `certs/` is added to `.gitignore` (script will suggest if missing).

## Environment Variables

See `.env.example` for a complete list with defaults. Key variables:

| Variable | Description |
|----------|-------------|
| POSTGRES_USER | Postgres username (container) |
| POSTGRES_PASSWORD | Postgres password |
| POSTGRES_DB | Database name |
| DATABASE_URL | Connection string used by backend & scripts |
| JWT_SECRET | Secret for signing JWT tokens |
| JWT_REFRESH_SECRET | Secret for signing refresh JWT tokens (different from JWT_SECRET) |
| ADMIN_USER | (Legacy) Bootstrap admin username for `create_admin.js` fallback |
| ADMIN_PASSWORD | (Legacy) Bootstrap admin password for `create_admin.js` fallback |
| VITE_API_BASE_URL | API base URL injected at frontend build |
| FRONTEND_ORIGIN | Allowed origin for CORS (defaults to http://localhost:5173) |
| LOG_LEVEL | Log verbosity (default: info) |
| LOG_TO_FILE | Enable file logging (true/false, default true) |
| LOG_DIR | Directory for log files (default: logs) |
| LOG_FILE | Log filename (default: app.log) |
| LOG_ROTATE | Enable daily log rotation (default: false) |
| LOG_ROTATE_MAX_SIZE | Max size before rotation when enabled (default: 5m) |
| LOG_ROTATE_MAX_FILES | Retention (e.g., 14d, 10 files) (default: 14d) |

Logging behavior:
- Console logging always enabled.
- File logging defaults to enabled only in production (set `LOG_TO_FILE=true` to force, `false` to disable).
- When `LOG_ROTATE=true`, rotated files are created daily (pattern `app-YYYY-MM-DD.log`) with gzip compression and retention governed by `LOG_ROTATE_MAX_FILES`.

### Logging Examples

Enable rotation in production (example `.env` snippet):
```
NODE_ENV=production
LOG_TO_FILE=true
LOG_ROTATE=true
LOG_ROTATE_MAX_SIZE=10m
LOG_ROTATE_MAX_FILES=30d
```

Disable file logging in local development:
```
LOG_TO_FILE=false
```

Mount persistent log volume (already configured in `docker-compose.yml`):
```
docker compose up -d
docker compose exec backend ls -l /app/logs
```
Inspect recent log (non-rotated mode):
```
docker compose exec backend tail -f /app/logs/app.log
```

## Health Check

Backend exposes `GET /healthz` returning JSON: `{ status: 'ok', uptime, latency_ms }` (500 on failure). The database connectivity is probed with a simple `SELECT 1`.

Readiness endpoint `GET /readyz` returns `{ status: 'ready' }` only after migrations table exists (503 otherwise). Cached for 10s to reduce DB load.

### Container-Level Health Checks

Runtime health is enforced at the container layer as well:

- **Backend container**: Docker `HEALTHCHECK` (see `backend/Dockerfile`) periodically curls `/healthz`. A failing probe marks the container `unhealthy`, enabling orchestrators or compose restarts.
- **PostgreSQL service**: `docker-compose.yml` defines a healthcheck using `pg_isready`. Backend's `depends_on` uses `condition: service_healthy` so the API only starts after Postgres accepts connections.
- **Effect**: Reduces noisy startup failures (e.g., transient DB connection errors) and provides clearer operational signals (`docker ps` shows healthy state).

Operational tip: To inspect health statuses quickly run:
```
docker compose ps
```

If you add Traefik or other services, you can mirror this pattern with simple curl or script-based health checks to coordinate startup order.

Example:
```bash
curl -s http://localhost:3001/healthz | jq
```

Nginx (frontend container) also serves a lightweight `/healthz` endpoint for container orchestration probes.

## Container Build Improvements
## Optional Traefik HTTPS Reverse Proxy

For production you can enable automatic HTTPS and clean hostnames using Traefik. A sample `docker-compose.traefik.yml` override is provided.

Environment additions (example):
```
ACME_EMAIL=you@example.com
APP_HOST=app.example.com
API_HOST=api.example.com
```

Run with:
```
docker compose -f docker-compose.yml -f docker-compose.traefik.yml up -d
```

Notes:
- Remove direct `ports` from frontend/backend in primary compose when promoting to production; only expose Traefik.
- Ensure DNS A records for APP_HOST and API_HOST point to the server.
- After HTTPS is active, consider setting cookie `secure` flag unconditionally and tightening `SameSite`.
- Local development with Traefik can use mkcert/self-signed certs; for simplicity you may keep current direct ports in dev.

### Production Port Removal
Use the provided `docker-compose.prod.yml` to remove direct host port exposure for `backend` and `frontend` when Traefik is fronting the stack:

```
docker compose -f docker-compose.yml -f docker-compose.traefik.yml -f docker-compose.prod.yml up -d
```

### Rate Limiting
Basic edge rate limiting is enabled via Traefik labels (`average=20, burst=40`). Adjust in `docker-compose.traefik.yml` as needed.

Additionally, a lightweight in-app per-IP limiter protects `/api/auth/login` and `/api/auth/refresh` to slow password spraying. Configure via env:
```
AUTH_RATE_WINDOW_MS=60000      # time window (default 60000)
AUTH_RATE_MAX_ATTEMPTS=10      # allowed attempts within window (default 10)
```
Exceeding limits returns `429 Too Many Requests`.

### Metrics
Backend exposes Prometheus metrics at `/metrics` including:
- Default Node/process metrics.
- Histogram: `http_request_duration_seconds{method,route,code}`.
- Auth counters:
	- `auth_login_success_total`
	- `auth_login_failure_total`
	- `auth_refresh_success_total`
	- `auth_refresh_failure_total`
	- `auth_logout_total`
	- `auth_lockout_triggered_total`
	- `auth_lockout_blocked_total`
	- `auth_password_reset_requested_total`
	- `auth_password_reset_completed_total`
	- `auth_password_reset_failed_total`

Scrape via backend service or via Traefik (`/metrics`). Traefik Prometheus metrics also enabled (entrypoint/service labels). Consider restricting exposure (IP filtering / auth) in production.

### Hardened CSP
Content Security Policy now excludes `'unsafe-inline'` by default. To temporarily allow inline scripts/styles (e.g., during migration) set `ALLOW_INLINE_CSP=true` in environment.

### Secure Cookies
Refresh token cookie is now always set with `secure: true`; ensure all deployments use HTTPS (Traefik or other TLS terminator) to avoid losing the cookie over HTTP.

### Backups
Scripts are provided under `backend/scripts` for PostgreSQL logical backups.

Shell (Linux/macOS WSL):
```
BACKUP_DIR=./backups ./backend/scripts/backup.sh
BACKUP=./backups/openvlog-backup-20240101-000000.sql.gz ./backend/scripts/restore.sh
```

PowerShell (Windows):
```
./backend/scripts/backup.ps1 -BackupDir ./backups
./backend/scripts/restore.ps1 -Backup ./backups/openvlog-backup-20240101-000000.sql.gz
```

Environment requirements: `POSTGRES_USER`, `POSTGRES_DB` must be exported (compose loads them). Adjust `DB_SERVICE` or `-DbService` if your service name differs.

Rotation: Backup scripts retain most recent 14 backups by default (`KEEP` / `-Keep`).

Automated backups: A `backup-cron` service runs (default 02:00 daily) when using the Traefik compose. Configure:
```
BACKUP_CRON_SCHEDULE="0 3 * * *"   # schedule
BACKUP_KEEP=30                      # retention count
```

### Migrations
Simple SQL migrations under `backend/migrations` applied via:
```
docker compose exec backend npm run migrate
```
Migration state tracked in `_migrations` table (idempotent). `/readyz` depends on this state.

### Access Logging & Graceful Shutdown
Structured access logs emitted (`http.access`) with: requestId, method, path, status, duration_ms, ip. On SIGTERM/SIGINT server drains connections, closes DB pool, then exits.

## Swagger / API Documentation

Navigate to `http://localhost:3001/api-docs` for interactive OpenAPI documentation (auto-generated from JSDoc annotations in route files). You can authorize with a JWT (Bearer token) to call protected endpoints directly. Keep in mind: file upload endpoints require `multipart/form-data` selection.

## Roadmap / Future Enhancements

- Refresh token invalidation (token versioning) on password reset
- Real-time notifications (WebSocket/SSE) replacing polling
- Attachment MIME validation & optional antivirus scanning
- Storybook component library & visual regression tests
- Email delivery for password reset tokens
- Audit log of administrative actions

### Static Asset Caching & Compression
Traefik applies compression and long-lived cache headers (`Cache-Control: public,max-age=31536000,immutable`) to frontend assets via middleware labels.


Backend Dockerfile now uses a multi-stage build with `npm ci --omit=dev` on Alpine for a smaller image and reproducible installs.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

### Development Guidelines

- **Code Style:** Follow the existing code style.
- **Commit Messages:** Use conventional commit messages.
- **Testing:** Add tests for new features.
- **Documentation:** Keep the documentation up to date.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
