# NotesMD marketing website (static)

Static assets for the public NotesMD site, including a **download page** that loads platform installer URLs from [`latest.json`](../downloads/examples/latest.json).

## Layout

```text
server/website/
  download/           # Deploy to https://<SITE_DOMAIN>/download/
    index.html
    assets/
      download.css
      download.js
  nginx/
    notesmd-website.conf
```

Installers and `latest.json` are served separately under `/downloads/notesmd/` — see [`server/downloads/`](../downloads/README.md).

## Deploy the download page

1. Copy `server/website/download/` to your web root, e.g. `/var/www/notesmd/download/`.
2. Enable the nginx vhost in [`nginx/notesmd-website.conf`](nginx/notesmd-website.conf) (replace `SITE_DOMAIN`), or serve the same files from Apache.
3. Ensure `latest.json` is reachable at `/downloads/notesmd/latest.json` on the **same origin** (default), or set `data-manifest-url` on the `<html>` element in `index.html` to the full manifest URL.

The download nginx config already sends `Access-Control-Allow-Origin: *` on `latest.json`, so cross-origin fetches work if the site and download host differ.

## Local preview

Serve the folder with any static server and point the manifest at a reachable URL:

```bash
cd server/website/download
python3 -m http.server 8765
```

Open `http://localhost:8765/?manifest=https://notesmd.example.com/downloads/notesmd/latest.json` to test against a remote manifest, or edit `data-manifest-url` on `<html>`.

## Related

- [DOWNLOADS.md](../../DOWNLOADS.md) — public download links and checksum instructions
- [`server/downloads/`](../downloads/README.md) — download tree layout and manifest scripts
