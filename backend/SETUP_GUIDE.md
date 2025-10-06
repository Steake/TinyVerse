# Backend Setup Guide

## Quick Start

The TinyVerse backend has been implemented in Phase 1! Here's how to get started:

### 1. Prerequisites

- Python 3.10+ (Python 3.12 available on this system)
- OpenAI API key or Azure OpenAI credentials

### 2. Installation

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (this will install TinyTroupe from GitHub)
pip install -r requirements.txt
```

**Note:** Installing TinyTroupe may take 2-3 minutes as it clones from GitHub.

### 3. Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your API key
nano .env  # or use your preferred editor
```

Add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-key-here
```

Or for Azure OpenAI:
```env
AZURE_OPENAI_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
```

### 4. Run the Server

**Option A: Use the startup script**
```bash
./start.sh
```

**Option B: Manual start**
```bash
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Test the API

Once running, visit:
- **API Documentation**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/

## API Endpoints

### Health Check
- `GET /` - Health check with TinyTroupe status
- `GET /api/health` - Simple health check

### Agents
- `POST /api/agents` - Create a new agent
- `GET /api/agents` - List all agents
- `GET /api/agents/{id}` - Get agent details
- `DELETE /api/agents/{id}` - Delete an agent

### Simulation
- `POST /api/simulation/control` - Control simulation (start/pause/stop/step)
- `GET /api/simulation/state` - Get simulation state
- `GET /api/simulation/logs` - Get simulation logs

## Example API Usage

### Create an Agent

```bash
curl -X POST "http://localhost:8000/api/agents" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lisa Carter",
    "age": 28,
    "occupation": "Data Scientist",
    "personality_traits": ["curious", "analytical"],
    "professional_interests": ["machine learning", "data analysis"],
    "backstory": "A passionate data scientist working on improving search relevance."
  }'
```

### List Agents

```bash
curl "http://localhost:8000/api/agents"
```

### Start Simulation

```bash
curl -X POST "http://localhost:8000/api/simulation/control" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start",
    "steps": 5
  }'
```

### Get Simulation State

```bash
curl "http://localhost:8000/api/simulation/state"
```

## Running Tests

```bash
cd backend
source venv/bin/activate
pytest tests/
```

## Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI application
│   ├── config.py                  # Configuration settings
│   ├── api/                       # API routes
│   │   ├── agents.py              # Agent endpoints
│   │   └── simulation.py          # Simulation endpoints
│   ├── services/
│   │   └── tinytroupe_adapter.py  # TinyTroupe integration ⭐
│   └── schemas/
│       └── agent.py               # Pydantic schemas
├── tests/
│   └── test_api.py                # API tests
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment template
├── start.sh                       # Startup script
└── README.md                      # This file
```

## Key Implementation Details

### TinyTroupe Adapter

The `tinytroupe_adapter.py` module is the bridge between TinyVerse and TinyTroupe:

- **Maintains agent registry**: Maps UUIDs to TinyPerson instances
- **Manages TinyWorld**: Single simulation environment for all agents
- **Translates data models**: Converts between TinyVerse JSON and TinyTroupe objects

Key methods:
- `create_agent(data)` - Creates TinyPerson from TinyVerse agent data
- `list_agents()` - Returns all agents
- `run_simulation(steps)` - Executes simulation
- `get_simulation_state()` - Returns current state

### Configuration

Environment variables (from .env):
- `OPENAI_API_KEY` - Required for TinyTroupe
- `DATABASE_URL` - Database connection (SQLite by default)
- `API_HOST`, `API_PORT` - Server configuration
- `CORS_ORIGINS` - Allowed origins for CORS
- `TINYTROUPE_MODEL` - LLM model to use (default: gpt-4o-mini)

## Troubleshooting

### TinyTroupe not installing

If `pip install -r requirements.txt` fails on TinyTroupe:

```bash
pip install git+https://github.com/microsoft/TinyTroupe.git@main
```

### Import errors

Make sure you're in the virtual environment:
```bash
source venv/bin/activate
```

### Port already in use

Change the port in .env or when starting:
```bash
uvicorn app.main:app --reload --port 8001
```

### OpenAI API errors

- Check your API key is correct in .env
- Ensure you have API credits available
- For Azure OpenAI, verify both key and endpoint are set

## Next Steps

1. **Frontend Integration**: Update frontend API client to point to `http://localhost:8000/api`
2. **WebSocket Support**: Add real-time updates for simulation events
3. **Database Persistence**: Implement SQLAlchemy models for state persistence
4. **Advanced Features**: Add more TinyTroupe capabilities (memory, interventions, etc.)

## Support

- Backend API docs: http://localhost:8000/docs
- TinyTroupe: https://github.com/microsoft/TinyTroupe
- FastAPI: https://fastapi.tiangolo.com/
- Integration plan: See `../TINYTROUPE_INTEGRATION.md`

---

**Status**: Phase 1 Complete ✅  
**Commit**: 1dc59fd  
**Next**: Test with real OpenAI API key
