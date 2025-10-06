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

# Start the server
echo "🌟 Starting FastAPI server..."
echo "   API: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
