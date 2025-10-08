#!/bin/bash
# TinyVerse Backend Startup Script

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting TinyVerse Backend..."
echo "📍 Working directory: $(pwd)"
echo ""

# Check if virtual environment exists in backend/
if [ ! -d "$SCRIPT_DIR/venv" ]; then
    echo "📦 Creating virtual environment in backend/venv..."
    python3 -m venv "$SCRIPT_DIR/venv"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source "$SCRIPT_DIR/venv/bin/activate"

# Install dependencies if needed
if [ ! -f "$SCRIPT_DIR/venv/.installed" ]; then
    echo "📥 Installing dependencies..."
    pip install -r "$SCRIPT_DIR/requirements.txt"
    touch "$SCRIPT_DIR/venv/.installed"
fi

# Check for .env file
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    if [ -f "$SCRIPT_DIR/.env.example" ]; then
        echo "⚠️  Warning: .env file not found. Creating from .env.example..."
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
        echo ""
        echo "❗ Please edit backend/.env and add your OpenAI API key before running the server."
        echo "   Then run this script again."
        exit 1
    else
        echo "❌ Error: .env file not found and .env.example does not exist."
        echo "   Please create a .env file manually in the backend directory."
        exit 1
    fi
fi

# Export variables from .env so dependent services (TinyTroupe, etc.) can read them
set -a
source "$SCRIPT_DIR/.env"
set +a

# Allow tests to run against TinyTroupe mock without external API calls
USE_MOCK_RAW="${USE_TINYTROUPE_MOCK:-}"
USE_MOCK="$(printf '%s' "$USE_MOCK_RAW" | tr '[:upper:]' '[:lower:]')"
if [[ "$USE_MOCK" == "1" || "$USE_MOCK" == "true" ]]; then
    echo "❌ TinyTroupe mock mode has been removed. Please unset USE_TINYTROUPE_MOCK or set it to 0 to run against the real provider."
    exit 1
fi

# Start the server
echo "🌟 Starting FastAPI server..."
echo "   API: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""
# Align TinyTroupe limits with DeepSeek defaults if not configured explicitly
export TINYTROUPE_MAX_TOKENS="${TINYTROUPE_MAX_TOKENS:-8192}"

RELOAD_SETTING="${UVICORN_RELOAD:-1}"
UVICORN_CMD=("uvicorn" "app.main:app" "--host" "0.0.0.0" "--port" "8000")

if [[ "$RELOAD_SETTING" == "1" || "$RELOAD_SETTING" == "true" ]]; then
    UVICORN_CMD+=("--reload")
else
    echo "♻️  Uvicorn auto-reload disabled (UVICORN_RELOAD=$RELOAD_SETTING)"
fi

"${UVICORN_CMD[@]}"
