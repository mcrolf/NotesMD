# Download NotesMD

The **NotesMD desktop app** (macOS, Windows, Linux) is built from the private [notesmd-frontend](https://github.com/mcrolf/notesmd-frontend) repository and hosted on your download server — not in this GitHub repo.

Replace `notesmd.example.com` below with your production hostname before publishing.

---

## Quick links

| Resource | URL |
|----------|-----|
| **Live download page** | [https://notesmd.example.com/download/](https://notesmd.example.com/download/) |
| **Release manifest** | [https://notesmd.example.com/downloads/notesmd/latest.json](https://notesmd.example.com/downloads/notesmd/latest.json) |

The download page reads `latest.json` at load time so platform links stay current after each release.

---

## Desktop installers

Fetch the current release manifest, then open the URL for your platform:

```bash
curl -s "https://notesmd.example.com/downloads/notesmd/latest.json"
```

| Platform | File type | Get download URL |
|----------|-----------|------------------|
| **macOS** | `.dmg` | `curl -s …/latest.json \| jq -r '.downloads.mac'` |
| **Windows** | `.exe` (NSIS) | `curl -s …/latest.json \| jq -r '.downloads.win'` |
| **Linux** | `.AppImage` | `curl -s …/latest.json \| jq -r '.downloads.linux'` |

Direct links (example for **v1.0.0** — update when a new version ships, or use the manifest commands above):

- [Download for macOS](https://notesmd.example.com/downloads/notesmd/v1.0.0/NotesMD-1.0.0.dmg)
- [Download for Windows](https://notesmd.example.com/downloads/notesmd/v1.0.0/NotesMD-1.0.0-setup.exe)
- [Download for Linux](https://notesmd.example.com/downloads/notesmd/v1.0.0/NotesMD-1.0.0.AppImage)

Verify integrity with the checksum file linked in `latest.json` (`sha256` field):

```bash
MANIFEST="https://notesmd.example.com/downloads/notesmd/latest.json"
SHA_URL="$(curl -s "$MANIFEST" | jq -r '.sha256')"
curl -sO "$SHA_URL"
# Download the installer, then:
sha256sum -c SHA256SUMS.txt   # Linux
shasum -a 256 -c SHA256SUMS.txt   # macOS
```

---

## After installing

1. Open **NotesMD** and go to **Register**.
2. Enter your **API URL** (e.g. `http://localhost:8080` for local dev, or your self-hosted HTTPS origin).
3. Create an account and start writing notes.

See [Tutorial: First run](docs/tutorial-first-run.md) and [Self-host the API](docs/how-to-configuration-and-troubleshooting.md#self-host-the-api-and-connect-the-frontend).

---

## Build from source

The React + Electron client is in the private [notesmd-frontend](https://github.com/mcrolf/notesmd-frontend) repository (access required). API contract and CORS notes are in [REST API reference](docs/reference-rest-api-and-configuration.md).

---

## Host your own download server

If you distribute builds yourself, use the nginx/Apache configs and manifest scripts under [`server/downloads/`](server/downloads/README.md). Deploy the static download page from [`server/website/`](server/website/README.md).
