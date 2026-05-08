# Explanation: Architecture and data flow

This document explains how the Notes demo is structured and why, without step-by-step commands.

---

## Purpose of the system

The app lets users maintain a simple collection of notes where each note has a title and a **Markdown** body. The browser UI renders Markdown for reading and accepts Markdown when editing. Persistence is relational: one row per note, with server-generated timestamps.

---

## Major components

1. **React SPA (Vite)** — routing for list, create, and detail views; calls the REST API with `fetch`; uses `VITE_API_URL` so the same build can target different API hosts.
2. **Spring Boot service** — exposes JSON under `/api/notes`, validates input, maps exceptions to consistent JSON errors, applies CORS for browser access.
3. **PostgreSQL** — durable storage for notes in development and demos. JPA maps the `Note` entity to a `notes` table; Hibernate `ddl-auto: update` adjusts the schema in development.

Tests swap in **H2** in-memory via `src/test/resources/application.yml`, so CI and local test runs do not need Postgres.

---

## Request flow (happy path)

1. The user opens the list page; the UI sends `GET /api/notes`.
2. The controller delegates to a transactional service, which loads entities via Spring Data JPA, orders by `createdAt` descending, and returns DTOs (`NoteResponse` records).
3. For create/update, JSON bodies are deserialized into request records, validated (size limits), applied to entities, and saved. `PATCH` only overwrites fields that are present and non-null in the JSON, which matches common partial-update semantics.

---

## Cross-origin access

Browsers block cross-origin calls unless the server opts in. The demo enables CORS for `/api/**` from configurable origins so the Vite dev server (or a deployed static site) can talk to the API. That is a deliberate tradeoff for simplicity: in production you might terminate TLS on a gateway, restrict origins tightly, or serve the UI and API behind the same host.

---

## Error model

A `@RestControllerAdvice` maps not-found, validation, and malformed input to JSON `ErrorResponse` payloads with HTTP status. The TypeScript client parses those bodies when present and throws an `ApiError` the pages can surface (for example via toasts).

---

## Security posture (demo scope)

This sample does **not** implement authentication or authorization. Any client that can reach the API can read and mutate all notes. That is acceptable for local demos; a real product would add identity, tenancy, and auditing on top of the same REST shape.

---

## Related reading

- [First run tutorial](tutorial-first-run.md)
- [Configuration how-to](how-to-configuration-and-troubleshooting.md)
- [API reference](reference-rest-api-and-configuration.md)
