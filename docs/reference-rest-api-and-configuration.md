# Reference: REST API and configuration

Factual descriptions of HTTP endpoints, payloads, and environment-driven settings.

---

## Base URL

- Default local API: `http://localhost:8080`
- **Authentication:** Requests to **`/api/notes`** and any other **`/api/*`** routes except **`/api/auth/register`** and **`/api/auth/login`** must include:

  **`Authorization: Bearer <access-token>`**

  Obtain `<access-token>` from [`POST /api/auth/login`](#post-apiauthlogin). The UI stores it after login/register and attaches it automatically.

The frontend resolves the API origin at **runtime** (no trailing slash; paths below are appended to that origin):

1. User-configured URL in browser storage (set at register/login or in Settings)
2. Optional build default `VITE_API_URL`
3. `http://localhost:8080`

For self-hosted deployments, users enter the origin of **their** API (e.g. `https://notes.example.com`). Database and JWT configuration remain on the server only.

---

## Endpoints

### `POST /api/auth/register`

Creates an account.

**Authentication:** none (public).

**Request body (JSON):**

| Field | Type | Constraints |
|-------|------|-------------|
| `username` | string | required; **3–255** characters (trimmed on use) |
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
| `tokenType` | string | Always `Bearer` in this API |
| `expiresIn` | number | Lifetime in **seconds** |
| `username` | string | Authenticated username |

**Errors:** `400` (validation), **`401 Unauthorized`** if the username/password pair is invalid ([error body](#error-responses)).

---

### Note endpoints (`/api/notes`)

Unless stated otherwise below, **`Authorization: Bearer <token>`** is **required**.

### `GET /api/notes`

Returns **the authenticated user’s** notes only, **newest first** by `createdAt`.

**Response:** `200 OK` — JSON array of [Note JSON objects](#note-json-object).

---

### `GET /api/notes/{id}`

**Path parameter:** `id` — UUID string.

**Response:**

- `200 OK` — single [Note JSON object](#note-json-object); only if **owned** by the current user
- `404 Not Found` — missing id or note belongs to another user ([error body](#error-responses))

---

### `POST /api/notes`

Creates a note **owned by the authenticated user**. Omitted or `null` fields use entity defaults (empty strings).

**Request body (JSON):**

| Field | Type | Constraints |
|-------|------|-------------|
| `title` | string | optional; max 500 characters |
| `contentMarkdown` | string | optional; max 1_000_000 characters |

**Response:** `201 Created` — [Note JSON object](#note-json-object)

**Errors:** `400` for validation ([error body](#error-responses))

---

### `PATCH /api/notes/{id}`

Updates a note **owned by the current user**. **Only non-null fields in the body are applied**; `null` means “leave unchanged.”

**Request body (JSON):** same fields as POST; all optional.

**Response:**

- `200 OK` — updated [Note JSON object](#note-json-object)
- `404 Not Found` — missing id or note belongs to another user

**Errors:** `400` for validation or malformed body/UUID

---

### `DELETE /api/notes/{id}`

Deletes a note **owned by the current user**.

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

Typical status codes: **400** (validation, bad input), **401** (missing/invalid JWT on protected routes or failed login), **404** (missing note **or** wrong owner), **409** (duplicate username on register).

---

## Actuator

- **`GET /actuator/health`** — public (no JWT). Used by the frontend to verify connectivity before register/login. Returns **`200 OK`** when the API is up. Subject to the same CORS rules as `/api/**`.

---

## CORS for browser and self-hosted clients

Browsers send an `Origin` header on cross-origin requests. The API must explicitly allow the origin of the **frontend page**, not the API hostname.

| Setting | Env var | Default |
|---------|---------|---------|
| Allowed origins (comma-separated) | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,null` |

**Self-host requirements:**

- Add every UI origin you use: local Vite (`http://localhost:5173`), custom dev ports, deployed HTTPS domains, etc.
- Include the literal token **`null`** only if you need packaged Electron or other clients that send `Origin: null` (common for `file://` renderers).
- CORS applies to **`/api/**`** and **`/actuator/**`**. If health checks or auth fail with no response body in DevTools, the UI origin is usually missing from `CORS_ALLOWED_ORIGINS`.

Example for a deployed UI plus local dev:

```bash
CORS_ALLOWED_ORIGINS=https://notes.example.com,http://localhost:5173,null
```

See [How-to: Fix browser CORS errors](how-to-configuration-and-troubleshooting.md#fix-browser-cors-errors) for troubleshooting.

---

## Spring configuration (`application.yml`)

| Key / env | Purpose | Default (typical) |
|-----------|---------|-------------------|
| `SPRING_DATASOURCE_URL` | JDBC URL | `jdbc:postgresql://localhost:5432/notesMD` |
| `SPRING_DATASOURCE_USERNAME` | DB user | `notes` |
| `SPRING_DATASOURCE_PASSWORD` | DB password | **Required** — set in environment (see `notes-app/.env.example`; no committed default) |
| `spring.jpa.hibernate.ddl-auto` | Hibernate schema mode vs DB | `validate` (Flyway owns migrations under `db/migration/`) |
| `JWT_SECRET` → `app.jwt.secret` | HS256 signing key (**set explicitly** for shared or production-like environments) | **`local-dev-only-jwt-signing-key-not-for-production-use`** if unset (embedded default in `application.yml` — **never rely on this outside local solo dev**) |
| `JWT_ISSUER` → `app.jwt.issuer` | JWT `iss` claim | `notes-api` |
| `JWT_ACCESS_TOKEN_TTL` → `app.jwt.access-token-ttl` | Access token lifetime (ISO-8601 duration) | `PT1H` |
| `CORS_ALLOWED_ORIGINS` → `app.cors.allowed-origins` | Allowed browser `Origin` values (comma-separated; include literal `null` for packaged Electron `file://` fetch) | `http://localhost:5173,null` |
| `SERVER_PORT` | HTTP port | `8080` |

---

## Frontend environment

| Variable | Purpose | Default when unset |
|----------|---------|---------------------|
| `VITE_API_URL` | Optional build-time default for the API origin; pre-fills the server URL field in the UI | Falls through to `http://localhost:8080` if the user has not set a URL in the app |

**Runtime API URL (primary for self-hosting):** stored in browser `localStorage` when the user submits Register, Sign in (with an optional changed URL), or saves Settings. It overrides `VITE_API_URL`. Changing it clears the tab-scoped auth session.

Only variables prefixed with `VITE_` are exposed to client code. **Do not** put database passwords or `JWT_SECRET` in frontend env files. The API origin URL is public by design.

## Docker Compose (`notes-app/docker-compose.yml`)

| Service | Image | Host port |
|---------|-------|-----------|
| `postgres` | `postgres:16-alpine` | `${POSTGRES_PORT:-5432}` → 5432 |

Environment for the container uses `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (see `notes-app/.env.example`).
