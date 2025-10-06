#!/usr/bin/env bash
set -e

# TinyVerse Backend Setup Script
# Creates Python 3.13 virtual environment and installs dependencies

echo "🚀 TinyVerse Backend Setup"
echo "=========================="
echo ""

# Check if Python 3.13 is available
if ! command -v python3.13 &> /dev/null; then
    echo "❌ Error: Python 3.13 is not installed or not in PATH"
    echo ""
    echo "Install Python 3.13:"
    echo "  - macOS: brew install python@3.13"
    echo "  - Linux: Use your package manager or pyenv"
    echo "  - Windows: Download from python.org"
    exit 1
fi

# Display Python version
PYTHON_VERSION=$(python3.13 --version)
echo "✓ Found: $PYTHON_VERSION"
echo ""

# Create virtual environment
echo "📦 Creating virtual environment with Python 3.13..."
if [ -d "venv" ]; then
    echo "⚠️  Warning: venv directory already exists"
    read -p "Remove and recreate? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf venv
        python3.13 -m venv venv
        echo "✓ Virtual environment recreated"
    else
        echo "✓ Using existing virtual environment"
    fi
else
    python3.13 -m venv venv
    echo "✓ Virtual environment created"
fi
echo ""

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "⚠️  Note: This may take 2-3 minutes (TinyTroupe is cloned from GitHub)"
pip install -r requirements.txt
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
