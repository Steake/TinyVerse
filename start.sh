#!/bin/bash
# TinyVerse full stack launcher: starts backend + frontend, waits for readiness, opens browser.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR"
BACKEND_URL="http://localhost:8000/"
FRONTEND_URL="http://localhost:5173"

mkdir -p "$ROOT_DIR/logs"
BACKEND_LOG="$ROOT_DIR/logs/backend.log"
FRONTEND_LOG="$ROOT_DIR/logs/frontend.log"

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    EXIT_CODE=$?
    if [[ -n "${FRONTEND_PID}" ]]; then
        kill "${FRONTEND_PID}" >/dev/null 2>&1 || true
    fi
    if [[ -n "${BACKEND_PID}" ]]; then
        kill "${BACKEND_PID}" >/dev/null 2>&1 || true
    fi
    wait >/dev/null 2>&1 || true
    exit "${EXIT_CODE}"
}

trap cleanup EXIT INT TERM

wait_for_service() {
    local url="$1"
    local name="$2"
    local retries="${3:-60}"
    local delay="${4:-1}"

    for ((i=1; i<=retries; i++)); do
        if curl -fsS "$url" >/dev/null 2>&1; then
            echo "✅ $name is ready at $url"
            return 0
        fi
        printf "⏳ Waiting for %s (%d/%d)...\n" "$name" "$i" "$retries"
        sleep "$delay"
    done

    echo "❌ Timed out waiting for $name at $url"
    return 1
}

echo "🚀 Starting TinyVerse backend..."
(
    cd "$BACKEND_DIR"
    ./start.sh
) >"$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo "📄 Backend logs: $BACKEND_LOG"

wait_for_service "$BACKEND_URL" "Backend API"

if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm is required to run the frontend. Please install Node.js/npm and re-run."
    exit 1
fi

echo "🚀 Starting TinyVerse frontend..."
(
    cd "$FRONTEND_DIR"
    npm run dev -- --host
) >"$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
echo "📄 Frontend logs: $FRONTEND_LOG"

wait_for_service "$FRONTEND_URL" "Frontend UI"

if command -v open >/dev/null 2>&1; then
    open "$FRONTEND_URL"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$FRONTEND_URL" >/dev/null 2>&1 || true
else
    echo "ℹ️ Open your browser and navigate to $FRONTEND_URL"
fi

echo "🎉 TinyVerse is up and running!"
echo "   Backend:  $BACKEND_URL"
echo "   Frontend: $FRONTEND_URL"
echo ""
echo "Press Ctrl+C to stop both servers."

wait
