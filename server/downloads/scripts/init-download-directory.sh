#!/usr/bin/env bash
# Creates the on-disk layout for NotesMD desktop release artifacts.
set -euo pipefail

DOWNLOADS_ROOT="${DOWNLOADS_ROOT:-/var/www/downloads/notesmd}"
OWNER="${OWNER:-www-data}"
GROUP="${GROUP:-www-data}"

usage() {
  cat <<'EOF'
Usage: init-download-directory.sh [--root DIR] [--owner USER:GROUP]

Creates:
  <root>/latest.json          (placeholder until first release)
  <root>/v<version>/            (per-release directories)

Environment:
  DOWNLOADS_ROOT   Default root (default: /var/www/downloads/notesmd)
  OWNER            File owner (default: www-data)
  GROUP            File group (default: www-data)

Example:
  sudo DOWNLOADS_ROOT=/var/www/downloads/notesmd ./init-download-directory.sh
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root)
      DOWNLOADS_ROOT="$2"
      shift 2
      ;;
    --owner)
      IFS=: read -r OWNER GROUP <<< "$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ ! -d "$(dirname "$DOWNLOADS_ROOT")" ]]; then
  echo "Parent directory does not exist: $(dirname "$DOWNLOADS_ROOT")" >&2
  echo "Create /var/www (or your web root) first, or pass --root." >&2
  exit 1
fi

mkdir -p "$DOWNLOADS_ROOT"

# Placeholder manifest until CI or generate-release-manifest.sh publishes a real release
if [[ ! -f "$DOWNLOADS_ROOT/latest.json" ]]; then
  cat >"$DOWNLOADS_ROOT/latest.json" <<'EOF'
{
  "version": null,
  "released": null,
  "downloads": {
    "mac": null,
    "win": null,
    "linux": null
  },
  "sha256": null
}
EOF
fi

# Set ownership when the web-server user exists (typical Linux deploy host)
if [[ "${EUID:-$(id -u)}" -eq 0 ]] && id "$OWNER" >/dev/null 2>&1; then
  chown -R "${OWNER}:${GROUP}" "$DOWNLOADS_ROOT"
  chmod -R u=rwX,g=rX,o=rX "$DOWNLOADS_ROOT"
else
  chmod -R u=rwX,go=rX "$DOWNLOADS_ROOT" 2>/dev/null || chmod -R a=rX "$DOWNLOADS_ROOT"
  echo "Note: skipped chown (run as root on the server to set ${OWNER}:${GROUP})." >&2
fi

echo "NotesMD download directory ready at: $DOWNLOADS_ROOT"
echo "Upload release artifacts to: $DOWNLOADS_ROOT/v<semver>/"
echo "Then run: generate-release-manifest.sh --version <semver> --base-url https://<host>/downloads/notesmd"
