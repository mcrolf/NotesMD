# Explanation: Architecture and data flow

This document explains how the **NotesMD** demo is structured and why, without step-by-step commands.

---

## Purpose of the system

Authenticated users maintain a Markdown note collection (**title + `contentMarkdown`**). The SPA renders Markdown for reading and edits plain Markdown in forms. Persistence is relational: **users**, **notes** with an **owner** foreign key, and server-generated timestamps. Each user sees **only their own notes** at the REST layer.

---

## Major components

1. **React SPA (Vite)** — Routing with **React Router**: public **`/login`** and **`/register`**, authenticated area under **`ProtectedRoute`** (notes list **`/notes`**, create **`/notes/new`**, detail **`/notes/:id`**). Root **`/`** redirects into that tree. **`AuthProvider`** holds session state and supplies `Authorization` headers via the API client (`fetch`). **`VITE_API_URL`** selects the API origin. For packaged **Electron** or **`file:`** origins, **`HashRouter`** avoids path issues; otherwise **`BrowserRouter`** is used.
2. **Spring Boot API** — JSON under **`/api/auth`** (register/login) and **`/api/notes`** (CRUD). **Spring Security** is **stateless**: a **JWT** filter validates the bearer token except on the two auth routes and actuator health. **CORS** is configured for **`/api/**`** using **`CORS_ALLOWED_ORIGINS`** (including literal **`null`** for some **`file:`**/`Origin: null` clients). Input is validated; errors map to a consistent **`ErrorResponse`** JSON shape.
3. **PostgreSQL** — Durable storage. **Flyway** applies migrations under **`db/migration/`**; Hibernate **`ddl-auto: validate`** ensures the schema matches entities.

Tests swap in **H2** in-memory via `src/test/resources/application.yml`, so CI and local test runs do not need Postgres.

---

## Request flow (happy path)

1. The user **registers** or **logs in**; the UI calls **`POST /api/auth/register`** or **`POST /api/auth/login`** and stores **`accessToken`** (and related fields) in **`localStorage`** (see `authStorage`).
2. The user opens the list; the client sends **`GET /api/notes`** with **`Authorization: Bearer <accessToken>`**.
3. The controller resolves the **current user id** from the JWT; the service loads **`Note`** rows **for that owner only**, ordered by **`createdAt`** descending, and returns **`NoteResponse`** records.
4. For create/update, JSON bodies map to request records, validation runs, entities are saved with the correct **owner**. **`PATCH`** applies only **non-null** fields. **GET one / PATCH / DELETE** return **404** if the id does not exist **or** belongs to another user (no cross-tenant leakage).

---

## Cross-origin access

Browsers block cross-origin calls unless the server opts in. The demo enables CORS for **`/api/**`** from configurable origins so the Vite dev server (or a deployed static site, or Electron with **`Origin: null`**) can call the API. In production you would typically tighten origins, terminate TLS at a gateway, or co-locate UI and API behind one host.

---

## Error model

A **`@RestControllerAdvice`** maps not-found, validation, conflict (duplicate username), invalid credentials, and malformed input to JSON **`ErrorResponse`** payloads with HTTP status. The TypeScript client parses those bodies when present and throws **`ApiError`**; **`401`** on an authenticated request triggers the session **`unauthorizedHandler`** (logout / redirect to login).

---

## Security posture (demo scope)

The app **does** implement **authentication** and **per-user authorization** for notes:

- Passwords are stored as **bcrypt** hashes; login issues a short-lived **JWT** (HS256, configurable TTL).
- **Note APIs require a valid JWT**; data access is **scoped by owner id** embedded in the token.

It is still a **demo**: there is no refresh-token flow, no device/session management, no step-up auth, and no rate limiting or account lockout at the application layer. Treat **`JWT_SECRET`** like any signing key (**strong value in `.env`** for shared or staging/prod-like runs; **`application.yml`** supplies a **dev-only default** only so a solo developer can boot without exporting **`JWT_SECRET`**).

---

## Related reading

- [First run tutorial](tutorial-first-run.md)
- [Configuration how-to](how-to-configuration-and-troubleshooting.md)
- [API reference](reference-rest-api-and-configuration.md)
