# How-to: Configuration and troubleshooting

Problem-oriented guides for **self-hosting the NotesMD server** and using the **NotesMD app** from [notesmd.micnapoli.com](https://notesmd.micnapoli.com).

---

## Environment variables

Configuration lives in **`notes-app/.env`** (copy from `.env.example`). Docker Compose reads this file when you run `docker compose` from `notes-app/`.

| Variable | Purpose |
|----------|---------|
| `POSTGRES_PASSWORD` | Database password for the Postgres container |
| `SPRING_DATASOURCE_PASSWORD` | Must match `POSTGRES_PASSWORD` — the API uses this to connect |
| `JWT_SECRET` | Signs login tokens. **Always set** for any shared or long-lived server. Generate with `openssl rand -base64 48` |
| `CORS_ALLOWED_ORIGINS` | Origins allowed to call your API from a browser or the desktop app (see [CORS](#fix-connection-and-cors-errors)) |
| `SERVER_PORT` | Host port for the API (default `8080`) |
| `POSTGRES_PORT` | Host port for Postgres (default `5432`; usually only needed for external DB tools) |

**Important:** Changing **`JWT_SECRET`** does not delete your notes, but everyone must **sign in again** in the app to get new tokens.

Never put database passwords or `JWT_SECRET` in the NotesMD app or any client-side file. The app only needs your **server URL**.

---

## Self-host the API and connect the NotesMD app

Each app install talks to **one** NotesMD server. You configure **one field in the app: your server URL** (the API origin, with no `/api` suffix).

### Checklist

1. **Run the server** from `notes-app/`:

   ```bash
   docker compose up -d
   ```

2. **Set secrets** in `.env`: strong `POSTGRES_PASSWORD`, matching `SPRING_DATASOURCE_PASSWORD`, and `JWT_SECRET`.

3. **Set `CORS_ALLOWED_ORIGINS`** so the app can call your API:
   - **Desktop app (default install):** include the literal value `null` — the default in `.env.example` already does this.
   - **Additional origins:** add comma-separated entries if you also use a web UI on another hostname (for example `https://notes.yourdomain.com`).

4. **Open the NotesMD app** → **Register** → enter your server URL:
   - Same machine: `http://localhost:8080`
   - LAN: `http://hostname-or-ip:8080`
   - Public HTTPS: `https://notes.yourdomain.com`

5. **Register or sign in.** Accounts are created **on your server**; the app stores the server URL and session locally.

Before login, the app may call **`GET {your-server}/actuator/health`**. Failure usually means the URL is wrong, the server is stopped, or CORS is blocking the request.

### Change server URL in the app

- **Signed out:** edit the URL on **Register**, or on **Sign in** choose **Use a different server**.
- **Signed in:** **Settings → Server URL**, save, then sign in again on the new server.

Changing servers clears your local session because tokens from one server are not valid on another.

---

## Fix connection and CORS errors

The server only accepts browser and app requests from origins listed in **`CORS_ALLOWED_ORIGINS`**.

**Rule:** list the origin of the **client** (the app or web page), not the API URL.

| Scenario | Typical `CORS_ALLOWED_ORIGINS` value |
|----------|-------------------------------------|
| Desktop app only | `null` (included in the default) |
| Desktop + local testing on another port | `null,http://localhost:5173` |
| Desktop + deployed web UI | `null,https://notes.yourdomain.com` |

Example in `.env`:

```bash
CORS_ALLOWED_ORIGINS=null,https://notes.yourdomain.com
```

After changing `.env`, restart the API:

```bash
docker compose up -d
```

If the app shows *Server blocked this app. Add this app's origin to CORS_ALLOWED_ORIGINS on your server*, add the suggested origin and restart.

The desktop app often sends **`Origin: null`**; that is why `null` must appear in the list for packaged Electron builds.

---

## Change the API port

Set **`SERVER_PORT`** in `notes-app/.env` (default `8080`), then:

```bash
docker compose up -d
```

Update the server URL in the app to match (for example `http://localhost:9090`).

---

## Upgrade an existing deployment

Pull updates and rebuild without deleting Postgres data:

```bash
git pull
docker compose up -d --build
```

Do **not** run `docker compose down -v` unless you intend to wipe all notes and accounts. Full steps: [Upgrade an existing deployment](how-to-upgrade-existing-deployment.md).

---

## Database connection refused

- Ensure Postgres is running: `docker compose ps` in `notes-app/`.
- Confirm `SPRING_DATASOURCE_PASSWORD` in `.env` matches `POSTGRES_PASSWORD`.
- If you changed passwords after the first install, you may need to align `.env` with the existing volume or start fresh (which loses data).

---

## Validation errors from the server

Note titles are limited to **500** characters; Markdown body to **1,000,000** characters. The app surfaces these as validation errors. Details: [Server configuration and API — Error responses](reference-rest-api-and-configuration.md#error-responses).

---

## App shows an empty list but the server works

Common causes:

- **Wrong server URL** in Register, Sign in, or Settings — not the URL you tested with `curl`
- **CORS** — see [Fix connection and CORS errors](#fix-connection-and-cors-errors)
- **Mixed content** — an HTTPS page or proxy calling an HTTP API blocked by the client
- **Expired session** — sign in again, especially after changing `JWT_SECRET`

---

## Note requests return 401 Unauthorized

Protected routes require a valid login from **your** server.

- Confirm you completed **Register** or **Sign in** in the app.
- If you **changed `JWT_SECRET`** or wiped the database volume, sign in again.
- Each server has its own accounts — registering on `localhost` does not create a user on a remote server.

---

## Expose your server on the internet (overview)

For use outside your LAN:

1. Run the stack on a host with a public IP or reverse proxy.
2. Terminate **HTTPS** at your proxy (nginx, Caddy, Traefik, cloud load balancer).
3. Set **`CORS_ALLOWED_ORIGINS`** to include `null` (desktop app) and any web origins you use.
4. Use a strong **`JWT_SECRET`** and database password.
5. Point the app at your public URL, for example `https://notes.yourdomain.com`.

Firewall and TLS setup depend on your provider; the NotesMD server itself listens on the port configured in `SERVER_PORT` (default 8080).
