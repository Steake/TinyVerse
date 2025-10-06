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

4. Initialize the database:
```bash
python db_manager.py init
```

5. Run the server:
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
│   ├── database.py                # Database setup
│   ├── api/                       # API routes
│   │   ├── agents.py
│   │   ├── simulation.py
│   │   └── websocket.py
│   ├── services/                  # Business logic
│   │   ├── tinytroupe_adapter.py  # TinyTroupe integration
│   │   └── simulation_service.py
│   ├── models/                    # SQLAlchemy ORM models
│   │   ├── agent.py               # Agent and Skill models
│   │   ├── location.py            # Location model
│   │   └── simulation.py          # SimulationLog, Relationship, Routine
│   └── schemas/                   # Pydantic schemas
├── alembic/                       # Database migrations
│   ├── versions/                  # Migration scripts
│   └── env.py                     # Alembic environment
├── tests/                         # Tests
│   ├── test_api.py
│   └── test_database.py
├── db_manager.py                  # Database management utility
├── alembic.ini                    # Alembic configuration
├── DATABASE.md                    # Database documentation
└── requirements.txt               # Dependencies
```

## Development

### Database Management

Initialize database:
```bash
python db_manager.py init
```

Check database status:
```bash
python db_manager.py check
```

Run migrations:
```bash
alembic upgrade head
```

See [DATABASE.md](DATABASE.md) for detailed database documentation.

### Testing

Run tests:
```bash
pytest
```

Run database tests specifically:
```bash
pytest tests/test_database.py -v
```

### Running the Server

Run with hot reload:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
