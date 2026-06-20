# Tutorial: First run (self-host the NotesMD API)

**Goal:** Run PostgreSQL and the Spring Boot API so you can connect the **NotesMD client** (desktop app or dev build), **register**, **sign in**, and create Markdown notes.

**Audience:** Developers comfortable with a terminal, Docker, and `./gradlew`.

**Time:** About 10 minutes, excluding downloads.

---

## Prerequisites

- **Docker** (or another way to run PostgreSQL 16 with the same connection details)
- **Java 17** (for the Gradle toolchain used by the backend)
- **NotesMD client** — install a desktop build from [Downloads](../README.md#downloads), or run the frontend dev server from the private [notesmd-frontend](https://github.com/mcrolf/notesmd-frontend) repository if you have access

---

## Step 1: Clone and enter the app folder

Work from the `notes-app` directory inside this repository. Paths below are relative to `notes-app/` unless stated otherwise.

---

## Step 2: Configure and start PostgreSQL

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env`:
   - Set **`POSTGRES_PASSWORD`** to a strong value for your machine.
   - Set **`SPRING_DATASOURCE_PASSWORD`** to the **same** value (the API uses it to connect).
   - Set **`JWT_SECRET`** to a long random secret (for example `openssl rand -base64 48`). **Always set this** for anything beyond quick solo experimentation on your machine (`application.yml` includes a **dev-only fallback** so the JVM can boot if you skip it once — never use that for shared hosts or production-like stacks).
   - Do **not** commit `.env` — it is listed in the repository `.gitignore`.

3. Start the database:

   ```bash
   docker compose up -d
   ```

   Compose automatically reads `.env` in this directory for variable **substitution** in `docker-compose.yml` (e.g. Postgres credentials).

4. Wait until the container is healthy. The compose file defines a `pg_isready` healthcheck.

---

## Step 3: Align JDBC settings with Postgres

The API reads `SPRING_DATASOURCE_*` and **`JWT_SECRET`** from the **process environment**. The provided **`backend/run.sh`** script loads `notes-app/.env` automatically before starting Gradle.

**Ways to run the API with your `.env` values:**

- From `backend/` (recommended):

  ```bash
  ./run.sh
  ```

- From `notes-app/`, before Gradle directly:

  ```bash
  set -a && source .env && set +a && cd backend && ./gradlew bootRun
  ```

- Or export the variables manually / use your IDE’s Run Configuration environment field to match `.env`.

Defaults in `backend/src/main/resources/application.yml` (when env vars are unset):

- URL: `jdbc:postgresql://localhost:5432/notesMD`
- User: `notes`
- Password: **none** — set `SPRING_DATASOURCE_PASSWORD` in `.env` (must match `POSTGRES_PASSWORD`)

If your `.env` uses different credentials, ensure the exported `SPRING_DATASOURCE_*` values match Postgres.

---

## Step 4: Run the Spring Boot API

From `backend/`:

```bash
./run.sh
```

Or, if you already exported the variables from `.env`, `./gradlew bootRun` works as well.

Leave this process running. Confirm the app is up:

```bash
curl -s http://localhost:8080/actuator/health
```

You should see a JSON health payload.

---

## Step 5: Connect the NotesMD client

Open the **NotesMD** desktop app or frontend dev server. On **Register**:

1. Enter your API origin — e.g. `http://localhost:8080` (no trailing slash, no `/api` path).
2. Choose a username (**3+** characters) and password (**8+** characters).

On **Sign in**, the saved server URL is reused; choose **Use a different server** only when switching backends.

For local Vite dev (`http://localhost:5173`), ensure `CORS_ALLOWED_ORIGINS` on the API includes that origin. See [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md#fix-browser-cors-errors).

---

## Step 6: Use the app

1. After authentication you should land on the notes list at **`/notes`**.
2. Create a note from **`/notes/new`**, add a title and Markdown body, and save.
3. Open a note from the list (**`/notes/{id}`**) to read, edit, or delete.

If list loads fail with **401**, ensure you are logged in and that the backend has a stable **`JWT_SECRET`** (tokens from a previous run are invalid if the secret changes). For other issues, see [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md).

---

## Step 7: Run tests (optional)

From `backend/`:

```bash
./gradlew test
```

Tests use an in-memory H2 database; they do not require Docker.

---

## What you learned

You now have Postgres and Spring Boot on port **8080**, ready for the NotesMD client. The note API is **JWT-protected**; notes are **isolated per user**. Next, read [Architecture and data flow](explanation-architecture-and-data-flow.md) or jump to the [API reference](reference-rest-api-and-configuration.md) when integrating other clients.
