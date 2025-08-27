# OpenVLog: Vulnerability Logging and Tracking Tool

OpenVLog is a web-based tool designed for logging and tracking security vulnerabilities. It provides a centralized platform for security teams to manage vulnerabilities, track their status, and ensure they are addressed in a timely manner.

## Project Goals

- Centralized Vulnerability Management
- User-Friendly Interface
- Secure User Authentication
- User Management (Admin Only)
- Containerized Deployment

## Technology Stack

**Frontend:**
- React
- shadcn/ui
- Vite

**Backend:**
- Node.js with Express
- PostgreSQL

**Containerization:**
- Docker
- Docker Compose

## Core Features

- User Authentication (Login/Logout)
- Vulnerability Management (Add, View, Edit, Delete)
- User Management (Add, Delete - Admin Only)

## Setup and Installation

To get OpenVLog up and running on your local machine, follow these steps:

### Prerequisites

- Docker Desktop (or Docker Engine and Docker Compose) installed and running.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd OpenVLog
```

### 2. Build and Run with Docker Compose

From the project root directory, run the following command to build the Docker images and start the services:

```bash
docker-compose up --build
```

This command will:
- Build the backend and frontend Docker images.
- Start the PostgreSQL database container.
- Start the backend API server container.
- Start the frontend web server container.

### 3. Create the Admin User

After the services are up and running, you need to create an initial admin user. Open a **new terminal window** in the project root and run:

```bash
docker-compose exec backend node create_admin.js
```

You should see a message `Admin user created successfully.`

### 4. Access the Application

Once all services are running, you can access the OpenVLog application in your web browser at:

[http://localhost:5173](http://localhost:5173)

Use the following credentials to log in:
- **Username:** `admin`
- **Password:** `admin`

## API Endpoints

The backend API is accessible at `http://localhost:3001`. The frontend is configured to proxy requests to `/api` to the backend.

### Authentication
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Log in and receive a JWT.

### Vulnerabilities
- `GET /api/vulnerabilities`: Get all vulnerabilities (Auth required).
- `GET /api/vulnerabilities/:id`: Get a single vulnerability by ID (Auth required).
- `POST /api/vulnerabilities`: Add a new vulnerability (Auth & Admin required).
- `PUT /api/vulnerabilities/:id`: Update a vulnerability (Auth & Admin required).
- `DELETE /api/vulnerabilities/:id`: Delete a vulnerability (Auth & Admin required).

### User Management
- `GET /api/users`: Get all users (Auth & Admin required).
- `POST /api/users`: Add a new user (Auth & Admin required).
- `DELETE /api/users/:id`: Delete a user (Auth & Admin required).

## Development

### Frontend Development Server

To run the frontend development server (with hot-reloading) separately from Docker Compose:

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

To run the backend development server separately (requires PostgreSQL running and configured):

```bash
cd backend
npm install
npm start
```

Ensure your `DATABASE_URL` environment variable is set correctly if running outside Docker Compose.
