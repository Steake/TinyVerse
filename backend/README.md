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
- Create a Python 3.10+ virtual environment
- Install TinyTroupe from local clone (editable mode)
- Install all other dependencies
- Guide you through configuration

**Note:** TinyTroupe is installed from a local clone (`backend/tinytroupe-local/`) for faster setup and easier development. The first run clones it automatically.

### Manual Setup

1. Clone TinyTroupe locally (if not already done):
```bash
git clone --depth 1 https://github.com/microsoft/TinyTroupe.git tinytroupe-local
```

2. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install TinyTroupe in editable mode:
```bash
pip install -e tinytroupe-local
```

4. Install other dependencies:
```bash
pip install -r requirements.txt
```

5. Configure environment:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

6. Run the server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Updating TinyTroupe

Since TinyTroupe is installed in editable mode from a local clone:

```bash
cd tinytroupe-local
git pull
# Changes are automatically reflected, no reinstall needed
```

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
