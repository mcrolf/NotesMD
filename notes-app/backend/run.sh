#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Load notes-app/.env when present (see notes-app/.env.example for required variables)
ENV_FILE="$(cd .. && pwd)/.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "Missing ${ENV_FILE} — copy notes-app/.env.example to notes-app/.env and set values." >&2
  exit 1
fi

exec ./gradlew bootRun
