# TinyVerse Backend

Python backend for TinyVerse using FastAPI and TinyTroupe.

## Setup

### Quick Setup (Recommended)

Run the automated setup script:

```bash
cd backend
./setup.sh
```

This will:
- Create a Python 3.13 virtual environment
- Install all dependencies (including TinyTroupe from GitHub)
- Guide you through configuration

### Manual Setup

1. Create a virtual environment:
```bash
python3.13 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

4. Run the server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

## Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI application
│   ├── config.py                  # Configuration
│   ├── api/                       # API routes
│   │   ├── agents.py
│   │   ├── simulation.py
│   │   └── websocket.py
│   ├── services/                  # Business logic
│   │   ├── tinytroupe_adapter.py  # TinyTroupe integration
│   │   └── simulation_service.py
│   ├── models/                    # Database models
│   └── schemas/                   # Pydantic schemas
├── tests/                         # Tests
└── requirements.txt               # Dependencies
```

## Development

Run tests:
```bash
pytest
```

Run with hot reload:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
