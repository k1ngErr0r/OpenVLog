This document outlines the plan for creating a web-based vulnerability logging and tracking tool. The project will be developed using a modern technology stack and deployed as a Docker container, making it easy to set up and run.

1. Project Overview and Goals
The primary goal of this project is to create a simple, user-friendly dashboard for logging and tracking security vulnerabilities. This tool will provide a centralized platform for security teams to manage vulnerabilities, track their status, and ensure they are addressed in a timely manner.

Key Goals:

Centralized Vulnerability Management: A single place to record and manage all identified vulnerabilities.

User-Friendly Interface: An intuitive dashboard that is easy to navigate and use.

Secure User Authentication: A login system to ensure that only authorized users can access the tool.

User Management: The ability for an admin to add and remove users.

Containerized Deployment: The application will be packaged as a Docker image for easy deployment and scalability.

2. Technology Stack
The project will be built using the following technologies:

Frontend:

React: A popular JavaScript library for building user interfaces.

shadcn/ui: A collection of beautifully designed, accessible, and customizable React components.

Vite: A fast and modern build tool for web development.

Backend:

Node.js with Express: A lightweight and flexible web framework for building the backend API.

PostgreSQL: A powerful, open-source relational database for storing vulnerability and user data.

Containerization:

Docker: A platform for developing, shipping, and running applications in containers.

Docker Compose: A tool for defining and running multi-container Docker applications.

Version Control:

Git and GitHub: For source code management and collaboration.

3. Core Features
The initial version of the tool will focus on the following core features:

User Authentication:

A login page for users to authenticate.

A default admin account for initial setup.

JWT (JSON Web Tokens) for secure authentication.

Dashboard:

A main dashboard to display a list of all logged vulnerabilities.

The ability to view key details of each vulnerability, such as severity, status, and date reported.

Vulnerability Management:

A form to add new vulnerabilities with details like name, description, severity, and status.

The ability to edit and update existing vulnerabilities.

The ability to delete vulnerabilities.

User Management (Admin Only):

A separate section in the dashboard for the admin to manage users.

The ability to add new users with a username and password.

The ability to remove existing users.

4. Project Phases and Timeline
I recommend breaking down the project into the following phases to make it more manageable:

Phase 1: Project Setup and Backend (1-2 weeks)

[ ] Set up the project repository on GitHub.

[ ] Create the project structure with separate directories for the frontend and backend.

[ ] Set up the Docker environment with docker-compose.yml for the backend and Postgres database.

[ ] Design the database schema for vulnerabilities and users.

[ ] Implement the backend API with endpoints for user authentication and CRUD operations for vulnerabilities.

Phase 2: Frontend Development and Dashboard (2-3 weeks)

[ ] Set up the React project with Vite and shadcn/ui.

[ ] Create the login page and implement the authentication flow.

[ ] Build the main dashboard to display vulnerabilities from the backend.

[ ] Create the forms for adding and editing vulnerabilities.

[ ] Implement the user management interface for the admin.

Phase 3: Integration and Deployment (1 week)

[ ] Connect the frontend to the backend API.

[ ] Thoroughly test the application to ensure all features are working as expected.

[ ] Create a Dockerfile for the frontend to build a production-ready image.

[ ] Write a README.md file with instructions on how to set up and run the project using Docker Compose.

[ ] Publish the Docker image to Docker Hub for easy distribution.

5. Deployment Strategy
The application will be deployed using Docker, which provides a consistent and reproducible environment.

Local Development: Use docker-compose up to run the entire application stack (frontend, backend, and database) on your local machine.

Production Deployment: The application can be deployed to any cloud provider that supports Docker (e.g., AWS, Google Cloud, DigitalOcean). You can run the application on a single server or use a container orchestration platform like Kubernetes for more advanced deployments.

README details:

OpenVLog: Vulnerability Logging and Tracking Tool
OpenVLog is a web-based tool designed for logging and tracking security vulnerabilities. It provides a centralized platform for security teams to manage vulnerabilities, track their status, and ensure they are addressed in a timely manner.

Features
Modern UI/UX: A clean and intuitive interface built with React and shadcn/ui.
Collapsible Sidebar: For easy navigation.
Interactive Data Tables: With sorting, filtering, and pagination for vulnerabilities and users.
Secure Authentication: Using JWT for user authentication.
Role-Based Access Control: With admin and user roles.
Containerized Deployment: With Docker and Docker Compose for easy setup and deployment.
Modular Backend: A well-structured backend built with Node.js and Express.
Technology Stack
Frontend:

React
shadcn/ui
Vite
TypeScript
Tailwind CSS
Backend:

Node.js with Express
PostgreSQL
Containerization:

Docker
Docker Compose
Setup and Installation
To get OpenVLog up and running on your local machine, follow these steps:

Prerequisites
Docker Desktop (or Docker Engine and Docker Compose) installed and running.
1. Clone the Repository
git clone <your-repository-url>
cd OpenVLog
2. Configure Environment Variables
Create a .env file in the root of the project by copying the example file:

cp .env.example .env
Now, open the .env file and fill in the required environment variables.

3. Build and Run with Docker Compose
From the project root directory, run the following command to build the Docker images and start the services:

docker-compose up --build
4. Create the Admin User
After the services are up and running, you need to create an initial admin user. Open a new terminal window in the project root and run:

docker-compose exec backend node create_admin.js
You should see a message Admin user created successfully.

5. Access the Application
Once all services are running, you can access the OpenVLog application in your web browser at:

http://localhost:5173

Log in with the admin credentials you set in the .env file.

API Endpoints
The backend API is accessible at http://localhost:3001.

Authentication
POST /api/auth/register: Register a new user.
POST /api/auth/login: Log in and receive a JWT.
Vulnerabilities
GET /api/vulnerabilities: Get all vulnerabilities.
GET /api/vulnerabilities/:id: Get a single vulnerability by ID.
POST /api/vulnerabilities: Add a new vulnerability (Admin only).
PUT /api/vulnerabilities/:id: Update a vulnerability (Admin only).
DELETE /api/vulnerabilities/:id: Delete a vulnerability (Admin only).
User Management
GET /api/users: Get all users (Admin only).
POST /api/users: Add a new user (Admin only).
DELETE /api/users/:id: Delete a user (Admin only).
Development
Frontend Development Server
To run the frontend development server (with hot-reloading):

cd frontend
npm install
npm run dev
Backend Development
To run the backend development server (requires PostgreSQL running and configured):

cd backend
npm install
npm start
Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue.

Development Guidelines
Code Style: Follow the existing code style.
Commit Messages: Use conventional commit messages.
Testing: Add tests for new features.
Documentation: Keep the documentation up to date.
License
This project is licensed under the MIT License. See the LICENSE file for details.
