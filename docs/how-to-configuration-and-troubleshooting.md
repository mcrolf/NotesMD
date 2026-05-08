# How-to: Configuration and troubleshooting

Problem-oriented recipes for running and integrating the Notes demo.

---

## Environment variables (security and loading)

**What gets committed**

- Only **`.env.example`** files belong in Git. They contain **placeholders and documentation**, never real passwords or production JWT secrets.
- **`.env`**, **`.env.local`**, and other local env files are **gitignored** (see the repository [`.gitignore`](../.gitignore)). The same ignore rules cover **`.cursor/`** and **`.vscode/`** so editor paths and secrets stay local.

**Backend (`notes-app/.env`)**

- Used by **Docker Compose** for Postgres when you run `docker compose` from `notes-app/` (variable substitution in `docker-compose.yml`).
- **Spring Boot does not load this file automatically.** Before `./gradlew bootRun`, export variables from `.env`, for example from `notes-app/`:

  ```bash
  set -a && source .env && set +a && cd backend && ./gradlew bootRun
  ```

  Or paste equivalent keys into your IDE run configuration.

- Required for a normal local run: **`JWT_SECRET`** (≥ 32 bytes of entropy in practice — generate with `openssl rand -base64 48`), plus **`SPRING_DATASOURCE_*`** matching your Postgres container.

**Frontend (`notes-app/frontend/`)**

- Prefer **`.env.local`** (copy from `frontend/.env.example`) for `VITE_*` variables.
- **Never put database passwords or JWT signing keys in the frontend.** Only names prefixed with `VITE_` are exposed to the browser; assume anything there is public.

---

## Point the frontend at a different API base URL

The UI builds request URLs from `VITE_API_URL`. If it is unset, the client defaults to `http://localhost:8080`.

1. Copy `notes-app/frontend/.env.example` to `notes-app/frontend/.env.local` (preferred) or `.env`.
2. Set `VITE_API_URL` to your API origin **without** a trailing slash, for example `https://api.example.com`.
3. Restart `npm run dev` (Vite reads env at startup).

---

## Fix browser CORS errors

The API allows browser origins from `app.cors.allowed-origins` (env: `CORS_ALLOWED_ORIGINS`). The default allows `http://localhost:5173` and the literal origin value `null` (see below).

- **Multiple origins:** use a comma-separated list, no spaces (or trim them in code—they are trimmed when parsed).
- **Different Vite port:** add that origin, e.g. `http://localhost:5174`.
- **Electron (packaged):** Chromium often sends **`Origin: null`** for cross-origin `fetch` from a `file://` renderer to `http://localhost:8080`. The backend must allow the literal **`null`** entry in `CORS_ALLOWED_ORIGINS`; the demo default includes it. Confirm with DevTools (**Network** → request headers) if requests still fail after changing origins.
- **Production:** set `CORS_ALLOWED_ORIGINS` to the exact HTTPS origin(s) of your deployed UI. Omit `null` if you never serve the UI from `file://` and want to avoid permitting that opaque origin bucket.

CORS is applied from `SecurityConfig` (and shared `CorsConfigurationSource`) for paths under `/api/**`.

---

## Change the API port

Set `SERVER_PORT` before starting Spring Boot (default `8080`). If the UI still targets the old port, update `VITE_API_URL` accordingly.

---

## Database connection refused

- Ensure Postgres is running (`docker compose ps` in `notes-app/`).
- Check `SPRING_DATASOURCE_URL`, username, and password match the container.
- If the API runs **inside** Docker on the same Compose network, the hostname in the JDBC URL is often the service name (`postgres`), not `localhost`.

---

## Schema or migration surprises

The demo uses **Flyway** for PostgreSQL and `spring.jpa.hibernate.ddl-auto: validate`. Schema changes go through versioned SQL migrations under `backend/src/main/resources/db/migration/`. Treat destructive or prod-affected changes with the same care as any migrated service.

---

## Validation errors from the API

Create/update bodies are validated: title max length **500**, Markdown content max **1_000_000** characters. Errors return HTTP **400** with a JSON body that can include `fieldErrors`. See the [reference](reference-rest-api-and-configuration.md#error-responses).

---

## Frontend shows empty list but curl works

Usually a **wrong `VITE_API_URL`**, **CORS**, or **mixed content** (HTTPS page calling HTTP API). Check the browser network tab and compare request URL and response headers with the recipes above.
