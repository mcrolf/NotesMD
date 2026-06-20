# NotesMD desktop download hosting

Static HTTPS hosting for NotesMD Electron installers at `/downloads/notesmd/`.

## Directory layout

On the web server:

```text
/var/www/downloads/notesmd/
  latest.json                 # current release manifest (website + README)
  v1.0.0/
    NotesMD-1.0.0.dmg
    NotesMD-1.0.0-setup.exe
    NotesMD-1.0.0.AppImage
    SHA256SUMS.txt
  v1.0.1/
    ...
```

Public URLs (replace `notesmd.example.com` with your hostname):

| Resource | URL |
|----------|-----|
| Latest manifest | `https://notesmd.example.com/downloads/notesmd/latest.json` |
| macOS installer | `https://notesmd.example.com/downloads/notesmd/v1.0.0/NotesMD-1.0.0.dmg` |
| Windows installer | `https://notesmd.example.com/downloads/notesmd/v1.0.0/NotesMD-1.0.0-setup.exe` |
| Linux AppImage | `https://notesmd.example.com/downloads/notesmd/v1.0.0/NotesMD-1.0.0.AppImage` |
| Checksums | `https://notesmd.example.com/downloads/notesmd/v1.0.0/SHA256SUMS.txt` |

See [`examples/latest.json`](examples/latest.json) for the manifest schema.

## Quick setup

1. **Create the download tree** on the server:

   ```bash
   sudo bash server/downloads/scripts/init-download-directory.sh
   ```

2. **Configure HTTPS** with nginx or Apache:

   - **nginx:** copy [`nginx/notesmd-downloads.conf`](nginx/notesmd-downloads.conf) to `/etc/nginx/sites-available/`, replace `DOWNLOADS_DOMAIN`, obtain certs with certbot, then `nginx -t && systemctl reload nginx`.
   - **Apache:** copy [`apache/notesmd-downloads.conf`](apache/notesmd-downloads.conf), enable `ssl`, `headers`, and `rewrite`, replace `DOWNLOADS_DOMAIN`, obtain certs, then reload.

3. **Upload release artifacts** to `/var/www/downloads/notesmd/v<semver>/` (rsync/scp from CI or a local `npm run electron:build`).

4. **Generate checksums and `latest.json`:**

   ```bash
   sudo bash server/downloads/scripts/generate-release-manifest.sh \
     --version 1.0.0 \
     --base-url https://notesmd.example.com/downloads/notesmd
   ```

## MIME types and download behavior

Both web server configs set:

| Extension | Content-Type |
|-----------|----------------|
| `.json` | `application/json` |
| `.txt` | `text/plain` |
| `.dmg` | `application/x-apple-diskimage` |
| `.exe` | `application/vnd.microsoft.portable-executable` |
| `.AppImage` | `application/x-executable` |

Installers (`.dmg`, `.exe`, `.AppImage`) are served with `Content-Disposition: attachment`. `latest.json` is served with short cache TTL and `Access-Control-Allow-Origin: *` so the [marketing download page](../website/download/index.html) (or another origin) can fetch it.

## Verify a release

```bash
curl -sI "https://notesmd.example.com/downloads/notesmd/latest.json" | grep -i content-type
curl -s "https://notesmd.example.com/downloads/notesmd/latest.json" | jq .

curl -sI "https://notesmd.example.com/downloads/notesmd/v1.0.0/NotesMD-1.0.0.dmg" \
  | grep -Ei 'content-type|content-disposition'

# Verify checksums locally after download
curl -sO "https://notesmd.example.com/downloads/notesmd/v1.0.0/SHA256SUMS.txt"
curl -sO "https://notesmd.example.com/downloads/notesmd/v1.0.0/NotesMD-1.0.0.dmg"
sha256sum -c SHA256SUMS.txt
```

## CI integration

After electron-builder jobs upload artifacts into `v${VERSION}/` on the server, run `generate-release-manifest.sh` from the deploy job (same SSH session as rsync). Pass `--base-url` matching the public HTTPS prefix.

Release workflow (GitHub Actions matrix) lives in the private **notesmd-frontend** repository. **Code signing** (Apple Developer ID + Windows Authenticode) is planned for production releases after unsigned v1 — see [Code-sign desktop releases](../../docs/how-to-desktop-code-signing.md).
