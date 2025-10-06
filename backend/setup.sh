#!/usr/bin/env bash
set -e

# TinyVerse Backend Setup Script
# Creates Python virtual environment and installs dependencies
#
# Usage:
#   ./setup.sh                    # Auto-detect Python 3.10+
#   ./setup.sh --python python3.13  # Specify Python version
#   ./setup.sh --force            # Recreate venv even if it exists

FORCE_RECREATE=false
PYTHON_CMD=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_RECREATE=true
            shift
            ;;
        --python)
            PYTHON_CMD="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./setup.sh [--python python3.13] [--force]"
            exit 1
            ;;
    esac
done

echo "🚀 TinyVerse Backend Setup"
echo "=========================="
echo ""

# Auto-detect Python if not specified
if [ -z "$PYTHON_CMD" ]; then
    for cmd in python3.13 python3.12 python3.11 python3.10 python3; do
        if command -v "$cmd" &> /dev/null; then
            version=$($cmd --version 2>&1 | grep -oE '[0-9]+\.[0-9]+')
            major=$(echo $version | cut -d. -f1)
            minor=$(echo $version | cut -d. -f2)
            if [ "$major" -eq 3 ] && [ "$minor" -ge 10 ]; then
                PYTHON_CMD="$cmd"
                break
            fi
        fi
    done
fi

# Verify Python is available
if [ -z "$PYTHON_CMD" ] || ! command -v "$PYTHON_CMD" &> /dev/null; then
    echo "❌ Error: Python 3.10+ is not installed or not in PATH"
    echo ""
    echo "Install Python:"
    echo "  - macOS: brew install python@3.13"
    echo "  - Linux: Use your package manager or pyenv"
    echo "  - Windows: Download from python.org"
    exit 1
fi

# Display Python version
PYTHON_VERSION=$($PYTHON_CMD --version)
echo "✓ Found: $PYTHON_VERSION ($PYTHON_CMD)"
echo ""

# Create virtual environment
echo "📦 Creating virtual environment with $PYTHON_CMD..."
if [ -d "venv" ]; then
    if [ "$FORCE_RECREATE" = true ]; then
        echo "🔄 Removing existing venv and recreating..."
        rm -rf venv
        $PYTHON_CMD -m venv venv
        echo "✓ Virtual environment recreated"
    else
        echo "✓ Using existing virtual environment (use --force to recreate)"
    fi
else
    $PYTHON_CMD -m venv venv
    echo "✓ Virtual environment created"
fi
echo ""

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip --quiet
echo "✓ pip upgraded"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo ""

# Install TinyTroupe from local directory (editable mode)
TINYTROUPE_PATH="tinytroupe-local"
if [ -d "$TINYTROUPE_PATH" ]; then
    echo "� Installing TinyTroupe from local clone ($TINYTROUPE_PATH)..."
    pip install -e "$TINYTROUPE_PATH" --quiet
    echo "✓ TinyTroupe installed (editable mode)"
else
    echo "❌ Error: TinyTroupe local clone not found at $TINYTROUPE_PATH"
    echo ""
    echo "Run this to clone it:"
    echo "  git clone --depth 1 https://github.com/microsoft/TinyTroupe.git $TINYTROUPE_PATH"
    exit 1
fi
echo ""

# Install other dependencies
echo "� Installing other dependencies..."
pip install -r requirements.txt --quiet
echo "✓ Dependencies installed"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Configuration needed:"
    echo ""
    echo "   Create a .env file with your OpenAI API key:"
    echo "   cp .env.example .env"
    echo "   # Then edit .env and add: OPENAI_API_KEY=sk-your-key-here"
    echo ""
else
    echo "✓ .env file found"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "To activate the virtual environment:"
echo "  source venv/bin/activate"
echo ""
echo "To start the server:"
echo "  ./start.sh"
echo "  # or"
echo "  uvicorn app.main:app --reload"
echo ""
echo "API Documentation will be at: http://localhost:8000/docs"
