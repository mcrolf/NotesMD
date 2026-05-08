# Documentation

This documentation follows the [Diátaxis](https://diataxis.fr/) structure: separate entry points for learning, tasks, facts, and background.

| Type | Document | Use it when… |
|------|----------|----------------|
| **Tutorial** | [First run: Notes app end-to-end](tutorial-first-run.md) | You want a guided path from zero to a working app on your machine. |
| **How-to** | [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md) | You need to set environment variables, fix CORS, or point the UI at another API URL. |
| **Reference** | [REST API and configuration](reference-rest-api-and-configuration.md) | You need exact endpoints, payloads, status codes, or config keys. |
| **Explanation** | [Architecture and data flow](explanation-architecture-and-data-flow.md) | You want to understand how the pieces fit together and why they are shaped this way. |

## Project layout (reminder)

- Application code: `notes-app/`
- Environment templates (commit these; use placeholders only): `notes-app/.env.example`, `notes-app/frontend/.env.example`
- Local secrets and editor dirs: never commit — see repository [`.gitignore`](../.gitignore) (e.g. `.env`, `.env.*`, `.cursor/`, `.vscode/`)
