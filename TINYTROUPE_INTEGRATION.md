# TinyTroupe Backend Integration Plan

## Overview

This document outlines the architecture and implementation plan for integrating [TinyTroupe](https://github.com/microsoft/TinyTroupe) as the backend simulation engine for TinyVerse.

## What is TinyTroupe?

TinyTroupe is a Python library from Microsoft Research that enables LLM-powered multiagent persona simulation. It provides:

- **TinyPerson**: Agents with detailed personalities, traits, and behaviors
- **TinyWorld**: Environments where agents interact
- **LLM Integration**: Powered by GPT-4 for realistic behavior
- **Rich Features**: Memory, actions, interactions, validation, and more

## Integration Strategy

### Decision: Python Backend Server

**Approach**: Create a Python backend server that uses TinyTroupe as a library, exposing a REST API that the TinyVerse frontend can consume.

**Rationale**:
- ✅ TinyTroupe is a Python library (not standalone service)
- ✅ Allows full control over TinyTroupe's capabilities
- ✅ Can adapt TinyTroupe's API to TinyVerse's needs
- ✅ Enables custom extensions and business logic
- ✅ No need for submodule complexity in frontend repo

**Alternative Considered**: Git submodule
- ❌ Would require Python runtime in frontend
- ❌ Doesn't fit Svelte/TypeScript architecture
- ❌ No clear way to run TinyTroupe from Node.js

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TinyVerse Frontend                        │
│                  (Svelte + TypeScript)                       │
│                                                              │
│  • Playwright's Desk (UI for agent/world design)            │
│  • Grand Stage (Real-time visualization)                    │
│  • Critic's Corner (Analysis & export)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (HTTP/WebSocket)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              TinyVerse Backend Server                        │
│                  (Python + FastAPI)                          │
│                                                              │
│  • REST API Layer (FastAPI)                                 │
│  • TinyVerse-to-TinyTroupe Adapter                          │
│  • State Management & Persistence                           │
│  • WebSocket for Real-time Updates                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ Python API Calls
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    TinyTroupe Library                        │
│                   (Python Package)                           │
│                                                              │
│  • TinyPerson (Agent simulation)                            │
│  • TinyWorld (Environment simulation)                       │
│  • LLM Integration (GPT-4)                                  │
│  • Memory, Actions, Validation                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Azure OpenAI / OpenAI API                  │
└─────────────────────────────────────────────────────────────┘
```

## Backend Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Web Framework | **FastAPI** | Modern, fast, async, great OpenAPI docs |
| Agent Engine | **TinyTroupe** | Microsoft Research library, LLM-powered |
| Database | **SQLite** (dev) / **PostgreSQL** (prod) | Simple for dev, scalable for production |
| ORM | **SQLAlchemy** | Well-established, works with TinyTroupe |
| Validation | **Pydantic** | Built into FastAPI, type-safe |
| WebSockets | **FastAPI WebSockets** | Built-in support |
| Task Queue | **Celery** (future) | For long-running simulations |

## API Mapping

### TinyVerse API → TinyTroupe Concepts

| TinyVerse Endpoint | TinyTroupe Equivalent | Notes |
|--------------------|----------------------|-------|
| `POST /agents` | `TinyPerson()` | Create agent from persona spec |
| `GET /agents` | List all TinyPerson instances | Maintain registry |
| `GET /agents/:id` | TinyPerson details | Serialize full state |
| `PATCH /agents/:id` | Update TinyPerson attributes | Use `define()` method |
| `DELETE /agents/:id` | Remove from registry | Cleanup |
| `POST /locations` | TinyWorld location | Add to world |
| `GET /simulation/state` | TinyWorld.get_state() | Current simulation state |
| `POST /simulation/control` | TinyWorld.run() / .pause() | Control simulation |
| `GET /simulation/logs` | Extract from TinyWorld events | Event history |
| `POST /simulation/action` | TinyPerson.listen_and_act() | Direct agent action |

## Data Model Mapping

### Agent (TinyVerse) → TinyPerson (TinyTroupe)

```json
TinyVerse Agent:
{
  "id": "uuid",
  "name": "Lisa Carter",
  "age": 28,
  "occupation": "Data Scientist",
  "personalityTraits": ["curious", "analytical"],
  "skills": [{"name": "Python", "level": 8}],
  ...
}

TinyTroupe TinyPerson:
{
  "type": "TinyPerson",
  "persona": {
    "name": "Lisa Carter",
    "age": 28,
    "occupation": {
      "title": "Data Scientist",
      "organization": "...",
      "description": "..."
    },
    "personality": {
      "traits": [...],
      ...
    }
  }
}
```

### Location (TinyVerse) → TinyWorld Location (TinyTroupe)

TinyVerse locations map to locations within a TinyWorld environment. TinyTroupe doesn't have explicit location objects, but we can manage them through the world state.

## Implementation Phases

### Phase 1: Backend Foundation (Week 1-2)

- [x] Set up Python backend project structure
- [x] Install TinyTroupe as dependency
- [x] Create FastAPI application skeleton
- [x] Implement basic health check endpoint
- [x] Set up development environment
- [x] Configure CORS for frontend integration

### Phase 2: Core Agent API (Week 2-3)

- [x] Implement Agent CRUD endpoints
- [x] Create TinyVerse→TinyTroupe adapter for agents
- [x] Add agent state persistence (SQLite)
- [x] Test agent creation and retrieval
- [x] Add validation and error handling

### Phase 3: World & Simulation (Week 3-4)

- [x] Implement Location/World endpoints
- [x] Create TinyWorld management
- [x] Implement simulation control endpoints
- [x] Add simulation state tracking
- [x] Test simulation start/pause/step

### Phase 4: Real-time Updates (Week 4-5)

- [x] Implement WebSocket support
- [x] Stream simulation events to frontend
- [x] Add simulation log endpoints
- [ ] Test real-time visualization

### Phase 5: Integration & Testing (Week 5-6)

- [x] Connect TinyVerse frontend to new backend
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Documentation updates

## Backend Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # Configuration
│   ├── models/                    # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   ├── location.py
│   │   └── simulation.py
│   ├── schemas/                   # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   └── simulation.py
│   ├── api/                       # API routes
│   │   ├── __init__.py
│   │   ├── agents.py
│   │   ├── locations.py
│   │   ├── simulation.py
│   │   └── websocket.py
│   ├── services/                  # Business logic
│   │   ├── __init__.py
│   │   ├── agent_service.py
│   │   ├── simulation_service.py
│   │   └── tinytroupe_adapter.py  # TinyTroupe integration
│   └── database.py                # Database setup
├── tests/
│   ├── __init__.py
│   ├── test_agents.py
│   └── test_simulation.py
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment variables template
└── README.md                      # Backend documentation
```

## Environment Configuration

### Required Environment Variables

```bash
# OpenAI Configuration (for TinyTroupe)
OPENAI_API_KEY=sk-...
# OR for Azure OpenAI
AZURE_OPENAI_KEY=...
AZURE_OPENAI_ENDPOINT=https://...

# Database
DATABASE_URL=sqlite:///./tinyverse.db  # Development
# DATABASE_URL=postgresql://...        # Production

# API
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173

# TinyTroupe
TINYTROUPE_MODEL=gpt-4o-mini
TINYTROUPE_TEMPERATURE=0.7
```

## Key Implementation Considerations

### 1. State Management

TinyTroupe maintains state in memory. We need to:
- Serialize TinyPerson and TinyWorld state to database
- Restore state on backend restart
- Handle concurrent access

### 2. LLM Costs

TinyTroupe uses GPT-4 for agent behavior:
- Monitor API usage
- Implement rate limiting
- Cache common responses
- Consider using gpt-4o-mini for development

### 3. Performance

Simulations can be computationally expensive:
- Run simulations asynchronously
- Use background tasks for long operations
- Implement pagination for large datasets
- Consider Redis for caching

### 4. Real-time Updates

Frontend needs live simulation updates:
- WebSocket connection for events
- Event streaming from TinyWorld
- Efficient delta updates

## Frontend Changes Required

### Minimal Changes

The existing API client should work with minimal changes:

1. Update API base URL configuration
2. Add WebSocket client for real-time updates
3. Handle async simulation states (running/pending)
4. Add loading states for LLM operations

### API Client Updates

```typescript
// src/lib/api/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws';
```

## Testing Strategy

### Unit Tests
- Test TinyTroupe adapter logic
- Test API endpoints
- Test data transformations

### Integration Tests
- Test frontend ↔ backend communication
- Test TinyTroupe integration
- Test simulation flows

### E2E Tests
- Create agent through UI
- Run simulation
- Verify results in Critic's Corner

## Deployment

### Development
```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2: Frontend
npm run dev
```

### Production

Use Docker Compose to orchestrate:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://...
      - OPENAI_API_KEY=${OPENAI_API_KEY}
  
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://backend:8000/api
  
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

## Migration Path

### Phase 1: Parallel Development
- Keep existing mock data functional
- Add backend gradually
- Feature flag for backend usage

### Phase 2: Backend Integration
- Replace mock calls with real API
- Test thoroughly
- Maintain backward compatibility

### Phase 3: Full Cutover
- Remove mock data
- Update documentation
- Deploy production

## Security Considerations

### API Security
- API key authentication
- Rate limiting per user/IP
- Input validation (Pydantic)
- CORS configuration

### LLM Safety
- Content filtering (Azure OpenAI)
- Prompt injection prevention
- Output validation
- Usage monitoring

### Data Privacy
- Secure API keys
- Database encryption
- HTTPS only in production
- Session management

## Documentation Updates

### Files to Update

1. **ARCHITECTURE.md** - Add backend layer, TinyTroupe integration
2. **ROADMAP.md** - Update backend implementation plan
3. **README.md** - Add backend setup instructions
4. **API_spec.md** - Document actual implementation details
5. **CONTRIBUTING.md** - Add backend development guidelines

## Success Metrics

### Technical
- [ ] All API endpoints functional
- [ ] Agents created via TinyTroupe
- [ ] Simulations running with real LLM
- [ ] Real-time updates working
- [ ] < 500ms API response time (excluding LLM calls)

### Functional
- [ ] Create agent from UI → TinyPerson in TinyTroupe
- [ ] Run simulation with multiple agents
- [ ] View simulation logs and results
- [ ] Export simulation data
- [ ] Generate stories from simulation

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1. Backend Foundation | 1-2 weeks | FastAPI + TinyTroupe setup |
| 2. Agent API | 1-2 weeks | Agent CRUD working |
| 3. Simulation API | 1-2 weeks | Simulations running |
| 4. Real-time | 1 week | WebSocket updates |
| 5. Integration | 1 week | End-to-end working |
| **Total** | **5-7 weeks** | **Full integration** |

## Risks & Mitigation

### Risk: TinyTroupe API Changes
- **Mitigation**: Pin TinyTroupe version, test upgrades carefully
- **Impact**: Medium
- **Probability**: Medium (library is still evolving)

### Risk: LLM API Costs
- **Mitigation**: Use gpt-4o-mini, implement caching, rate limiting
- **Impact**: High
- **Probability**: High (costs can escalate quickly)

### Risk: Performance Issues
- **Mitigation**: Async operations, background tasks, caching
- **Impact**: Medium
- **Probability**: Medium

### Risk: Complex State Management
- **Mitigation**: Thorough testing, clear serialization strategy
- **Impact**: High
- **Probability**: Medium

## Next Steps

1. ✅ Create this integration plan
2. ✅ Review and approve architecture
3. ✅ Set up backend project structure
4. ✅ Install TinyTroupe and verify setup
5. ✅ Implement database layer with SQLAlchemy
6. ✅ Create database models (Agent, Location, SimulationRun, SimulationEvent)
7. ✅ Implement locations API endpoint
8. ✅ Implement WebSocket support for real-time updates
9. ✅ Add database integration tests
10. ✅ Update frontend API configuration for backend connection
11. [ ] Test with frontend
12. [ ] Continue with remaining phases

## References

- [TinyTroupe GitHub](https://github.com/microsoft/TinyTroupe)
- [TinyTroupe Paper](https://arxiv.org/abs/2507.09788)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [TinyVerse API Specification](./API_spec.md)
- [TinyVerse Architecture](./ARCHITECTURE.md)

---

*Last Updated: 2025*  
*Version: 1.0*
