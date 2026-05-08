# Tutorial: First run (Notes app end-to-end)

**Goal:** Run PostgreSQL, the Spring Boot API, and the Vite frontend so you can create and edit Markdown notes in the browser.

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

2. Edit `.env` and set `POSTGRES_PASSWORD` (and optionally other variables) to values you will use. Do not commit `.env`.

3. Start the database:

   ```bash
   docker compose up -d
   ```

4. Wait until the container is healthy. The compose file defines a `pg_isready` healthcheck.

---

## Step 3: Align JDBC settings with Postgres

The API reads `SPRING_DATASOURCE_*` from the environment. Defaults in `backend/src/main/resources/application.yml` assume:

- URL: `jdbc:postgresql://localhost:5432/notes`
- User: `notes`
- Password: `changeme`

If your `.env` uses different credentials, either export the matching `SPRING_DATASOURCE_*` variables before starting the API or change the defaults consistently in `.env` and your shell.

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

1. Open the notes list (`/`).
2. Create a new note (`/notes/new`), add a title and Markdown body, and save.
3. Open the note from the list and edit or delete it.

If list loads fail, see [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md).

---

## Step 7: Run tests (optional)

From `backend/`:

```bash
./gradlew test
```

Tests use an in-memory H2 database; they do not require Docker.

---

## What you learned

You now have a three-process setup: Postgres, Spring Boot on port **8080**, and Vite on port **5173**, with CORS allowing the browser to call the API. Next, read [Architecture and data flow](explanation-architecture-and-data-flow.md) or jump to the [API reference](reference-rest-api-and-configuration.md) when integrating other clients.
