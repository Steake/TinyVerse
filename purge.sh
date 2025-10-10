#!/usr/bin/env zsh

set -euo pipefail

# TinyVerse dev purge script
# - Tries admin reset endpoint first
# - Falls back to deleting local SQLite DB and clearing logs

BACKEND_URL=${BACKEND_URL:-"http://localhost:8000"}
RESET_ENDPOINT="$BACKEND_URL/api/admin/reset"

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
DB_CANDIDATES=(
  "$ROOT_DIR/backend/tinyverse.db"
  "$ROOT_DIR/backend/app/tinyverse.db"
)
LOG_FILES=(
  "$ROOT_DIR/logs/backend.log"
  "$ROOT_DIR/logs/frontend.log"
)

print_header() {
  echo "\n===== $1 ====="
}

try_admin_reset() {
  print_header "Attempting admin reset via API: $RESET_ENDPOINT"
  set +e
  RESPONSE=$(curl -sS -X POST "$RESET_ENDPOINT" \
    -H 'Content-Type: application/json' \
    --data '{"confirm": true}')
  STATUS=$?
  set -e
  if [[ $STATUS -eq 0 && "$RESPONSE" == *"\"status\": \"ok\""* ]]; then
    echo "Admin reset OK"
    echo "$RESPONSE"
    return 0
  else
    echo "Admin reset not available or failed; falling back."
    return 1
  fi
}

delete_sqlite() {
  print_header "Deleting SQLite database (if present)"
  local deleted=0
  for db in ${DB_CANDIDATES[@]}; do
    if [[ -f "$db" ]]; then
      rm -f "$db"
      echo "Removed: $db"
      deleted=1
    fi
  done
  if [[ $deleted -eq 0 ]]; then
    echo "No local DB file found. Skipping."
  fi
}

clear_logs() {
  print_header "Clearing logs"
  local cleared=0
  for f in ${LOG_FILES[@]}; do
    if [[ -f "$f" ]]; then
      : > "$f"
      echo "Truncated: $f"
      cleared=1
    fi
  done
  if [[ $cleared -eq 0 ]]; then
    echo "No logs to clear."
  fi
}

main() {
  if try_admin_reset; then
    : # done
  else
    delete_sqlite
    clear_logs
  fi

  print_header "Purge complete"
}

main "$@"
