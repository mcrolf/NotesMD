# How-to: Upgrade an existing deployment

Use this when you already run NotesMD from `notes-app/` and want to pull a newer backend release **without** wiping Postgres.

---

## Before you start

- Your data lives in the Docker volume **`postgres_data`**. Normal restarts and API rebuilds **do not** delete it.
- Keep the same **`notes-app/.env`** values for `POSTGRES_*`, `SPRING_DATASOURCE_*`, and especially **`JWT_SECRET`**. Changing `JWT_SECRET` does not erase the database, but users must **sign in again** to get new tokens.

Optional backup before a major upgrade:

```bash
docker compose exec postgres pg_dump -U notes notesMD > notesmd-backup.sql
```

Adjust `-U` / database name if your `.env` differs from the defaults.

---

## Upgrade steps

From the repository root, then `notes-app/`:

```bash
git pull
docker compose up -d --build
```

- **`--build`** rebuilds the **`api`** image from the updated source and recreates the API container.
- **Postgres** keeps running with the existing **`postgres_data`** volume.
- On startup, **Flyway** applies any new SQL migrations under `backend/src/main/resources/db/migration/` that have not run yet.

Verify:

```bash
docker compose ps
curl -s http://localhost:8080/actuator/health
```

---

## What not to do

| Command | Effect |
|---------|--------|
| `docker compose down` | Stops containers; **data preserved** in `postgres_data` |
| `docker compose down -v` | **Deletes** `postgres_data` — all notes and accounts gone |
| Changing `POSTGRES_DB` on an existing volume | Can break an already-initialized cluster — treat as a new install |

---

## Troubleshooting

- **API exits on startup** — check logs: `docker compose logs api`. Common causes: wrong DB password in `.env`, Flyway migration error, or Hibernate `validate` mismatch after a bad migration.
- **401 after upgrade** — if you changed `JWT_SECRET`, sign in again from the client.
- **Port already in use** — set `SERVER_PORT` in `.env` and point the client at the new port.

See also [Schema or migration surprises](how-to-configuration-and-troubleshooting.md#schema-or-migration-surprises).
