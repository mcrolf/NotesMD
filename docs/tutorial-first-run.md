# Tutorial: First run (self-host NotesMD)

**Goal:** Run the NotesMD server on your machine, connect the **NotesMD app**, create an account, and save your first Markdown note.

**Audience:** Anyone comfortable copying commands into a terminal. No Java or frontend development required.

**Time:** About 10 minutes, excluding app download.

---

## What you are setting up

| Piece | Where it runs | Your role |
|-------|---------------|-----------|
| **NotesMD server** | Your machine (Docker) | You install and maintain it using this repository. |
| **NotesMD app** | Your desktop | Download from [notesmd.micnapoli.com](https://notesmd.micnapoli.com); you use it to read and write notes. |
| **Your notes** | PostgreSQL on your server | Stored only on infrastructure you control. |

---

## Prerequisites

- **Docker** with Compose (Docker Desktop on macOS/Windows, or Docker Engine on Linux)
- **NotesMD app** — [download and install](../DOWNLOADS.md) before or during this tutorial
- A copy of this **NotesMD server** repository on your machine (`git clone` or download a release archive)

---

## Step 1: Get the server files

Clone or download this repository, then open a terminal in the **`notes-app`** folder inside it. All commands below assume you are in `notes-app/`.

---

## Step 2: Configure secrets

The server needs a database password and a signing key for login tokens.

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set:
   - **`POSTGRES_PASSWORD`** — a strong password for the database
   - **`SPRING_DATASOURCE_PASSWORD`** — the **same** value (the API uses it to connect to Postgres)
   - **`JWT_SECRET`** — a long random secret, for example:

     ```bash
     openssl rand -base64 48
     ```

3. Keep `.env` private. Do not share it or commit it to version control.

---

## Step 3: Start the server

From `notes-app/`:

```bash
docker compose up -d
```

The first run builds the API image; later starts are faster. Docker starts **PostgreSQL** and the **NotesMD API**; the API waits for the database and applies schema migrations automatically.

Check that everything is healthy:

```bash
docker compose ps
curl -s http://localhost:8080/actuator/health
```

You should see both services running and a JSON response indicating the API is up.

---

## Step 4: Connect the NotesMD app

1. Open the **NotesMD** app you installed from [notesmd.micnapoli.com](https://notesmd.micnapoli.com).
2. Go to **Register**.
3. In **Your NotesMD server**, enter `http://localhost:8080` (no trailing slash).
4. Pick a username and password and complete registration.

The app checks `http://localhost:8080/actuator/health` before registering. If that fails, confirm the server is running (Step 3) and that you entered the URL correctly.

On **Sign in** later, the app remembers your server URL. Use **Use a different server** only when switching to another backend.

---

## Step 5: Create a note

1. After sign-in you should see the notes list.
2. Create a new note, add a title and Markdown body, and save.
3. Open the note from the list to read, edit, or delete it.

Your note is stored in **your** PostgreSQL database on this machine.

---

## Step 6: Stop and start again

- **Stop the server:** from `notes-app/`, run `docker compose down`. Your notes remain in the Docker volume.
- **Start again:** `docker compose up -d`, then sign in from the app with the same server URL.

Do **not** run `docker compose down -v` unless you intend to **delete all notes and accounts**.

---

## If something goes wrong

| Symptom | What to try |
|---------|-------------|
| App cannot reach the server | Confirm `curl -s http://localhost:8080/actuator/health` works; check the URL in Register (no `/api` suffix). |
| **401** after restart | If you changed **`JWT_SECRET`**, sign in again in the app. |
| Registration blocked in browser | Desktop app users: ensure `CORS_ALLOWED_ORIGINS` in `.env` includes `null` (default). See [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md). |

Full troubleshooting: [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md).

---

## What you learned

You now have:

- A **self-hosted NotesMD server** on port **8080**
- The **NotesMD app** connected to that server
- Notes stored **per account** on your machine

**Next steps:**

- [Expose the server securely](how-to-configuration-and-troubleshooting.md#self-host-the-api-and-connect-the-notesmd-app) on your network or the internet (HTTPS, firewall, `CORS_ALLOWED_ORIGINS`)
- [Upgrade without losing data](how-to-upgrade-existing-deployment.md) when a new server release is available
- [How NotesMD works](explanation-architecture-and-data-flow.md) — privacy and data flow
