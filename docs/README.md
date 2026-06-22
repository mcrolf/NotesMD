# Documentation

This documentation follows the [Diátaxis](https://diataxis.fr/) structure: separate entry points for learning, tasks, facts, and background.

| Type | Document | Use it when… |
|------|----------|----------------|
| **Tutorial** | [First run: self-host the API](tutorial-first-run.md) | You want a guided path from zero to a running API on your machine. |
| **How-to** | [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md) | You need to set environment variables, fix CORS, or connect the NotesMD client. |
| **How-to** | [Upgrade an existing deployment](how-to-upgrade-existing-deployment.md) | You already self-host and want to pull a new release without wiping Postgres. |
| **How-to** | [Host desktop download artifacts](how-to-desktop-download-hosting.md) | You are serving Electron installers over HTTPS with `latest.json` and SHA256 checksums. |
| **How-to** | [Code-sign desktop releases](how-to-desktop-code-signing.md) | You are enabling Apple Developer ID + Windows Authenticode after unsigned v1 validates the pipeline. |
| **Reference** | [DOWNLOADS.md](../DOWNLOADS.md) | End-user download links for GitHub; pairs with the static page in [`server/website/`](../server/website/README.md). |
| **Reference** | [REST API and configuration](reference-rest-api-and-configuration.md) | You need exact endpoints, payloads, status codes, or config keys. |
| **Explanation** | [Architecture and data flow](explanation-architecture-and-data-flow.md) | You want to understand how the pieces fit together and why they are shaped this way. |

## Project layout (reminder)

- Backend and Compose: `notes-app/backend/`, `notes-app/docker-compose.yml`
- Environment template (commit this; use placeholders only): `notes-app/.env.example`
- NotesMD client (React + Electron): separate repository
- Local secrets and editor dirs: never commit — see repository [`.gitignore`](../.gitignore) (e.g. `.env`, `.env.*`, `.cursor/`, `.vscode/`)
