# Abingdon AIx Demo

This repository contains a small full-stack **Notes** demo: a React (Vite) frontend and a Spring Boot API backed by PostgreSQL. It is suitable for local experimentation, workshops, and integration demos.

## What is in the repo

| Path | Description |
|------|-------------|
| `notes-app/frontend` | React 19 + TypeScript + Vite + Tailwind; Markdown viewing/editing |
| `notes-app/backend` | Spring Boot 3.4, Java 17, JPA, REST API under `/api/notes` |
| `notes-app/docker-compose.yml` | PostgreSQL 16 for local development |

## Quick start

1. Start the database (from `notes-app/`): copy `notes-app/.env.example` to `notes-app/.env`, adjust values if needed, then run `docker compose up -d`.
2. Run the API (from `notes-app/backend/`): `./gradlew bootRun`.
3. Run the UI (from `notes-app/frontend/`): `npm install` then `npm run dev`.

Open the URL Vite prints (typically `http://localhost:5173`). The UI expects the API at `http://localhost:8080` unless you set `VITE_API_URL` (see `notes-app/frontend/.env.example`).

## Full documentation

See the **[documentation index](docs/README.md)** for a tutorial, configuration how-tos, API reference, and an architecture overview.
