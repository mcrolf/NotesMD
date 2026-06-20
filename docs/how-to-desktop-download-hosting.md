# How-to: Host desktop download artifacts

Serve NotesMD Electron installers over **HTTPS** from `/downloads/notesmd/` on your domain, with a **`latest.json`** manifest and **SHA256** checksums for each release.

---

## When to use this

- You are publishing macOS, Windows, and Linux builds from the private [notesmd-frontend](https://github.com/mcrolf/notesmd-frontend) repository.
- Your website or public README should link to stable download URLs without attaching binaries to GitHub.

---

## Server layout

```text
/var/www/downloads/notesmd/
  latest.json
  v1.0.0/
    NotesMD-1.0.0.dmg
    NotesMD-1.0.0-setup.exe
    NotesMD-1.0.0.AppImage
    SHA256SUMS.txt
```

Repository configs and scripts live under [`server/downloads/`](../server/downloads/README.md).

---

## Setup checklist

1. **Initialize the directory** on the host:

   ```bash
   sudo bash server/downloads/scripts/init-download-directory.sh
   ```

2. **Enable HTTPS** — copy the nginx or Apache vhost from [`server/downloads/nginx/`](../server/downloads/nginx/notesmd-downloads.conf) or [`server/downloads/apache/`](../server/downloads/apache/notesmd-downloads.conf), replace `DOWNLOADS_DOMAIN`, and obtain TLS certificates (Let's Encrypt / certbot).

3. **Confirm MIME types** — installers must not be served as `application/octet-stream` if you want OS installers to behave predictably. The provided configs map `.dmg`, `.exe`, and `.AppImage` explicitly.

4. **Upload artifacts** into `/var/www/downloads/notesmd/v<semver>/` after each release build.

5. **Publish the manifest**:

   ```bash
   sudo bash server/downloads/scripts/generate-release-manifest.sh \
     --version 1.0.0 \
     --base-url https://YOUR_DOMAIN/downloads/notesmd
   ```

   This writes `SHA256SUMS.txt` in the version directory and updates root `latest.json`.

---

## `latest.json` schema

```json
{
  "version": "1.0.0",
  "released": "2026-06-16",
  "downloads": {
    "mac": "https://YOUR_DOMAIN/downloads/notesmd/v1.0.0/NotesMD-1.0.0.dmg",
    "win": "https://YOUR_DOMAIN/downloads/notesmd/v1.0.0/NotesMD-1.0.0-setup.exe",
    "linux": "https://YOUR_DOMAIN/downloads/notesmd/v1.0.0/NotesMD-1.0.0.AppImage"
  },
  "sha256": "https://YOUR_DOMAIN/downloads/notesmd/v1.0.0/SHA256SUMS.txt"
}
```

Fetch `https://YOUR_DOMAIN/downloads/notesmd/latest.json` from the [download page](../server/website/download/index.html) (deploy from [`server/website/`](../server/website/README.md)) or link from [DOWNLOADS.md](../DOWNLOADS.md) when a new version ships.

---

## Verify downloads

```bash
curl -s "https://YOUR_DOMAIN/downloads/notesmd/latest.json" | jq .

curl -sO "https://YOUR_DOMAIN/downloads/notesmd/v1.0.0/SHA256SUMS.txt"
curl -sO "https://YOUR_DOMAIN/downloads/notesmd/v1.0.0/NotesMD-1.0.0.dmg"
sha256sum -c SHA256SUMS.txt
```

---

## Related

- [Configuration and troubleshooting](how-to-configuration-and-troubleshooting.md) — API CORS includes `null` for packaged Electron clients.
- [Code-sign desktop releases](how-to-desktop-code-signing.md) — Apple Developer ID and Windows Authenticode for production installers.
- [`server/downloads/README.md`](../server/downloads/README.md) — nginx/Apache details and CI notes.
