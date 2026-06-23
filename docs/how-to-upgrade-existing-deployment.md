# How-to: Upgrade an existing deployment

Use this when you already run the NotesMD server from `notes-app/` and want a **newer release without losing your notes**.

---

## Before you start

- Your notes and accounts live in the Docker volume **`postgres_data`**. Normal restarts and API rebuilds **do not** delete it.
- Keep the same **`notes-app/.env`** values for `POSTGRES_*`, `SPRING_DATASOURCE_*`, and especially **`JWT_SECRET`**. Changing `JWT_SECRET` does not erase the database, but everyone must **sign in again** in the NotesMD app.

Optional backup before a major upgrade:

```bash
docker compose exec postgres pg_dump -U notes notesMD > notesmd-backup.sql
```

Adjust `-U` and the database name if your `.env` differs from the defaults.

---

## Upgrade steps

From the **`notes-app/`** directory:

```bash
git pull
docker compose up -d --build
```

- **`--build`** rebuilds the API container from updated source.
- **Postgres** keeps running with the existing **`postgres_data`** volume.
- On startup, the server applies any new database migrations that have not run yet.

Verify:

```bash
docker compose ps
curl -s http://localhost:8080/actuator/health
```

Open the **NotesMD app** and confirm you can still sign in and see your notes. If you changed `JWT_SECRET` during the upgrade, sign in again.

---

## What not to do

| Command | Effect |
|---------|--------|
| `docker compose down` | Stops containers; **data preserved** in `postgres_data` |
| `docker compose down -v` | **Deletes** `postgres_data` — all notes and accounts gone |
| Changing `POSTGRES_DB` on an existing volume | Can break an already-initialized database — treat as a new install |

---

## Troubleshooting

- **API exits on startup** — check logs: `docker compose logs api`. Common causes: wrong DB password in `.env` or a failed database migration.
- **401 after upgrade** — if you changed `JWT_SECRET`, sign in again from the app.
- **Port already in use** — set `SERVER_PORT` in `.env`, run `docker compose up -d`, and update the server URL in the app.

See also [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md).
