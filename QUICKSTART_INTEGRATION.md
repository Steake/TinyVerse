# TinyTroupe Integration - Quick Start

This guide will help you get the TinyTroupe integration up and running in minutes.

## Prerequisites

- Python 3.10 or higher
- Node.js 16 or higher
- OpenAI API key (or Azure OpenAI credentials)

## Quick Setup (5 minutes)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-...

# Start the backend server
uvicorn app.main:app --reload
```

The backend will start at `http://localhost:8000`

### 2. Frontend Setup (in a new terminal)

```bash
# From the project root
npm install

# Configure environment (optional - defaults work for local dev)
cp .env.example .env

# Start the development server
npm run dev
```

The frontend will start at `http://localhost:5173`

## Verify Installation

### Check Backend Health

```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "tinytroupe_available": true
}
```

### View API Documentation

Open your browser to:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Run the Demo

```bash
cd backend
python demo_integration.py
```

This will:
1. Create two sample agents (Alice and Bob)
2. Run a 3-step simulation
3. Display simulation state and event logs
4. Demonstrate the complete integration workflow

## Run Tests

```bash
cd backend
pytest tests/ -v
```

Expected output:
- ✓ Unit tests for TinyTroupe adapter
- ✓ Integration tests for API endpoints
- ✓ Event logging tests
- ✓ End-to-end scenarios

## Key Features Demonstrated

### 1. Agent Management
- Create agents with rich personalities
- Retrieve agent details
- List all agents
- Delete agents

### 2. Simulation Control
- Start simulation with specified steps
- Pause/stop simulation
- Step through simulation one step at a time
- Get current simulation state

### 3. Event Tracking
- All actions are logged as events
- Retrieve event history
- Event types: agent_created, agent_deleted, simulation_started, simulation_paused, etc.

### 4. Real-time Updates (WebSocket)
- Connect to `ws://localhost:8000/ws`
- Receive real-time events for all simulation activity
- Automatic reconnection support

## Example Usage

### Create an Agent (Python)

```python
import httpx

agent_data = {
    "name": "Alice",
    "age": 30,
    "occupation": "Engineer",
    "personality_traits": ["curious", "analytical"]
}

async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://localhost:8000/api/agents",
        json=agent_data
    )
    agent = response.json()
    print(f"Created agent: {agent['id']}")
```

### Create an Agent (TypeScript)

```typescript
import { api } from '$lib/api';

const agent = await api.createAgent({
  name: "Alice",
  age: 30,
  occupation: "Engineer",
  personality_traits: ["curious", "analytical"]
});

console.log(`Created agent: ${agent.id}`);
```

### WebSocket Real-time Updates

```typescript
import { wsClient } from '$lib/api';

// Connect
wsClient.connect();

// Listen for events
wsClient.on('agent_created', (event) => {
  console.log('New agent:', event.data.agent_name);
});

wsClient.on('simulation_step', (event) => {
  console.log('Simulation step:', event.data.current_step);
});
```

## Troubleshooting

### Backend won't start

**Problem**: `ModuleNotFoundError: No module named 'tinytroupe'`

**Solution**: Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### TinyTroupe not available

**Problem**: `tinytroupe_available: false` in health check

**Solution**: Install TinyTroupe directly
```bash
pip install git+https://github.com/microsoft/TinyTroupe.git@main
```

### OpenAI API errors

**Problem**: OpenAI API key errors during simulation

**Solution**: Verify your API key in `backend/.env`
```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

For development, you can use `gpt-4o-mini` to reduce costs:
```bash
TINYTROUPE_MODEL=gpt-4o-mini
```

### Frontend can't connect to backend

**Problem**: Network errors in browser console

**Solution**: Verify backend is running and check CORS settings
```bash
# In backend/.env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Architecture Overview

```
┌─────────────────┐
│  Frontend (JS)  │  ← Svelte + TypeScript
│  localhost:5173 │
└────────┬────────┘
         │ HTTP REST + WebSocket
         │
┌────────▼────────┐
│  Backend (Py)   │  ← FastAPI + TinyTroupe
│  localhost:8000 │
└────────┬────────┘
         │ Python API
         │
┌────────▼────────┐
│   TinyTroupe    │  ← Microsoft Research Library
└────────┬────────┘
         │ LLM API
         │
┌────────▼────────┐
│   OpenAI API    │  ← GPT-4 / GPT-4o-mini
└─────────────────┘
```

## Next Steps

1. **Explore the API**: Visit http://localhost:8000/docs
2. **Run the tests**: `cd backend && pytest tests/ -v`
3. **Connect the frontend**: Start frontend and create agents through the UI
4. **Try WebSocket**: Connect to `ws://localhost:8000/ws` and watch live events

## Documentation

- [Full Integration Guide](../INTEGRATION_GUIDE.md) - Comprehensive setup and usage
- [Integration Plan](../TINYTROUPE_INTEGRATION.md) - Architecture and design
- [Quick Reference](../QUICKREF_TINYTROUPE.md) - Quick answers and links
- [API Specification](../API_spec.md) - Detailed API documentation

## Support

If you encounter issues:

1. Check the [Troubleshooting section](#troubleshooting) above
2. Review the [Integration Guide](../INTEGRATION_GUIDE.md)
3. Ensure all dependencies are installed
4. Verify your OpenAI API key is valid

---

**Ready to go?** Run `python backend/demo_integration.py` to see it in action! 🚀
