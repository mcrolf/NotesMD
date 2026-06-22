# Tutorial: First run (self-host the NotesMD API)

**Goal:** Run PostgreSQL and the Spring Boot API so you can connect the **NotesMD client** (desktop app or dev build), **register**, **sign in**, and create Markdown notes.

**Audience:** Developers comfortable with a terminal and Docker.

**Time:** About 10 minutes, excluding downloads.

---

## Prerequisites

- **Docker** (Compose v2)
- **NotesMD client** — install a desktop build from [Downloads](../README.md#downloads), or run the frontend dev server from the private [notesmd-frontend](https://github.com/mcrolf/notesmd-frontend) repository if you have access

For **backend development on the host** (debugger, fast reload), you also need **Java 17** — see [Optional: run the API on the host](#optional-run-the-api-on-the-host-for-development).

---

## Step 1: Clone and enter the app folder

Work from the `notes-app` directory inside this repository. Paths below are relative to `notes-app/` unless stated otherwise.

---

## Step 2: Configure environment

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env`:
   - Set **`POSTGRES_PASSWORD`** to a strong value for your machine.
   - Set **`SPRING_DATASOURCE_PASSWORD`** to the **same** value (the API uses it to connect).
   - Set **`JWT_SECRET`** to a long random secret (for example `openssl rand -base64 48`). **Always set this** for anything beyond quick solo experimentation on your machine.
   - Do **not** commit `.env` — it is listed in the repository `.gitignore`.

---

## Step 3: Start Postgres and the API

From `notes-app/`:

```bash
docker compose up -d
```

Compose reads `.env` for variable substitution and passes secrets to the **`api`** service. The API waits for Postgres to become healthy, then starts and runs **Flyway** migrations automatically.

The first run builds the API image from `backend/Dockerfile` (Gradle `bootJar`); later runs reuse the image unless you pass `--build`.

Confirm the stack is up:

```bash
docker compose ps
curl -s http://localhost:8080/actuator/health
```

You should see both services healthy and a JSON health payload.

---

## Step 4: Connect the NotesMD client

Open the **NotesMD** desktop app or frontend dev server. On **Register**:

1. Enter your API origin — e.g. `http://localhost:8080` (no trailing slash, no `/api` path).
2. Choose a username (**3+** characters) and password (**8+** characters).

On **Sign in**, the saved server URL is reused; choose **Use a different server** only when switching backends.

For local Vite dev (`http://localhost:5173`), ensure `CORS_ALLOWED_ORIGINS` on the API includes that origin. See [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md#fix-browser-cors-errors).

---

## Step 5: Use the app

1. After authentication you should land on the notes list at **`/notes`**.
2. Create a note from **`/notes/new`**, add a title and Markdown body, and save.
3. Open a note from the list (**`/notes/{id}`**) to read, edit, or delete.

If list loads fail with **401**, ensure you are logged in and that the backend has a stable **`JWT_SECRET`** (tokens from a previous run are invalid if the secret changes). For other issues, see [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md).

---

## Optional: run the API on the host (for development)

When iterating on Java code, run only Postgres in Docker and the API via Gradle on your machine:

```bash
docker compose up -d postgres
cd backend
./run.sh
```

`./run.sh` loads `notes-app/.env` and uses **`SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/notesMD`** (the default in `.env.example`). Leave this process running and use the same health check as above.

---

## Step 6: Run tests (optional)

From `backend/`:

```bash
./gradlew test
```

Tests use an in-memory H2 database; they do not require Docker.

---

## What you learned

You now have Postgres and Spring Boot on port **8080**, ready for the NotesMD client. The note API is **JWT-protected**; notes are **isolated per user**. Next, read [Architecture and data flow](explanation-architecture-and-data-flow.md) or jump to the [API reference](reference-rest-api-and-configuration.md) when integrating other clients.

To pull a newer release without losing data, see [Upgrade an existing deployment](how-to-upgrade-existing-deployment.md).
