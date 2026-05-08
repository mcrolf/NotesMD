# Reference: REST API and configuration

Factual descriptions of HTTP endpoints, payloads, and environment-driven settings.

---

## Base URL

- Default local API: `http://localhost:8080`
- All note routes are under **`/api/notes`**.

The frontend uses `VITE_API_URL` as the origin; paths are appended as listed below.

---

## Endpoints

### `GET /api/notes`

Returns all notes, **newest first** by `createdAt`.

**Response:** `200 OK` — JSON array of [Note JSON objects](#note-json-object).

---

### `GET /api/notes/{id}`

**Path parameter:** `id` — UUID string.

**Response:**

- `200 OK` — single [Note JSON object](#note-json-object)
- `404 Not Found` — note does not exist ([error body](#error-responses))

---

### `POST /api/notes`

Creates a note. Omitted or `null` fields use entity defaults (empty strings).

**Request body (JSON):**

| Field | Type | Constraints |
|-------|------|-------------|
| `title` | string | optional; max 500 characters |
| `contentMarkdown` | string | optional; max 1_000_000 characters |

**Response:** `201 Created` — [Note JSON object](#note-json-object)

**Errors:** `400` for validation ([error body](#error-responses))

---

### `PATCH /api/notes/{id}`

Updates a note. **Only non-null fields in the body are applied**; `null` means “leave unchanged.”

**Request body (JSON):** same fields as POST; all optional.

**Response:**

- `200 OK` — updated [Note JSON object](#note-json-object)
- `404 Not Found` — note does not exist

**Errors:** `400` for validation or malformed body/UUID

---

### `DELETE /api/notes/{id}`

**Response:**

- `204 No Content` — deleted
- `404 Not Found` — note did not exist

---

## Note JSON object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Server-generated |
| `title` | string | |
| `contentMarkdown` | string | Stored as Markdown |
| `createdAt` | string | ISO-8601 instant (UTC in persistence layer) |
| `updatedAt` | string | ISO-8601 instant |

---

## Error responses

JSON shape from the global exception handler:

| Field | Type | Description |
|-------|------|-------------|
| `status` | number | HTTP status value |
| `error` | string | Short label (e.g. `Bad Request`) |
| `message` | string | Human-readable detail |
| `fieldErrors` | object or null | Map of field name → message for validation failures |

Typical status codes: **400** (validation, bad input), **401** (missing or invalid JWT on protected routes), **404** (missing note).

---

## Actuator

- **`GET /actuator/health`** — exposed; includes probe support in configuration.

---

## Spring configuration (`application.yml`)

| Key / env | Purpose | Default (typical) |
|-----------|---------|-------------------|
| `SPRING_DATASOURCE_URL` | JDBC URL | `jdbc:postgresql://localhost:5432/notes` |
| `SPRING_DATASOURCE_USERNAME` | DB user | `notes` |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `changeme` |
| `spring.jpa.hibernate.ddl-auto` | Hibernate schema mode vs DB | `validate` (Flyway owns migrations under `db/migration/`) |
| `JWT_SECRET` → `app.jwt.secret` | HMAC key for signing JWTs (required in env for normal startup) | _empty — must be set_ |
| `JWT_ISSUER` → `app.jwt.issuer` | JWT `iss` claim | `notes-api` |
| `JWT_ACCESS_TOKEN_TTL` → `app.jwt.access-token-ttl` | Access token lifetime (ISO-8601 duration) | `PT1H` |
| `CORS_ALLOWED_ORIGINS` → `app.cors.allowed-origins` | Allowed browser `Origin` values (comma-separated; include literal `null` for packaged Electron `file://` fetch) | `http://localhost:5173,null` |
| `SERVER_PORT` | HTTP port | `8080` |

---

## Frontend environment

| Variable | Purpose | Default when unset |
|----------|---------|---------------------|
| `VITE_API_URL` | API origin for `fetch` | `http://localhost:8080` |

Only variables prefixed with `VITE_` are exposed to client code. **Do not** put database passwords or `JWT_SECRET` in frontend env files.

## Docker Compose (`notes-app/docker-compose.yml`)

| Service | Image | Host port |
|---------|-------|-----------|
| `postgres` | `postgres:16-alpine` | `${POSTGRES_PORT:-5432}` → 5432 |

Environment for the container uses `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (see `notes-app/.env.example`).
