# Job Tracker

A personal job-application tracker: keep tabs on companies, job postings, applications,
interviews, contacts, and status changes in one place.

- **Backend**: Java 21 / Spring Boot, backed by DynamoDB (run locally via
  [ministack](https://hub.docker.com/r/ministackorg/ministack), a LocalStack-style AWS emulator).
- **Frontend**: React 19 + TypeScript, built with Vite.

## Prerequisites

- Java 21
- Node.js (18+) and npm
- Docker (to run ministack, the local DynamoDB emulator)

## 1. Start ministack (local DynamoDB)

From the repo root:

```bash
docker-compose up -d
```

This starts ministack on `http://localhost:4566`, which the backend uses as its DynamoDB
endpoint (see `backend/job-tracker-backend/src/main/resources/application.properties`).

## 2. Start the backend

```bash
cd backend/job-tracker-backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`. DynamoDB tables are created automatically on
startup (see `TableBootstrapper`).

## 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts on `http://localhost:5173` and talks to the backend at
`http://localhost:8080`.

## Running tests

```bash
# Backend (unit + integration tests; integration tests spin up ministack via Testcontainers)
cd backend/job-tracker-backend
./mvnw test

# Frontend
cd frontend
npm run test:run
```
