# NotesMD documentation

NotesMD is **self-hosted Markdown notes**: you run the server on your own machine or infrastructure, install the **NotesMD app**, and connect it to **your** server. Your notes stay in **your** database.

| Resource | URL |
|----------|-----|
| **Website and downloads** | [https://notesmd.micnapoli.com](https://notesmd.micnapoli.com) |
| **Release manifest** | [https://notesmd.micnapoli.com/downloads/notesmd/latest.json](https://notesmd.micnapoli.com/downloads/notesmd/latest.json) |

---

## Start here

| Step | Document | What you will do |
|------|----------|------------------|
| 1 | [Download the app](../DOWNLOADS.md) | Install NotesMD for macOS, Windows, or Linux from the website. |
| 2 | [Tutorial: First run](tutorial-first-run.md) | Run the NotesMD server with Docker, then register in the app. |
| 3 | [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md) | Set passwords and secrets, fix connection issues, change server URL in the app. |

---

## Guides

| Type | Document | Use it when… |
|------|----------|----------------|
| **Tutorial** | [First run: self-host NotesMD](tutorial-first-run.md) | You want a guided path from zero to a running server and your first note. |
| **How-to** | [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md) | You need to configure the server, connect the app, or fix CORS or login problems. |
| **How-to** | [Upgrade an existing deployment](how-to-upgrade-existing-deployment.md) | You already self-host and want a newer server release without losing your notes. |
| **Reference** | [Server configuration and API](reference-rest-api-and-configuration.md) | You need exact environment variables, endpoints, or error codes. |
| **Explanation** | [How NotesMD works](explanation-architecture-and-data-flow.md) | You want to understand what runs where and how your data is stored. |

---

## Typical workflow

1. **Download** the NotesMD desktop app from [notesmd.micnapoli.com](https://notesmd.micnapoli.com).
2. **Self-host** the server using Docker (see the [first-run tutorial](tutorial-first-run.md)).
3. **Open the app**, go to **Register**, and enter your server URL (for example `http://localhost:8080` on your own machine, or `https://notes.yourdomain.com` if you exposed it on the internet).
4. **Create an account** — registration happens on **your** server; the app only stores the server address and your login session locally.
5. **Write notes** — the app talks to your server over HTTPS or HTTP on your network; note content is stored in **your** PostgreSQL database.

For day-to-day use you only need the **app** and a **running server**. You do not need to build the app from source or change any client-side configuration files.
