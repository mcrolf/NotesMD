# How-to: Configuration and troubleshooting

Problem-oriented recipes for running and integrating the **NotesMD** demo.

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

- Strongly recommended: set **`JWT_SECRET`** in `.env` (≥ 32 bytes of entropy in practice — generate with `openssl rand -base64 48`), plus **`SPRING_DATASOURCE_*`** matching your Postgres container. If **`JWT_SECRET`** is **not** set, `application.yml` applies a **fixed development default** so the process can start; that is **not** appropriate for shared machines, CI secrets, or production-like environments, and **changing the secret invalidates existing tokens**.

**NotesMD client (frontend repository)**

- The official React + Electron client lives in the private [notesmd-frontend](https://github.com/mcrolf/notesmd-frontend) repository.
- Optional **`VITE_API_URL`** in `.env.local` (copy from `.env.example` in that repo) pre-fills the server field for local dev.
- **Never put database passwords or JWT signing keys in the client.** Only names prefixed with `VITE_` are exposed to the browser; assume anything there is public.

---

## Self-host the API and connect the NotesMD client

Each NotesMD client instance talks to **one** Spring Boot API. The database stays on the same host as that API (configured only via server env vars such as `SPRING_DATASOURCE_URL`). Users configure **one thing in the UI: the API origin URL** (no `/api` path suffix).

### Checklist

1. **Run Postgres and the API** on your machine — for example from `notes-app/`:
   - `docker compose up -d` for Postgres
   - Export server env from `.env`, then `cd backend && ./gradlew bootRun` (see [Environment variables](#environment-variables-security-and-loading) above).
2. **Set server secrets and DB credentials** in `notes-app/.env` (or your deployment env): strong `JWT_SECRET`, `SPRING_DATASOURCE_*` matching Postgres, and non-default passwords.
3. **Set `CORS_ALLOWED_ORIGINS`** on the API to include **every origin where you open the frontend** (exact scheme + host + port). Examples:
   - Local Vite dev: `http://localhost:5173`
   - Deployed UI: `https://notes.example.com`
   - Packaged Electron (`file://`): include the literal `null` entry (see [Fix browser CORS errors](#fix-browser-cors-errors)).
4. **Open the NotesMD client** (desktop app, dev server, or static build) and enter your API URL on **Register** — e.g. `https://notes.example.com` or `http://localhost:8080`. On **Sign in**, the saved URL is used automatically; choose **Use a different server** only if you need to change it.
5. **Register or sign in.** Registration creates the account **on your backend** (`POST /api/auth/register` → your Postgres). The API URL is client routing config only; it is not stored in the database.

Before auth, the app may probe **`GET {api-url}/actuator/health`**. A failed probe usually means the URL is wrong, the API is down, or CORS is blocking the browser.

### Change server later

- **Signed out:** on **Register**, edit the server URL field directly. On **Sign in**, choose **Use a different server** to reveal the URL field (hidden by default; pre-filled from the last saved value).
- **Signed in:** use **Settings → Server URL**, save, then sign in again against the new server. Changing the API origin clears the tab session because JWTs from one server are invalid on another.

---

## Point the client at a different API base URL

The client resolves the API origin in this order:

1. **User-configured URL** saved in the browser (`localStorage`, set at register/login or in Settings).
2. **`VITE_API_URL`** from build/env (optional dev default).
3. **`http://localhost:8080`** hardcoded fallback.

### In the app (recommended for self-hosting)

Enter the origin on **Register** (field label: *Your NotesMD server*). Use the origin only — no trailing slash and no `/api` path. On **Sign in**, the app reuses the stored URL; expand **Use a different server** to change it before signing in.

### Optional build-time default (`VITE_API_URL`)

Use this to pre-fill the server field for local development without typing `http://localhost:8080` each time (in the [notesmd-frontend](https://github.com/mcrolf/notesmd-frontend) repository):

1. Copy `.env.example` to `.env.local` (preferred) or `.env`.
2. Uncomment and set `VITE_API_URL` to your API origin, for example `https://api.example.com`.
3. Restart `npm run dev` (Vite reads env at startup).

You do **not** need `VITE_API_URL` when users always set the URL in the UI.

---

## Fix browser CORS errors

The API allows browser origins from `app.cors.allowed-origins` (env: `CORS_ALLOWED_ORIGINS`). The default allows `http://localhost:5173` and the literal origin value `null` (see below).

**Self-host rule:** the value must include the **exact origin of the page running the frontend**, not the API URL. If you open the UI at `https://app.example.com` but only allow `http://localhost:5173`, register/login will fail in the browser with a CORS error (the app surfaces this as *Server blocked this app. Add this app's origin to CORS_ALLOWED_ORIGINS on your server.*).

- **Multiple origins:** comma-separated list, no spaces required (values are trimmed when parsed). Example: `https://app.example.com,http://localhost:5173,null`
- **Different Vite port:** add that origin, e.g. `http://localhost:5174`.
- **Electron (packaged):** Chromium often sends **`Origin: null`** for cross-origin `fetch` from a `file://` renderer to `http://localhost:8080`. The backend must allow the literal **`null`** entry in `CORS_ALLOWED_ORIGINS`; the demo default includes it. Confirm with DevTools (**Network** → request headers) if requests still fail after changing origins.
- **Production:** set `CORS_ALLOWED_ORIGINS` to the exact HTTPS origin(s) of your deployed UI. Omit `null` if you never serve the UI from `file://` and want to avoid permitting that opaque origin bucket.

CORS is applied from `SecurityConfig` (and shared `CorsConfigurationSource`) for paths under `/api/**` and **`/actuator/**`** (including the health check used before login).

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

Usually a **wrong API server URL** (check Register, **Use a different server** on Sign in, or Settings — not only `VITE_API_URL`), **CORS**, or **mixed content** (HTTPS page calling HTTP API). Check the browser network tab and compare request URL and response headers with the recipes above.

---

## Note requests return **401 Unauthorized**

Protected routes (**`/notes`** for the list, plus **`/notes/*`** for new/detail) call **`/api/notes`** with a Bearer token stored after **login/register**.

- Confirm you completed **Register** or **Sign in**; open DevTools (**Application** → **Local storage**) if you want to verify a token exists for this origin / hash route.
- If you **changed `JWT_SECRET`** or restarted Postgres / wiped volumes, **sign in again** so the client obtains a fresh token.
- For manual **`curl`** tests against **`/api/notes`**, call **`POST /api/auth/login`** first and send **`Authorization: Bearer <accessToken>`** on subsequent requests.
