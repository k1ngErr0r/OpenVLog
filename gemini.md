# OpenVLog: Vulnerability Logging and Tracking Tool

OpenVLog is a web-based tool designed for logging and tracking security vulnerabilities. It provides a centralized platform for security teams to manage vulnerabilities, track their status, and ensure they are addressed in a timely manner.

## Features

- **Modern UI/UX:** A clean and intuitive interface built with React and shadcn/ui.
- **Dashboard with Visualizations:** Get an at-a-glance overview of vulnerabilities with charts for severity and status.
- **Advanced Filtering and Search:** Drill down into vulnerability data with filters for date range, severity, status, and free-text search.
- **File Attachments:** Upload and manage evidence files (screenshots, logs) for each vulnerability.
- **In-App Notifications:** Receive real-time alerts for important events, such as vulnerability status changes.
- **Interactive Data Tables:** With sorting, filtering, and pagination for vulnerabilities and users.
- **Secure Authentication:** Using JWT for user authentication.
- **Role-Based Access Control:** With admin and user roles.
- **Generated API Documentation:** Interactive API documentation powered by Swagger/OpenAPI.
- **Containerized Deployment:** With Docker and Docker Compose for easy setup and deployment.

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

## API Documentation

Interactive API documentation is available through Swagger UI. Once the application is running, you can access it at:

[http://localhost:3001/api-docs](http://localhost:3001/api-docs)

## API Endpoints

The backend API is accessible at `http://localhost:3001`.

### Authentication
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Log in and receive `{ token, user }` where `user = { id, username, isAdmin }`.
- `POST /api/auth/refresh`: Uses httpOnly refresh cookie; returns `{ token, user }`.
- `GET /api/auth/me`: Returns the current authenticated user `{ id, username, isAdmin }`.
- `POST /api/auth/logout`: Invalidates refresh cookie (client also clears cached `{ token, user }`).

### Vulnerabilities
- `GET /api/vulnerabilities`: Get all vulnerabilities with pagination and filtering.
- `GET /api/vulnerabilities/stats`: Get statistics for dashboard widgets.
- `GET /api/vulnerabilities/:id`: Get a single vulnerability by ID.
- `POST /api/vulnerabilities`: Add a new vulnerability (Admin only).
- `PUT /api/vulnerabilities/:id`: Update a vulnerability (Admin only).
- `DELETE /api/vulnerabilities/:id`: Delete a vulnerability (Admin only).

**Filtering Parameters for `GET /api/vulnerabilities`**:
- `page`, `pageSize`: For pagination.
- `severity`, `status`: Filter by specific values.
- `search`: Case-insensitive search over name & description.
- `dateFrom`, `dateTo`: Filter by a date range (YYYY-MM-DD).

### Attachments
- `GET /api/vulnerabilities/:vulnerabilityId/attachments`: List attachments for a vulnerability.
- `POST /api/vulnerabilities/:vulnerabilityId/attachments`: Upload an attachment for a vulnerability.
- `GET /api/attachments/:attachmentId/download`: Download a specific attachment.
- `DELETE /api/attachments/:attachmentId`: Delete an attachment (Admin only).

### Notifications
- `GET /api/notifications`: Get notifications for the current user.
- `POST /api/notifications/:notificationId/read`: Mark a specific notification as read.
- `POST /api/notifications/read-all`: Mark all of a user's notifications as read.

### User Management
- `GET /api/users`: Get all users with pagination and search (Admin only).
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

See `.env.example` for a complete list with defaults.

## Health Check

Backend exposes `GET /healthz` and `GET /readyz` endpoints for health and readiness probes.

## Container Build Improvements

Details on production deployment with Traefik, rate limiting, metrics, backups, and more are available in the `docker-compose.*.yml` files and throughout the codebase.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
