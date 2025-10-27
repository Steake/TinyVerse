# TinyVerse Backend API Documentation

## Overview

The TinyVerse Backend API is a RESTful service built with FastAPI that provides endpoints for managing agents, world elements (locations and connections), and simulation controls. The backend integrates with TinyTroupe for AI-powered agent simulation.

## Quick Start

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key
   ```

3. **Run the server:**
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Access documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

All endpoints are prefixed with `/api`.

### Health Check

- `GET /` - Root health check
- `GET /api/health` - API health check

### Agents

Agent endpoints manage AI agents in the simulation.

- `GET /api/agents` - List all agents
- `POST /api/agents` - Create a new agent
- `GET /api/agents/{id}` - Get agent details
- `PATCH /api/agents/{id}` - Update agent
- `DELETE /api/agents/{id}` - Delete agent

**Example: Create Agent**
```bash
curl -X POST http://localhost:8000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "age": 28,
    "occupation": "Software Engineer",
    "personality_traits": ["curious", "analytical"],
    "professional_interests": ["AI", "web development"]
  }'
```

### Locations (World)

Location endpoints manage physical locations in the simulation world.

- `GET /api/locations` - List all locations
- `POST /api/locations` - Create a new location
- `PATCH /api/locations/{id}` - Update location
- `DELETE /api/locations/{id}` - Delete location

**Example: Create Location**
```bash
curl -X POST http://localhost:8000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coffee Shop",
    "type": "outdoor",
    "description": "A cozy neighborhood coffee shop",
    "x": 100.0,
    "y": 200.0,
    "width": 150.0,
    "height": 100.0
  }'
```

### Connections

Connection endpoints manage links between locations.

- `GET /api/connections` - List all connections
- `POST /api/connections` - Create a new connection
- `DELETE /api/connections/{id}` - Delete connection

**Example: Create Connection**
```bash
curl -X POST http://localhost:8000/api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "source": "location-id-1",
    "target": "location-id-2",
    "type": "door"
  }'
```

### Simulation

Simulation endpoints control the execution of the agent simulation.

- `GET /api/simulation/state` - Get current simulation state
- `POST /api/simulation/control` - Control simulation (start/pause/stop/step)
- `GET /api/simulation/logs` - Get simulation logs

**Example: Start Simulation**
```bash
curl -X POST http://localhost:8000/api/simulation/control \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start",
    "steps": 10
  }'
```

### Configuration

Configuration endpoints manage OpenAI/TinyTroupe settings.

- `GET /api/config` - Get current configuration
- `PATCH /api/config` - Update configuration

## Data Models

### Agent Schema

```python
{
    "id": "uuid",                              # Auto-generated
    "name": "string",                          # Required
    "age": 25,                                 # Required, > 0
    "occupation": "string",                    # Required
    "occupation_description": "string?",       # Optional
    "nationality": "string?",                  # Optional
    "country_of_residence": "string?",        # Optional
    "personality_traits": ["string"],         # Default: []
    "professional_interests": ["string"],     # Default: []
    "personal_interests": ["string"],         # Default: []
    "skills": [                               # Default: []
        {
            "name": "string",
            "level": 5                        # 0-10
        }
    ],
    "backstory": "string?",                   # Optional
    "created_at": "2024-01-01T00:00:00Z"     # Auto-generated
}
```

### Location Schema

```python
{
    "id": "uuid",                              # Auto-generated
    "name": "string",                          # Required
    "type": "room|outdoor|special",           # Default: "room"
    "description": "string?",                  # Optional
    "x": 0.0,                                  # Default: 0.0
    "y": 0.0,                                  # Default: 0.0
    "width": 100.0,                            # Default: 100.0
    "height": 100.0,                           # Default: 100.0
    "image": "string?",                        # Optional
    "created_at": "2024-01-01T00:00:00Z"      # Auto-generated
}
```

### Connection Schema

```python
{
    "id": "uuid",                              # Auto-generated
    "source": "location-uuid",                 # Required
    "target": "location-uuid",                 # Required
    "type": "path|door|portal",               # Default: "path"
    "created_at": "2024-01-01T00:00:00Z"      # Auto-generated
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
        "field": "Additional error context"
    }
}
```

### Common Error Codes

- `400_BAD_REQUEST` - Invalid request parameters
- `404_NOT_FOUND` - Requested resource not found
- `500_SERVER_ERROR` - Internal server error

### Example Error Response

```json
{
    "code": "404_NOT_FOUND",
    "message": "Agent not found",
    "details": {
        "agent_id": "123e4567-e89b-12d3-a456-426614174000"
    }
}
```

## Authentication

Currently, the API operates without authentication for development purposes. Authentication will be added in future versions.

**Planned Authentication Features:**
- JWT token-based authentication
- Role-based authorization (admin, user, viewer)
- API key support for service-to-service communication

## CORS Configuration

The API is configured to accept requests from the following origins:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev port)

To modify CORS settings, update the `CORS_ORIGINS` environment variable.

## Rate Limiting

Rate limiting is not currently implemented but will be added in future versions to prevent abuse.

## Testing

Run the test suite:

```bash
cd backend
pytest tests/
```

Run with coverage:

```bash
pytest tests/ --cov=app --cov-report=html
```

## TinyTroupe Integration

The backend uses TinyTroupe for AI agent simulation. The `TinyTroupeAdapter` class in `app/services/tinytroupe_adapter.py` translates between TinyVerse's REST API and TinyTroupe's Python API.

**Key Features:**
- Agents are implemented as TinyTroupe `TinyPerson` objects
- Simulation runs in a `TinyWorld` environment
- Agent behaviors are powered by GPT models

## Development

### Project Structure

```
backend/
├── app/
│   ├── api/               # API route handlers
│   │   ├── agents.py      # Agent endpoints
│   │   ├── simulation.py  # Simulation endpoints
│   │   ├── world.py       # Location/connection endpoints
│   │   └── config.py      # Configuration endpoints
│   ├── services/          # Business logic
│   │   └── tinytroupe_adapter.py
│   ├── schemas/           # Pydantic models
│   │   └── agent.py
│   ├── main.py           # FastAPI app
│   ├── config.py         # Settings
│   ├── errors.py         # Error handling
│   └── auth.py           # Authentication (placeholder)
├── tests/                # Test suite
└── requirements.txt      # Dependencies
```

### Adding New Endpoints

1. Define Pydantic schemas in `app/schemas/`
2. Implement business logic in `app/services/tinytroupe_adapter.py`
3. Create API routes in `app/api/`
4. Add router to `app/main.py`
5. Write tests in `tests/`

## Environment Variables

Required environment variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...                    # Required
OPENAI_API_BASE_URL=                     # Optional (for custom endpoints)

# Azure OpenAI (alternative)
AZURE_OPENAI_KEY=                        # Optional
AZURE_OPENAI_ENDPOINT=                   # Optional

# Server Configuration
API_HOST=0.0.0.0                         # Default: 0.0.0.0
API_PORT=8000                            # Default: 8000

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Troubleshooting

### TinyTroupe Import Error

If you get import errors for TinyTroupe:
```bash
pip install git+https://github.com/microsoft/TinyTroupe.git@main
```

### OpenAI API Key Not Set

Set your OpenAI API key:
```bash
export OPENAI_API_KEY=sk-your-key-here
```

Or add it to `.env` file.

### CORS Errors

Update CORS origins in `.env`:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://yourfrontend.com
```

## Support

- Backend Issues: See `backend/SETUP_GUIDE.md`
- TinyTroupe: https://github.com/microsoft/TinyTroupe
- FastAPI: https://fastapi.tiangolo.com/
- Integration Plan: See `../TINYTROUPE_INTEGRATION.md`

## License

See main repository LICENSE file.
