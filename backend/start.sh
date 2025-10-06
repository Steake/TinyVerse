#!/bin/bash
# TinyVerse Backend Startup Script

echo "🚀 Starting TinyVerse Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Check for .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "⚠️  Warning: .env file not found. Creating from .env.example..."
        cp .env.example .env
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
