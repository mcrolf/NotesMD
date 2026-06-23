# Reference: Server configuration and API

Factual reference for **self-hosters**: environment variables, HTTP endpoints, and error shapes. The **NotesMD app** uses these endpoints automatically; you only need this page if you integrate another client or debug with `curl`.

---

## Base URL

- Local default: `http://localhost:8080`
- **Your deployment:** whatever origin you enter in the app (no trailing slash; paths below are appended to that origin)

**Authentication:** All routes under `/api/notes` (and other protected `/api/*` routes except register and login) require:

```http
Authorization: Bearer <access-token>
```

Obtain `<access-token>` from [`POST /api/auth/login`](#post-apiauthlogin). The NotesMD app stores and sends this token after you register or sign in.

---

## Endpoints

### `POST /api/auth/register`

Creates an account on **your** server.

**Authentication:** none (public).

**Request body (JSON):**

| Field | Type | Constraints |
|-------|------|-------------|
| `username` | string | required; **3–255** characters |
| `password` | string | required; **8–128** characters |

**Response:** `201 Created`

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string (UUID) | New user id |
| `username` | string | Registered username |

**Errors:** `400` (validation), `409 Conflict` if the username is already taken ([error body](#error-responses)).

---

### `POST /api/auth/login`

Returns a JWT access token for an existing user.

**Authentication:** none (public).

**Request body (JSON):** same fields and constraints as [register](#post-apiauthregister).

**Response:** `200 OK`

| Field | Type | Description |
|-------|------|-------------|
| `accessToken` | string | JWT (use as `Bearer` value) |
| `tokenType` | string | Always `Bearer` |
| `expiresIn` | number | Lifetime in **seconds** |
| `username` | string | Authenticated username |

**Errors:** `400` (validation), **`401 Unauthorized`** if credentials are invalid ([error body](#error-responses)).

---

### Note endpoints (`/api/notes`)

Unless stated otherwise, **`Authorization: Bearer <token>`** is **required**.

### `GET /api/notes`

Returns **the authenticated user's** notes, **newest first**.

**Response:** `200 OK` — JSON array of [Note objects](#note-json-object).

---

### `GET /api/notes/{id}`

**Path parameter:** `id` — UUID string.

**Response:**

- `200 OK` — single [Note object](#note-json-object) if owned by the current user
- `404 Not Found` — missing id or note belongs to another user

---

### `POST /api/notes`

Creates a note owned by the authenticated user.

**Request body (JSON):**

| Field | Type | Constraints |
|-------|------|-------------|
| `title` | string | optional; max 500 characters |
| `contentMarkdown` | string | optional; max 1_000_000 characters |

**Response:** `201 Created` — [Note object](#note-json-object)

**Errors:** `400` for validation ([error body](#error-responses))

---

### `PATCH /api/notes/{id}`

Updates a note owned by the current user. Only non-null fields in the body are applied.

**Request body (JSON):** same fields as POST; all optional.

**Response:**

- `200 OK` — updated [Note object](#note-json-object)
- `404 Not Found` — missing id or note belongs to another user

**Errors:** `400` for validation or malformed input

---

### `DELETE /api/notes/{id}`

Deletes a note owned by the current user.

**Response:**

- `204 No Content` — deleted
- `404 Not Found` — missing id or note belongs to another user

---

## Note JSON object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Server-generated |
| `title` | string | |
| `contentMarkdown` | string | Stored as Markdown |
| `createdAt` | string | ISO-8601 instant (UTC) |
| `updatedAt` | string | ISO-8601 instant (UTC) |

---

## Error responses

JSON shape from the API:

| Field | Type | Description |
|-------|------|-------------|
| `status` | number | HTTP status value |
| `error` | string | Short label (e.g. `Bad Request`) |
| `message` | string | Human-readable detail |
| `fieldErrors` | object or null | Map of field name → message for validation failures |

Typical status codes: **400** (validation), **401** (missing/invalid token or failed login), **404** (missing note or wrong owner), **409** (duplicate username on register).

---

## Health check

### `GET /actuator/health`

Public (no token). The NotesMD app calls this before register/login to verify your server is reachable. Returns **`200 OK`** when the API is up. Subject to the same CORS rules as `/api/**`.

---

## CORS

Browsers and the desktop app send an `Origin` header. The server must allow the **client** origin, not the API hostname.

| Setting | Env var | Default |
|---------|---------|---------|
| Allowed origins (comma-separated) | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,null` |

For the **NotesMD desktop app**, include the literal token **`null`**. Add HTTPS web origins if you serve a browser UI on another host.

Example:

```bash
CORS_ALLOWED_ORIGINS=null,https://notes.yourdomain.com
```

See [Fix connection and CORS errors](how-to-configuration-and-troubleshooting.md#fix-connection-and-cors-errors).

---

## Server environment variables

Set these in **`notes-app/.env`** (see `.env.example`).

| Env var | Purpose | Default / notes |
|---------|---------|-----------------|
| `SPRING_DATASOURCE_URL` | JDBC URL | Overridden to `postgres:5432` inside Docker Compose |
| `SPRING_DATASOURCE_USERNAME` | DB user | `notes` |
| `SPRING_DATASOURCE_PASSWORD` | DB password | **Required** — must match `POSTGRES_PASSWORD` |
| `JWT_SECRET` | HS256 signing key for login tokens | **Set explicitly** for any real deployment |
| `JWT_ISSUER` | Token issuer claim | `notes-api` |
| `JWT_ACCESS_TOKEN_TTL` | Access token lifetime (ISO-8601 duration) | `PT1H` (one hour) |
| `CORS_ALLOWED_ORIGINS` | Allowed client origins | See [CORS](#cors) |
| `SERVER_PORT` | API port on the host | `8080` |
| `POSTGRES_PASSWORD` | Postgres container password | **Required** |
| `POSTGRES_USER` | Postgres user | `notes` |
| `POSTGRES_DB` | Database name | `notesMD` |
| `POSTGRES_PORT` | Postgres port on the host | `5432` |

---

## Docker Compose services

Run from **`notes-app/`**:

| Service | Role | Host port |
|---------|------|-----------|
| `postgres` | PostgreSQL 16; data in volume `postgres_data` | `${POSTGRES_PORT:-5432}` |
| `api` | NotesMD API | `${SERVER_PORT:-8080}` |

**Start:** `docker compose up -d`

**Stop (keep data):** `docker compose down`

**Upgrade:** `docker compose up -d --build` — see [Upgrade an existing deployment](how-to-upgrade-existing-deployment.md)

**Never** use `docker compose down -v` unless you intend to delete all notes and accounts.

---

## NotesMD app configuration

End users configure the server **in the app UI** (Register, Sign in, or Settings → Server URL). The app stores the URL and session on your device.

You do **not** need to edit client configuration files to use NotesMD with a self-hosted server.

---

## Related reading

- [Documentation index](README.md)
- [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md)
- [How NotesMD works](explanation-architecture-and-data-flow.md)
