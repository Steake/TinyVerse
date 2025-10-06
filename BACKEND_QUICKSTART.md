# Quick Start: TinyTroupe Integrated Backend

## Prerequisites

- Python 3.10+ installed
- Node.js 18+ and npm installed
- OpenAI API key (or OpenAI-compatible API)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- SQLAlchemy (database ORM)
- TinyTroupe (agent simulation)
- And other dependencies

### 2. Configure Environment

Create `.env` file in the `backend/` directory:

```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env
```

**Required settings:**

```bash
# OpenAI API key (required for TinyTroupe)
OPENAI_API_KEY=sk-your-actual-key-here

# Database (SQLite for development)
DATABASE_URL=sqlite:///./tinyverse.db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# TinyTroupe settings
TINYTROUPE_MODEL=gpt-4o-mini
TINYTROUPE_TEMPERATURE=0.7
```

### 3. Start Backend Server

```bash
# From backend directory
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Database initialized successfully
INFO:     Custom OpenAI client initialized
```

### 4. Verify Backend

Open http://localhost:8000 in your browser. You should see:

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "tinytroupe_available": true
}
```

Visit http://localhost:8000/docs for interactive API documentation.

## Frontend Setup

### 1. Install Dependencies

```bash
# From root directory
npm install
```

### 2. Configure Environment

Create `.env.local` file in the root directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/ws
```

### 3. Start Frontend

```bash
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. Verify Frontend

Open http://localhost:5173 in your browser. The TinyVerse UI should load.

## Testing the Integration

### 1. Create an Agent

Using the API directly:

```bash
curl -X POST http://localhost:8000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "age": 28,
    "occupation": "Software Engineer",
    "personality_traits": ["curious", "analytical"],
    "professional_interests": ["AI", "ML"],
    "personal_interests": ["reading", "hiking"]
  }'
```

Response:
```json
{
  "id": "generated-uuid",
  "name": "Alice",
  "age": 28,
  ...
  "created_at": "2025-01-01T12:00:00"
}
```

### 2. List Agents

```bash
curl http://localhost:8000/api/agents
```

### 3. Get Simulation State

```bash
curl http://localhost:8000/api/simulation/state
```

Response:
```json
{
  "is_running": false,
  "current_step": 0,
  "agents_count": 1,
  "world_name": "TinyVerse Simulation"
}
```

### 4. Test WebSocket Connection

In your browser console (while on the frontend):

```javascript
import { wsClient } from '$lib/api/client';

// Connect
await wsClient.connect();

// Listen for events
wsClient.on((event) => {
  console.log('Event:', event);
});
```

### 5. Start Simulation

```bash
curl -X POST http://localhost:8000/api/simulation/control \
  -H "Content-Type: application/json" \
  -d '{"action": "start", "steps": 5}'
```

Watch the WebSocket events in your browser console!

## Using the Frontend UI

### 1. Navigate to Playwright's Desk

This is where you create and manage agents.

1. Click "Playwright's Desk" in the navigation
2. Click "Create Agent"
3. Fill in agent details:
   - Name: "Bob"
   - Age: 32
   - Occupation: "Designer"
   - Personality traits: ["creative", "collaborative"]
4. Click "Create"

The agent is now created in both TinyTroupe (in-memory) and the database.

### 2. View Agents

All created agents appear in the agent list with their details.

### 3. Start Simulation

From the Grand Stage or simulation controls:
1. Click "Start Simulation"
2. Set number of steps
3. Watch real-time updates via WebSocket

## Troubleshooting

### Backend won't start

**Error: "No module named 'fastapi'"**
```bash
cd backend
pip install -r requirements.txt
```

**Error: "OPENAI_API_KEY not set"**
```bash
# Edit .env file
nano backend/.env
# Add: OPENAI_API_KEY=sk-your-key-here
```

**Error: "Database locked"**
- SQLite doesn't handle high concurrency well
- Use PostgreSQL for production
- Restart the backend

### Frontend won't connect

**Error: "Failed to fetch"**
- Check backend is running (http://localhost:8000)
- Verify .env.local has correct API URL
- Check CORS settings in backend/.env

**WebSocket connection fails**
- Ensure backend is running
- Check browser console for errors
- Verify WS URL in .env.local

### TinyTroupe errors

**Error: "TinyTroupe not available"**
```bash
pip install git+https://github.com/microsoft/TinyTroupe.git@main
```

**Error: "Rate limit exceeded"**
- OpenAI API rate limits hit
- Wait and try again
- Use a higher tier API key

## Development Tips

### Hot Reload

Both backend and frontend support hot reload:
- Backend: Changes to Python files auto-reload the server
- Frontend: Changes to Svelte/TS files auto-reload the browser

### Database Inspection

View the database:
```bash
sqlite3 backend/tinyverse.db
.tables
SELECT * FROM agents;
.exit
```

### API Documentation

FastAPI auto-generates API docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Logs

Backend logs appear in the terminal:
- Request logs
- Database operations
- TinyTroupe operations
- Errors and warnings

### Testing

Run backend tests:
```bash
cd backend
pytest tests/ -v
```

Run frontend type checking:
```bash
npm run check
```

## Next Steps

1. **Explore the API**: Try all endpoints in http://localhost:8000/docs
2. **Create Multiple Agents**: Build a diverse cast
3. **Run Simulations**: Watch agents interact
4. **Monitor WebSocket**: See real-time updates
5. **Check Database**: Verify persistence
6. **Read Documentation**: 
   - [WEBSOCKET_GUIDE.md](./WEBSOCKET_GUIDE.md)
   - [DATABASE_INTEGRATION.md](./DATABASE_INTEGRATION.md)
   - [TINYTROUPE_INTEGRATION.md](./TINYTROUPE_INTEGRATION.md)

## Production Deployment

For production deployment:

1. **Use PostgreSQL** instead of SQLite
2. **Set strong CORS origins** (no wildcards)
3. **Use environment variables** for secrets
4. **Enable HTTPS/WSS** for secure connections
5. **Set up monitoring** and logging
6. **Configure rate limiting** for API
7. **Use production WSGI server** (gunicorn + uvicorn)

See [TINYTROUPE_INTEGRATION.md](./TINYTROUPE_INTEGRATION.md) for detailed deployment instructions.

## Getting Help

- **Documentation**: See [DOCS_INDEX.md](./DOCS_INDEX.md)
- **Issues**: Open a GitHub issue
- **API Questions**: Check [API_spec.md](./API_spec.md)
- **Architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)

---

Happy simulating! 🎭
