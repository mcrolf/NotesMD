#!/usr/bin/env bash
# Writes SHA256SUMS.txt and latest.json for a NotesMD desktop release directory.
set -euo pipefail

VERSION=""
BASE_URL=""
RELEASES_ROOT="${RELEASES_ROOT:-/var/www/downloads/notesmd}"
RELEASED_DATE="$(date -u +%Y-%m-%d)"

usage() {
  cat <<'EOF'
Usage: generate-release-manifest.sh --version VERSION --base-url URL [options]

Required:
  --version VERSION   Semver without leading v (e.g. 1.0.0)
  --base-url URL      Public URL prefix (no trailing slash), e.g.
                      https://notesmd.example.com/downloads/notesmd

Options:
  --releases-root DIR Root download directory (default: /var/www/downloads/notesmd)
  --released DATE     ISO date for latest.json (default: today, UTC)
  --dry-run           Print actions without writing files

Expects artifacts in <releases-root>/v<VERSION>/ matching NotesMD-*.{dmg,exe,AppImage}
(or NotesMD-*-setup.exe for Windows NSIS). Writes:
  <releases-root>/v<VERSION>/SHA256SUMS.txt
  <releases-root>/latest.json

Example:
  ./generate-release-manifest.sh \
    --version 1.0.0 \
    --base-url https://notesmd.example.com/downloads/notesmd
EOF
}

DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      VERSION="${2#v}"
      shift 2
      ;;
    --base-url)
      BASE_URL="${2%/}"
      shift 2
      ;;
    --releases-root)
      RELEASES_ROOT="$2"
      shift 2
      ;;
    --released)
      RELEASED_DATE="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
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

if [[ -z "$VERSION" || -z "$BASE_URL" ]]; then
  echo "Missing required --version and/or --base-url." >&2
  usage >&2
  exit 1
fi

VERSION_DIR="${RELEASES_ROOT}/v${VERSION}"

if [[ ! -d "$VERSION_DIR" ]]; then
  echo "Release directory not found: $VERSION_DIR" >&2
  exit 1
fi

# Collect installer artifacts (electron-builder: NotesMD-1.0.0.dmg, NotesMD-1.0.0-setup.exe, etc.)
ARTIFACTS=()
while IFS= read -r artifact; do
  ARTIFACTS+=("$artifact")
done < <(
  find "$VERSION_DIR" -maxdepth 1 -type f \( \
    -name 'NotesMD-*.dmg' -o \
    -name 'NotesMD-*.exe' -o \
    -name 'NotesMD-*.AppImage' \
  \) | sort
)

if [[ ${#ARTIFACTS[@]} -eq 0 ]]; then
  echo "No NotesMD installer files found in $VERSION_DIR" >&2
  exit 1
fi

MAC_URL=""
WIN_URL=""
LINUX_URL=""

for artifact in "${ARTIFACTS[@]}"; do
  filename="$(basename "$artifact")"
  url="${BASE_URL}/v${VERSION}/${filename}"

  case "$filename" in
    *.dmg) MAC_URL="$url" ;;
    *.exe) WIN_URL="$url" ;;
    *.AppImage) LINUX_URL="$url" ;;
  esac
done

SHA256_FILE="${VERSION_DIR}/SHA256SUMS.txt"
LATEST_FILE="${RELEASES_ROOT}/latest.json"

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "Would write checksums to: $SHA256_FILE"
  echo "Would write manifest to:  $LATEST_FILE"
  printf '  mac:   %s\n' "${MAC_URL:-<missing>}"
  printf '  win:   %s\n' "${WIN_URL:-<missing>}"
  printf '  linux: %s\n' "${LINUX_URL:-<missing>}"
  exit 0
fi

# SHA256SUMS.txt — GNU coreutils on Linux CI; shasum fallback for local macOS uploads
BASENAMES=()
for artifact in "${ARTIFACTS[@]}"; do
  BASENAMES+=("$(basename "$artifact")")
done

if command -v sha256sum >/dev/null 2>&1; then
  (
    cd "$VERSION_DIR"
    sha256sum "${BASENAMES[@]}"
  ) >"$SHA256_FILE"
elif command -v shasum >/dev/null 2>&1; then
  (
    cd "$VERSION_DIR"
    shasum -a 256 "${BASENAMES[@]}"
  ) >"$SHA256_FILE"
else
  echo "Neither sha256sum nor shasum found." >&2
  exit 1
fi

SHA256_URL="${BASE_URL}/v${VERSION}/SHA256SUMS.txt"

# latest.json at releases root for website and README consumers
cat >"$LATEST_FILE" <<EOF
{
  "version": "${VERSION}",
  "released": "${RELEASED_DATE}",
  "downloads": {
    "mac": $( [[ -n "$MAC_URL" ]] && printf '"%s"' "$MAC_URL" || printf 'null' ),
    "win": $( [[ -n "$WIN_URL" ]] && printf '"%s"' "$WIN_URL" || printf 'null' ),
    "linux": $( [[ -n "$LINUX_URL" ]] && printf '"%s"' "$LINUX_URL" || printf 'null' )
  },
  "sha256": "${SHA256_URL}"
}
EOF

echo "Wrote ${SHA256_FILE}"
echo "Wrote ${LATEST_FILE}"
echo "Verify URLs:"
printf '  mac:   %s\n' "${MAC_URL:-<missing — add NotesMD-*.dmg>}"
printf '  win:   %s\n' "${WIN_URL:-<missing — add NotesMD-*.exe>}"
printf '  linux: %s\n' "${LINUX_URL:-<missing — add NotesMD-*.AppImage>}"

if [[ -z "$MAC_URL" || -z "$WIN_URL" || -z "$LINUX_URL" ]]; then
  echo "Warning: one or more platform artifacts are missing." >&2
  exit 2
fi
