# Explanation: How NotesMD works

This page explains how the **NotesMD app** and **your self-hosted server** fit together — without implementation details or source code.

---

## The big picture

NotesMD separates **where you write notes** (the app) from **where notes are stored** (your server):

```text
┌─────────────────────┐         HTTPS or HTTP          ┌──────────────────────────┐
│   NotesMD app       │  ───────────────────────────►  │  Your NotesMD server     │
│   (your computer)   │  register, login, notes CRUD   │  API + PostgreSQL        │
└─────────────────────┘                                └──────────────────────────┘
        │                                                          │
        │  Stores locally: server URL, login session               │  Stores: accounts,
        │  (not your note content long-term in a cloud)            │  note titles & Markdown
        └──────────────────────────────────────────────────────────┘
```

- **notesmd.micnapoli.com** is where you **download the app**. It does not store your notes or accounts.
- **Your server** (this repository, run with Docker) stores **all** account and note data in **your** PostgreSQL database.
- The **app** is the everyday interface: sign in, list notes, edit Markdown, save.

---

## What runs on your server

When you run `docker compose up -d` from `notes-app/`:

1. **PostgreSQL** — durable storage for users and notes.
2. **NotesMD API** — handles registration, login, and note create/read/update/delete.

The API requires a **login token** (JWT) for every note operation. Each user sees **only their own notes**; the server enforces that on every request.

---

## What the app does

After you [download the app](../DOWNLOADS.md):

1. You enter **your server URL** once (for example `http://localhost:8080` or `https://notes.yourdomain.com`).
2. On **Register** or **Sign in**, the app talks to **your** server and receives a short-lived access token.
3. For each action (list notes, save, delete), the app sends requests to **your** server with that token.
4. The app keeps the server URL and session on **your device** so you do not re-enter them every time.

You can point the same app at different servers over time via **Settings → Server URL**; each server has its own accounts and notes.

---

## Typical request flow

1. **Register or sign in** — the app sends your username and password to your server; the server returns an access token if credentials are valid.
2. **List notes** — the app asks your server for notes belonging to your account.
3. **Create or edit** — the app sends the title and Markdown body; the server saves them linked to your account.
4. **Delete** — the app asks the server to remove a note you own.

If the token expires or the server rejects it, the app asks you to sign in again.

---

## Security and privacy (self-hosted scope)

- **Passwords** are stored on your server as one-way hashes, not plain text.
- **Note content** never passes through notesmd.micnapoli.com; it stays between your app and your server.
- **You control** backups, network exposure, HTTPS, and who can reach the server.
- Set a strong **`JWT_SECRET`** and database password in `.env` for any server that is shared or reachable from a network.

NotesMD is a focused notes product, not a full identity platform: there is no built-in two-factor authentication, device management, or rate limiting. Treat network access and secrets according to your own threat model.

---

## Cross-origin access (why CORS matters)

Browsers and the desktop app identify themselves with an **Origin** header. Your server must explicitly allow the app to call it via **`CORS_ALLOWED_ORIGINS`**.

For the standard desktop build, include **`null`** in that list (the default does). If you skip this, registration and login can fail even when the server is running. See [Configuration and troubleshooting — CORS](how-to-configuration-and-troubleshooting.md#fix-connection-and-cors-errors).

---

## Related reading

- [Download the app](../DOWNLOADS.md)
- [Tutorial: First run](tutorial-first-run.md)
- [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md)
- [Server configuration and API](reference-rest-api-and-configuration.md)
