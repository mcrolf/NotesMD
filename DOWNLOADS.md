# Download NotesMD

Install the **NotesMD app** to write and manage Markdown notes against a server **you** control.

| Resource | URL |
|----------|-----|
| **Website and downloads** | [https://notesmd.micnapoli.com](https://notesmd.micnapoli.com) |
| **Release manifest** | [https://notesmd.micnapoli.com/downloads/notesmd/latest.json](https://notesmd.micnapoli.com/downloads/notesmd/latest.json) |

The download page lists current installers for **macOS**, **Windows**, and **Linux**, plus SHA256 checksums when published with the release.

---

## Before you install

NotesMD is designed for **self-hosting**:

- You (or your organization) run the **NotesMD server** — PostgreSQL plus the API — on hardware or cloud you control.
- The **NotesMD app** is the client you use every day; it connects to **your** server URL.

If you do not have a server yet, follow [Tutorial: First run](docs/tutorial-first-run.md) after installing the app.

---

## Install the app

1. Open [https://notesmd.micnapoli.com](https://notesmd.micnapoli.com) and download the installer for your platform.
2. Run the installer and open **NotesMD**.
3. On first launch, go to **Register** (or **Sign in** if you already have an account on your server).

**macOS (unsigned builds):** if Gatekeeper blocks the app, right-click the app → **Open**, then confirm.

**Windows (unsigned builds):** if SmartScreen warns about an unknown publisher, choose **More info** → **Run anyway**.

---

## Connect to your server

On **Register**:

1. Enter **Your NotesMD server** — the base URL of the API with **no** trailing slash and **no** `/api` path.
   - Local server on the same machine: `http://localhost:8080`
   - Server on your network: `http://192.168.1.50:8080` or your hostname
   - Internet-facing server: `https://notes.yourdomain.com`
2. Choose a **username** (3 or more characters) and **password** (8 or more characters).
3. Complete registration — your account is created **on your server**, not on notesmd.micnapoli.com.

On **Sign in**, the app reuses the last server URL. Use **Use a different server** if you need to point at another backend.

After you are signed in, use **Settings → Server URL** to change servers (you will need to sign in again).

---

## Verify downloads (optional)

If a release includes checksums, you can confirm the file you downloaded:

```bash
curl -sO "https://notesmd.micnapoli.com/downloads/notesmd/v1.0.0/SHA256SUMS.txt"
curl -sO "https://notesmd.micnapoli.com/downloads/notesmd/v1.0.0/NotesMD-1.0.0.dmg"
sha256sum -c SHA256SUMS.txt
```

Replace the version and filename with those shown on the download page or in [latest.json](https://notesmd.micnapoli.com/downloads/notesmd/latest.json).

---

## Next steps

- [Tutorial: First run](docs/tutorial-first-run.md) — set up the server with Docker.
- [Configuration and troubleshooting](docs/how-to-configuration-and-troubleshooting.md) — environment variables, CORS, and common fixes.
- [Documentation index](docs/README.md) — full list of guides.
