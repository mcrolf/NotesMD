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

### Upgrading past the production remediation release

- **`JWT_SECRET` is required.** The API no longer has a built-in default and refuses to start while `JWT_SECRET` is still the `CHANGE_ME` placeholder from `.env.example`. Set a real value (`openssl rand -base64 48`); everyone signs in again afterwards.
- **Desktop CORS origin.** New desktop builds send `Origin: app://notesmd`. If you set `CORS_ALLOWED_ORIGINS` yourself, add `app://notesmd`. Keep `null` only while someone still uses desktop 1.0.3 or older.
- **Legacy placeholder account.** Migration `V5` removes the internal `__legacy_unowned_notes__` user, or disables its password if notes from before user accounts still belong to it.
- **Archive-state errors** now return `409 Conflict` instead of `404` (for example deleting a note that is not archived).

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
