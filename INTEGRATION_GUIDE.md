# TinyTroupe Integration - Setup and Testing Guide

This guide describes how to set up, test, and verify the TinyTroupe integration with TinyVerse.

## Architecture Overview

The integration follows a clean architecture pattern:

```
Frontend (Svelte/TypeScript)
    ↓ HTTP REST + WebSocket
Backend (Python/FastAPI)
    ↓ Python API
TinyTroupe Library
    ↓ LLM API
OpenAI/Azure OpenAI
```

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

5. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/`

### Frontend Setup

1. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # The defaults should work for local development
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## API Endpoints

### Agents
- `POST /api/agents` - Create a new agent
- `GET /api/agents` - List all agents
- `GET /api/agents/{id}` - Get agent details
- `DELETE /api/agents/{id}` - Delete an agent

### Locations
- `POST /api/locations` - Create a new location
- `GET /api/locations` - List all locations
- `GET /api/locations/{id}` - Get location details
- `DELETE /api/locations/{id}` - Delete a location

### Simulation
- `POST /api/simulation/control` - Control simulation (start/pause/stop/step)
- `GET /api/simulation/state` - Get current simulation state
- `GET /api/simulation/logs` - Get simulation event logs

### WebSocket
- `WS /ws` - Real-time simulation updates

## Testing

### Backend Unit Tests

Test the TinyTroupe adapter logic:

```bash
cd backend
pytest tests/test_tinytroupe_adapter.py -v
```

### Backend Integration Tests

Test API endpoints with TinyTroupe:

```bash
cd backend
pytest tests/test_integration.py -v
```

### Run All Backend Tests

```bash
cd backend
pytest tests/ -v
```

## Usage Examples

### Creating an Agent

**Using cURL:**
```bash
curl -X POST http://localhost:8000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "age": 32,
    "occupation": "Software Engineer",
    "personality_traits": ["curious", "analytical"],
    "professional_interests": ["AI", "Python"]
  }'
```

**Using the Frontend API Client:**
```typescript
import { api } from '$lib/api';

const agent = await api.createAgent({
  name: "Alice Smith",
  age: 32,
  occupation: "Software Engineer",
  personality_traits: ["curious", "analytical"],
  professional_interests: ["AI", "Python"]
});
```

### Running a Simulation

**Using cURL:**
```bash
curl -X POST http://localhost:8000/api/simulation/control \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start",
    "steps": 5
  }'
```

**Using the Frontend API Client:**
```typescript
import { api } from '$lib/api';

await api.executeAction({
  action: 'start',
  steps: 5
});
```

### WebSocket Real-Time Updates

**Using the Frontend WebSocket Client:**
```typescript
import { wsClient } from '$lib/api';

// Connect to WebSocket
wsClient.connect();

// Listen for simulation events
wsClient.on('simulation_step', (event) => {
  console.log('Simulation step completed:', event.data);
});

// Listen for agent actions
wsClient.on('agent_action', (event) => {
  console.log('Agent action:', event.data);
});

// Listen for connection state changes
wsClient.onStateChange((state) => {
  console.log('WebSocket state:', state);
});

// Disconnect when done
wsClient.disconnect();
```

## Verification Steps

### 1. Verify Backend is Running

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

### 2. Create and Retrieve an Agent

```bash
# Create agent
AGENT_ID=$(curl -X POST http://localhost:8000/api/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","age":30,"occupation":"Engineer"}' \
  | jq -r '.id')

# Retrieve agent
curl http://localhost:8000/api/agents/$AGENT_ID
```

### 3. Test Simulation Control

```bash
# Start simulation
curl -X POST http://localhost:8000/api/simulation/control \
  -H "Content-Type: application/json" \
  -d '{"action":"start","steps":1}'

# Check simulation state
curl http://localhost:8000/api/simulation/state
```

### 4. Test WebSocket Connection

You can test the WebSocket using the browser console:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => console.log('Message:', JSON.parse(event.data));
ws.onerror = (error) => console.error('Error:', error);
```

## Troubleshooting

### Backend Won't Start

1. **Check Python version:** Ensure you have Python 3.10+
   ```bash
   python --version
   ```

2. **Verify dependencies are installed:**
   ```bash
   pip list | grep -E "fastapi|tinytroupe"
   ```

3. **Check OpenAI API key:**
   ```bash
   # In backend/.env
   OPENAI_API_KEY=sk-...
   ```

### Frontend Can't Connect to Backend

1. **Verify backend is running:**
   ```bash
   curl http://localhost:8000/api/health
   ```

2. **Check CORS settings:**
   The backend is configured to allow `http://localhost:5173` and `http://localhost:3000`

3. **Verify environment variables:**
   ```bash
   # In .env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

### Tests Failing

1. **Install test dependencies:**
   ```bash
   pip install pytest pytest-asyncio httpx
   ```

2. **Check if TinyTroupe is installed:**
   ```bash
   python -c "import tinytroupe; print(tinytroupe.__version__)"
   ```

## Features Implemented

✅ **Backend API Client**
- TinyTroupe adapter for agent management
- REST API endpoints for agents, locations, and simulation
- Pydantic schemas for request/response validation

✅ **Data Sync and Event Handling**
- Agent creation, retrieval, deletion
- Simulation control (start, pause, stop, step)
- Simulation state tracking
- WebSocket support for real-time updates

✅ **Testing Infrastructure**
- Unit tests for TinyTroupe adapter
- Integration tests for API endpoints
- End-to-end test scenarios

✅ **Documentation**
- Setup and deployment guides
- API usage examples
- Troubleshooting guide

## Next Steps

### Phase 4 Enhancements (Future Work)
- Implement event logging extraction from TinyWorld
- Add WebSocket event broadcasting from simulation
- Add more sophisticated location management in TinyWorld
- Implement agent-to-agent interactions

### Phase 5 Enhancements (Future Work)
- Add authentication and authorization
- Implement persistent storage with database
- Add simulation replay functionality
- Performance optimization for large simulations

## References

- [TinyTroupe GitHub](https://github.com/microsoft/TinyTroupe)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [TinyVerse Architecture](../ARCHITECTURE.md)
- [Integration Plan](../TINYTROUPE_INTEGRATION.md)
