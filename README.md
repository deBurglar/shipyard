# Shipyard 🚢

**A collaborative engineering workspace for teams to plan, track, and manage software development.**

Shipyard is a full-stack project inspired by tools like Linear, Jira, and GitHub Projects. It aims to bring project management, issue tracking, team collaboration, and development workflows into one workspace.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Java 21, Spring Boot |
| Database | PostgreSQL 17 |
| ORM | Spring Data JPA, Hibernate |
| Migrations | Flyway |
| Infrastructure | Docker, Docker Compose |
| API Communication | Axios, REST |

## Current Features

- Dark-themed dashboard with sidebar navigation.
- Frontend-backend connectivity through a health-check API.
- PostgreSQL database integration.
- User and workspace data models.
- Workspace membership with OWNER, ADMIN, and MEMBER roles.
- UUID-based entity identification.
- Database constraints for unique emails and workspace memberships.
- Version-controlled database schema migrations using Flyway.
- Persistence integration tests.

## Architecture

Shipyard follows a **modular monolith architecture**.

The frontend communicates with a Spring Boot REST API, which interacts with PostgreSQL through Spring Data JPA and Hibernate. Flyway manages database schema changes.

## Getting Started

**Prerequisites:** Java 21, Node.js, npm, Docker Desktop, and Git.

### 1. Clone the repository

```bash
git clone https://github.com/deBurglar/shipyard.git
cd shipyard
```

### 2. Start infrastructure

```bash
docker compose -f infrastructure/docker-compose.yml up -d
```

### 3. Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs at `http://localhost:8080`.

Health check: `http://localhost:8080/actuator/health`

### 4. Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Roadmap

- [ ] User registration and authentication (JWT)
- [ ] Workspace creation and invitations
- [ ] Role-based access control
- [ ] Project and issue management
- [ ] Kanban boards and task assignments
- [ ] Comments, activity feeds, and notifications
- [ ] Automated testing and CI/CD

---

**Status:** Active development 🚧

Built as a hands-on exploration of full-stack engineering, backend architecture, database design, and collaborative software systems.
