# NotesMD (backend)

**NotesMD** is a self-hostable **Markdown notes** API: users **register** and **sign in**; notes are stored **per account** behind a JWT-protected REST API backed by PostgreSQL. Suitable for local experimentation, workshops, and production self-hosting.

The **NotesMD client** (React web UI and Electron desktop app) lives in a separate private repository. Download installers from the [Downloads](#downloads) section below, or build the frontend from source if you have access.

## What is in the repo

| Path | Description |
|------|-------------|
| `notes-app/backend` | **Spring Boot 3.4**, **Java 17** (`com.notesmd.notes`): Spring Web, **Spring Data JPA**, Validation, **Spring Security** (stateless JWT), Actuator health; **Flyway** migrations; **PostgreSQL**; **JJWT**. Public: `POST /api/auth/register`, `POST /api/auth/login`. All **`/api/notes`** routes require `Authorization: Bearer <token>`; note access is scoped to the authenticated user (owner). |
| `notes-app/docker-compose.yml` | **PostgreSQL 16** (Alpine) for local development |
| `docs/` | Self-hosting tutorial, configuration how-tos, REST API reference, architecture notes |

## Downloads

Desktop and web client builds are hosted separately (not in this repository). See **[DOWNLOADS.md](DOWNLOADS.md)** for platform links, checksum verification, and setup steps.

| | |
|---|---|
| **Download page** | [notesmd.example.com/download/](https://notesmd.example.com/download/) — reads [`latest.json`](https://notesmd.example.com/downloads/notesmd/latest.json) for current installer URLs |
| **Source (private)** | [notesmd-frontend](https://github.com/mcrolf/notesmd-frontend) — requires repository access |
| **Self-host downloads** | [Host desktop download artifacts](docs/how-to-desktop-download-hosting.md) — configs under [`server/downloads/`](server/downloads/), static page under [`server/website/`](server/website/) |

Replace `notesmd.example.com` with your production hostname. After installing the client, point it at your API URL on **Register** (e.g. `http://localhost:8080` for local dev).

## Quick start

1. Start the database (from `notes-app/`): copy `notes-app/.env.example` to `notes-app/.env`, set **strong local values** for `POSTGRES_PASSWORD`, `SPRING_DATASOURCE_PASSWORD` (must match), and **`JWT_SECRET`** (see comments in the example file), then run `docker compose up -d`.
2. Run the API (from `notes-app/backend/`): copy `notes-app/.env.example` to `notes-app/.env`, set **strong local values** for `POSTGRES_PASSWORD`, `SPRING_DATASOURCE_PASSWORD` (must match), and **`JWT_SECRET`** (see comments in the example file), start Postgres with `docker compose up -d` from `notes-app/`, then `./run.sh`.
3. Install the **NotesMD client** (desktop app or dev build from the frontend repo) and open **Register**. Enter your API origin (e.g. `http://localhost:8080`), create an account, and start taking notes.

## Environment variables

- **Templates (safe to commit):** `notes-app/.env.example` — placeholders and documentation only.
- **Real values (never commit):** copy to `notes-app/.env`. These patterns are listed in the repository [`.gitignore`](.gitignore) along with `.cursor/` and `.vscode/`.
- **Details:** [Configuration and troubleshooting — Environment variables](docs/how-to-configuration-and-troubleshooting.md#environment-variables-security-and-loading).

## Full documentation

See the **[documentation index](docs/README.md)** for a tutorial, configuration how-tos, API reference, and architecture notes.

## Frontend repository

The React + Electron client is maintained separately. API contract and CORS requirements are documented here so any client (official app, custom UI, mobile) can integrate:

- [REST API reference](docs/reference-rest-api-and-configuration.md)
- [Self-host the API and connect a client](docs/how-to-configuration-and-troubleshooting.md#self-host-the-api-and-connect-the-frontend)

## License

This API and self-hosting materials are released under the [MIT License](LICENSE).
