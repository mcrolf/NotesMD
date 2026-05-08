# Tutorial: First run (WebClock Notes end-to-end)

**Goal:** Run PostgreSQL, the Spring Boot API, and the Vite frontend so you can **register**, **sign in**, and create and edit Markdown notes in the browser.

**Audience:** Developers comfortable with a terminal, Docker, and `npm`.

**Time:** About 15 minutes, excluding downloads.

---

## Prerequisites

- **Docker** (or another way to run PostgreSQL 16 with the same connection details)
- **Java 17** (for the Gradle toolchain used by the backend)
- **Node.js** and **npm** (current LTS is fine)

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

The API reads `SPRING_DATASOURCE_*` and **`JWT_SECRET`** from the **process environment** (Spring Boot does not automatically load `notes-app/.env` unless you configure that separately).

**Ways to load `notes-app/.env` when running the API:**

- From `notes-app/`, before `backend` commands:

  ```bash
  set -a && source .env && set +a && cd backend && ./gradlew bootRun
  ```

- Or export the variables manually / use your IDE’s Run Configuration environment field to match `.env`.

Defaults in `backend/src/main/resources/application.yml` assume:

- URL: `jdbc:postgresql://localhost:5432/notes`
- User: `notes`
- Password: `changeme` (override with `SPRING_DATASOURCE_PASSWORD` from `.env`)

If your `.env` uses different credentials, ensure the exported `SPRING_DATASOURCE_*` values match Postgres.

---

## Step 4: Run the Spring Boot API

From `backend/`:

```bash
./gradlew bootRun
```

Leave this process running. Confirm the app is up:

```bash
curl -s http://localhost:8080/actuator/health
```

You should see a JSON health payload.

---

## Step 5: Run the frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Open the dev URL Vite prints (commonly `http://localhost:5173`).

---

## Step 6: Use the app

1. Open the dev URL from Step 5 (e.g. `http://localhost:5173`). **`/`** redirects into the app shell.
2. **Register** at **`/register`** (username **3+** characters, password **8+** characters) or **Sign in** at **`/login`** if you already have an account.
3. After authentication you should land on the notes list at **`/webclock-notes`**.
4. Create a note from **`/notes/new`**, add a title and Markdown body, and save.
5. Open a note from the list (**`/notes/{id}`**) to read, edit, or delete.

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

You now have a three-process setup: Postgres, Spring Boot on port **8080**, and Vite on port **5173**, with CORS allowing the browser to call the API. The note API is **JWT-protected**; notes are **isolated per user**. Next, read [Architecture and data flow](explanation-architecture-and-data-flow.md) or jump to the [API reference](reference-rest-api-and-configuration.md) when integrating other clients.
