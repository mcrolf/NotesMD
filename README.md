# NotesMD

**NotesMD** is a small full-stack **Markdown notes** demo: users **register** and **sign in**; notes are stored **per account** behind a JWT-protected REST API backed by PostgreSQL. The UI chrome matches the shipped product name (**NotesMD**). Suitable for local experimentation, workshops, and integration demos.

## What is in the repo

| Path | Description |
|------|-------------|
| `notes-app/frontend` | **React 19** + **TypeScript** + **Vite 8** + **Tailwind CSS 4**; **React Router 7**; **Radix UI** and **shadcn-style** components; **react-markdown** (GFM) for reading/editing notes. Protected routes redirect unauthenticated visitors to `/login`. The notes list lives at **`/notes`**. Uses **BrowserRouter** in the browser and **HashRouter** when packaged for Electron or served from **`file:`**. Optional **Electron** desktop build (`npm run electron:*`). |
| `notes-app/backend` | **Spring Boot 3.4**, **Java 17** (`com.notesmd.notes`): Spring Web, **Spring Data JPA**, Validation, **Spring Security** (stateless JWT), Actuator health; **Flyway** migrations; **PostgreSQL**; **JJWT**. Public: `POST /api/auth/register`, `POST /api/auth/login`. All **`/api/notes`** routes require `Authorization: Bearer <token>`; note access is scoped to the authenticated user (owner). |
| `notes-app/docker-compose.yml` | **PostgreSQL 16** (Alpine) for local development |

## Quick start

1. Start the database (from `notes-app/`): copy `notes-app/.env.example` to `notes-app/.env`, set **strong local values** for `POSTGRES_PASSWORD`, `SPRING_DATASOURCE_PASSWORD` (must match), and **`JWT_SECRET`** (see comments in the example file), then run `docker compose up -d`.
2. Run the API (from `notes-app/backend/`): load the same variables into the environment (see [Environment variables](docs/how-to-configuration-and-troubleshooting.md#environment-variables-security-and-loading)), then `./gradlew bootRun`.
3. Run the UI (from `notes-app/frontend/`): `npm install` then `npm run dev`. Optionally copy `notes-app/frontend/.env.example` to `notes-app/frontend/.env.local` if you need a non-default API URL.
4. Open the URL Vite prints (typically `http://localhost:5173`). **Register or sign in**; after authentication you land on **`/notes`**. Root `/` redirects into the routed app.

The UI expects the API at `http://localhost:8080` unless you set `VITE_API_URL` in `notes-app/frontend/.env.local`. **Never put API secrets in frontend env files** — only `VITE_*` keys, and they are visible in the browser.

## Environment variables

- **Templates (safe to commit):** `notes-app/.env.example`, `notes-app/frontend/.env.example` — placeholders and documentation only.
- **Real values (never commit):** copy to `notes-app/.env`, `notes-app/frontend/.env.local`, etc. These patterns are listed in the repository [`.gitignore`](.gitignore) along with `.cursor/` and `.vscode/`.
- **Details:** [Configuration and troubleshooting — Environment variables](docs/how-to-configuration-and-troubleshooting.md#environment-variables-security-and-loading).

## Full documentation

See the **[documentation index](docs/README.md)** for a tutorial, configuration how-tos, API reference, and architecture notes.
