# Contributing to Co-Learn — Adaptive Learning System

Thank you for contributing to the Co-Learn Adaptive Learning System!
This document provides guidelines for development workflow, branch naming, and local setup.

---

## Branch Naming Convention

| Prefix               | Use Case                                | Example                             |
|-----------------------|-----------------------------------------|-------------------------------------|
| `phase/X-description` | Phased development milestones           | `phase/1-quiz-engine`               |
| `feat/description`    | New features                            | `feat/ai-tutor-chat`                |
| `fix/description`     | Bug fixes                               | `fix/enrollment-duplicate`          |
| `refactor/description`| Code refactoring (no behavior change)   | `refactor/lombok-models`            |
| `docs/description`    | Documentation only                      | `docs/api-endpoints`                |
| `test/description`    | Adding or updating tests                | `test/auth-controller-unit`         |

**Rules:**
- Use lowercase with hyphens (kebab-case).
- Keep descriptions short but descriptive.
- Always branch from `main`.

---

## Local Setup

### Prerequisites

| Tool     | Version  |
|----------|----------|
| Java     | 21+      |
| Node.js  | 22+      |
| MySQL    | 8.0+     |
| Maven    | 3.9+ (wrapper included) |

### 1. Clone the repository

```bash
git clone https://github.com/your-org/adaptive-learning-system.git
cd adaptive-learning-system
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your local database credentials and a JWT secret (minimum 32 characters).

### 3. Start MySQL

Ensure MySQL is running on `localhost:3306`. The database `adaptive_learning_db` will be created automatically on first run.

### 4. Run the backend

```bash
./mvnw spring-boot:run
```

The backend starts on [http://localhost:8080](http://localhost:8080).

### 5. Run the frontend (dev mode)

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server starts on [http://localhost:5173](http://localhost:5173).

---

## Development Workflow

1. Create a branch following the naming convention above.
2. Make your changes with clear, atomic commits.
3. Ensure the backend compiles: `./mvnw clean package -DskipTests`
4. Ensure the frontend builds: `cd frontend && npm run build`
5. Open a Pull Request against `main`.
6. Request review from at least one team member.

---

## Code Style

- **Backend:** Follow standard Java conventions. Lombok is used for models — do not write manual getters/setters.
- **Frontend:** TypeScript with React. Use functional components and hooks.
- **Commits:** Use conventional commit messages when possible (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`).

---

## Project Structure

```
adaptive-learning-system/
├── src/main/java/dz/edu/univconstantine2/ntic/als/
│   ├── config/          # Security, CORS, exception handling
│   ├── controller/      # REST API controllers
│   ├── dto/             # Data Transfer Objects
│   ├── model/           # JPA entities (Lombok-annotated)
│   ├── repository/      # Spring Data JPA repositories
│   ├── service/         # Business logic
│   └── util/            # Utilities (JWT, etc.)
├── src/main/resources/
│   └── application.properties
├── frontend/            # React + TypeScript (Vite)
├── .env.example         # Required environment variables
├── .github/workflows/   # CI pipeline
└── pom.xml              # Maven build configuration
```

---

## Questions?

Open a GitHub Issue or contact the project maintainers at University of Constantine 2, NTIC Department.
