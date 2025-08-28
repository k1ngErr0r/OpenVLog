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

- Docker Desktop (or Docker Engine and Docker Compose) installed and running.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd OpenVLog
```

### 2. Configure Environment Variables

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
- `POST /api/auth/login`: Log in and receive a JWT.

### Vulnerabilities
- `GET /api/vulnerabilities`: Get all vulnerabilities.
- `GET /api/vulnerabilities/:id`: Get a single vulnerability by ID.
- `POST /api/vulnerabilities`: Add a new vulnerability (Admin only).
- `PUT /api/vulnerabilities/:id`: Update a vulnerability (Admin only).
- `DELETE /api/vulnerabilities/:id`: Delete a vulnerability (Admin only).

### User Management
- `GET /api/users`: Get all users (Admin only).
- `POST /api/users`: Add a new user (Admin only).
- `DELETE /api/users/:id`: Delete a user (Admin only).

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

## Environment Variables

See `.env.example` for a complete list with defaults. Key variables:

| Variable | Description |
|----------|-------------|
| POSTGRES_USER | Postgres username (container) |
| POSTGRES_PASSWORD | Postgres password |
| POSTGRES_DB | Database name |
| DATABASE_URL | Connection string used by backend & scripts |
| JWT_SECRET | Secret for signing JWT tokens |
| ADMIN_USER | (Legacy) Bootstrap admin username for `create_admin.js` fallback |
| ADMIN_PASSWORD | (Legacy) Bootstrap admin password for `create_admin.js` fallback |
| VITE_API_BASE_URL | API base URL injected at frontend build |

## Health Check

Backend exposes `GET /healthz` returning JSON: `{ status: 'ok', uptime, latency_ms }` (500 on failure). The database connectivity is probed with a simple `SELECT 1`.

Example:
```bash
curl -s http://localhost:3001/healthz | jq
```

Nginx (frontend container) also serves a lightweight `/healthz` endpoint for container orchestration probes.

## Container Build Improvements

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
