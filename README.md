# NotesMD (server)

**NotesMD** is a self-hostable **Markdown notes** backend: you run the server on infrastructure you control; users connect with the **NotesMD app** from [notesmd.micnapoli.com](https://notesmd.micnapoli.com) to register, sign in, and manage notes stored in **your** PostgreSQL database.

## For app users (self-hosting)

| Step | Link |
|------|------|
| Download the app | [DOWNLOADS.md](DOWNLOADS.md) · [notesmd.micnapoli.com](https://notesmd.micnapoli.com) |
| Run your first server | [Tutorial: First run](docs/tutorial-first-run.md) |
| Configure and troubleshoot | [Configuration and troubleshooting](docs/how-to-configuration-and-troubleshooting.md) |
| Full documentation | [docs/README.md](docs/README.md) |

After installing the app, open **Register** and enter your server URL (for example `http://localhost:8080` for a local Docker stack).

## What is in this repository

| Path | Description |
|------|-------------|
| `notes-app/backend` | Spring Boot API (Java 17): JWT auth, REST notes CRUD, Flyway migrations |
| `notes-app/docker-compose.yml` | PostgreSQL 16 + API container for self-hosting |
| `docs/` | End-user guides: tutorial, configuration, API reference, architecture overview |

## Quick start (server)

1. From the repository root, run `make env`. It creates `notes-app/.env` from `.env.example` with a generated database password and `JWT_SECRET`. (Or copy the file yourself and set strong values for `POSTGRES_PASSWORD`, `SPRING_DATASOURCE_PASSWORD` (must match), and `JWT_SECRET`.)
2. Start the stack: `make up` builds the API, starts PostgreSQL and the API, and waits until both are healthy. Without `make`: `docker compose up -d` from `notes-app/`.
3. Confirm health: `make health` or `curl -s http://localhost:8080/actuator/health`
4. Install the [NotesMD app](DOWNLOADS.md), open **Register**, enter your API origin (e.g. `http://localhost:8080`), and create an account.

Other targets (`make help` lists them all):

| Target | What it does |
|--------|--------------|
| `make down` | Stop the stack; notes and accounts stay in the `postgres_data` volume |
| `make restart` | Recreate the API so it reloads `notes-app/.env` |
| `make logs` / `make ps` | Follow API logs / show container status |
| `make backup` | Dump the database to `backups/notesmd-<timestamp>.sql` |
| `make db` / `make dev` | Start only PostgreSQL / run the API on the host with Gradle against it |
| `make test` | Run the API test suite |

`make up`, `make restart`, and `make db` refuse to run while `notes-app/.env` is missing or still has `CHANGE_ME` placeholders. No target deletes the database volume.

To upgrade without losing data, see [Upgrade an existing deployment](docs/how-to-upgrade-existing-deployment.md).

## Environment variables

- **Template:** `notes-app/.env.example` — placeholders only; safe to commit.
- **Your values:** `notes-app/.env` — never commit (listed in `.gitignore`).
- **Details:** [Configuration and troubleshooting — Environment variables](docs/how-to-configuration-and-troubleshooting.md#environment-variables)

## License

This server and self-hosting materials are released under the [MIT License](LICENSE).
