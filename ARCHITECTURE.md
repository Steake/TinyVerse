# TinyVerse Stage - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
│                         (Svelte Components)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Playwright Desk │  │   Grand Stage   │  │ Critics Corner  │ │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤ │
│  │ • World Builder │  │ • Simulation    │  │ • Data Viz      │ │
│  │ • Casting Call  │  │ • Agent Anims   │  │ • Story Gen     │ │
│  │ • Relationships │  │ • Time Controls │  │ • Extraction    │ │
│  │ • Mind Palace   │  │ • Stage View    │  │ • Analytics     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        State Management                          │
│                         (Svelte Stores)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Agent   │  │  World   │  │Simulation│  │  Groups  │       │
│  │  Store   │  │  Store   │  │  Store   │  │  Store   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Client Layer                         │
│                  (TypeScript HTTP Client)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Agent    │  │Environment│  │Simulation│  │  Story   │       │
│  │   API    │  │   API     │  │   API    │  │   API    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REST API Server (Backend)                     │
│                        (Python + FastAPI)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Endpoints:                                                       │
│  • GET/POST/PATCH/DELETE /agents                                │
│  • GET/POST/PATCH/DELETE /locations                             │
│  • GET/POST/PATCH/DELETE /connections                           │
│  • GET/POST /simulation/state, /simulation/control              │
│  • GET /simulation/logs                                          │
│  • POST /simulation/action                                       │
│  • WebSocket /ws (real-time updates)                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TinyVerse-TinyTroupe Adapter                   │
│                         (Business Logic)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  • TinyVerse API ↔ TinyTroupe API mapping                       │
│  • State persistence and restoration                             │
│  • Event streaming and WebSocket management                      │
│  • Background simulation tasks                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TinyTroupe Library (Core)                     │
│              (Microsoft Research - LLM-Powered)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │   TinyPerson     │  │    TinyWorld     │                    │
│  │ • Personalities  │  │ • Environments   │                    │
│  │ • Memory         │  │ • Agent Actions  │                    │
│  │ • Actions        │  │ • Interactions   │                    │
│  │ • Behaviors      │  │ • Simulation     │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  LLM Integration │  │  Validation      │                    │
│  │  • GPT-4 Calls   │  │  • Propositions  │                    │
│  │  • Prompts       │  │  • Monitoring    │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Azure OpenAI / OpenAI API                      │
│                      (GPT-4 / GPT-4o-mini)                       │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Persistence                          │
│                    (PostgreSQL/SQLite - TBD)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Tables:                                                          │
│  • agents                                                         │
│  • locations                                                      │
│  • connections                                                    │
│  • simulation_logs                                               │
│  • relationships                                                 │
│  • routines                                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App.svelte
│
├── Sidebar.svelte
│   ├── Navigation
│   └── Export Dialog
│
├── Playwright Desk Section
│   ├── WorldBuilder.svelte
│   │   ├── LocationPalette
│   │   ├── LocationEditModal
│   │   └── ConnectionEditModal
│   │
│   ├── CastingCall.svelte
│   │   ├── AgentList
│   │   ├── AgentCard
│   │   ├── AgentForm
│   │   ├── GroupManager
│   │   └── RichTextEditor
│   │
│   ├── RelationshipNetwork.svelte
│   │   ├── AgentSelector
│   │   ├── NodeTooltip
│   │   └── RelationshipEditModal
│   │
│   └── MindPalace.svelte
│       ├── FacultyCard
│       └── FacultyAssignment
│
├── Grand Stage Section
│   └── GrandStage.svelte
│       ├── SimulationControls
│       ├── TimeDisplay
│       ├── AgentNode
│       ├── AgentAvatar
│       ├── SpeechBubble
│       └── StageBackground
│
└── Critics Corner Section
    └── CriticsCorner.svelte
        ├── DataVisualizer
        ├── ResultsExtractor
        └── StoryGenerator
```

## Data Flow

### Agent Creation Flow

```
User Input (CastingCall)
    │
    ▼
AgentForm Component
    │
    ▼
agentStore.addAgent()
    │
    ▼
API.agent.create()
    │
    ▼
POST /api/agents
    │
    ▼
Database Insert
    │
    ▼
Response → Update Store → Re-render UI
```

### Simulation Flow

```
User Clicks "Start" (GrandStage)
    │
    ▼
SimulationControls Component
    │
    ▼
simulationStore.start()
    │
    ▼
API.controlSimulation()
    │
    ▼
POST /api/simulation/control
    │
    ▼
Simulation Engine Starts
    │
    ├─→ Tick Loop (setInterval)
    │   │
    │   ├─→ Update Agent Positions
    │   ├─→ Process Interactions
    │   ├─→ Generate Events
    │   └─→ Log Actions
    │
    ▼
WebSocket/Polling Updates
    │
    ▼
Update Stores
    │
    ▼
Reactive UI Updates (Grand Stage)
```

### Story Generation Flow

```
User Selects Events (CriticsCorner)
    │
    ▼
StoryGenerator Component
    │
    ▼
Filter Logs by Agent/Type
    │
    ▼
Format Events for LLM
    │
    ▼
API.story.generate()
    │
    ▼
POST /api/stories
    │
    ▼
LLM API (OpenAI/Anthropic)
    │
    ▼
Generated Story
    │
    ▼
Display + Export Options
```

## State Management

### Store Structure

```typescript
// agentStore
{
  agents: Agent[],
  selectedAgent: string | null,
  addAgent(agent: Agent): void,
  updateAgent(agent: Agent): void,
  removeAgent(id: string): void,
  getAgent(id: string): Agent | undefined
}

// worldStore
{
  locations: Location[],
  connections: Connection[],
  simulationState: SimulationState | null
}

// simulationStore
{
  isRunning: boolean,
  speed: number,
  currentTime: Date,
  logs: SimulationLog[],
  start(): void,
  pause(): void,
  step(): void,
  tick(): void
}

// groupStore
{
  groups: AgentGroup[],
  addGroup(group: AgentGroup): void,
  removeGroup(id: string): void
}
```

## API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get agent details
- `POST /api/agents` - Create new agent
- `PATCH /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### World
- `GET /api/locations` - List locations
- `POST /api/locations` - Create location
- `PATCH /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location
- `GET /api/connections` - List connections
- `POST /api/connections` - Create connection
- `DELETE /api/connections/:id` - Delete connection

### Simulation
- `GET /api/simulation/state` - Get current state
- `POST /api/simulation/control` - Control simulation (START/PAUSE/STEP)
- `GET /api/simulation/logs` - Get simulation logs (with filters)
- `POST /api/simulation/action` - Execute manual action

### Stories
- `GET /api/stories` - List stories
- `POST /api/stories` - Generate story
- `GET /api/stories/:id` - Get story
- `PATCH /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story

## Technology Stack Details

### Frontend Libraries

| Library | Purpose | Version |
|---------|---------|---------|
| Svelte | UI Framework | 4.2 |
| TypeScript | Type Safety | 5.5 |
| Vite | Build Tool | 5.4 |
| Tailwind CSS | Styling | 3.4 |
| DaisyUI | Component Library | 4.7 |
| D3.js | Network Visualization | 7.8 |
| Chart.js | Data Charts | 4.4 |
| GSAP | Animations | 3.12 |
| TipTap | Rich Text Editor | 2.2 |

### Backend Stack (TinyTroupe Integration)

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Language** | **Python 3.10+** | Required by TinyTroupe |
| **Web Framework** | **FastAPI** | Modern, async, automatic OpenAPI docs |
| **Simulation Engine** | **TinyTroupe** | Microsoft Research library, LLM-powered agents |
| **Database** | **SQLite** (dev) / **PostgreSQL** (prod) | Simple development, scalable production |
| **ORM** | **SQLAlchemy** | Well-established Python ORM |
| **Validation** | **Pydantic** | Built into FastAPI, type-safe |
| **WebSockets** | **FastAPI WebSockets** | Built-in support for real-time updates |
| **LLM Provider** | **OpenAI / Azure OpenAI** | Required by TinyTroupe for agent behavior |
| **Task Queue** | **Celery** (future) | For background simulation tasks |

### TinyTroupe Integration

TinyVerse uses [TinyTroupe](https://github.com/microsoft/TinyTroupe) as its agent simulation engine. TinyTroupe provides:

- **TinyPerson**: LLM-powered agents with detailed personalities and behaviors
- **TinyWorld**: Environments where agents interact and evolve
- **Realistic Simulation**: GPT-4 generates believable agent actions and conversations
- **Validation**: Propositions for monitoring agent behavior
- **Rich Features**: Memory, actions, interventions, and more

The backend acts as an adapter, translating TinyVerse's API calls into TinyTroupe operations.

## Security Considerations

### Frontend
- Input validation on all forms
- XSS prevention (Svelte handles this)
- CSRF tokens for mutations
- Content Security Policy headers
- Sanitize user-generated content

### Backend (TinyTroupe-powered)
- Python backend with FastAPI
- TinyTroupe for agent simulation
- LLM integration (GPT-4)
- Authentication with JWT
- Authorization checks on all endpoints
- Input validation with Pydantic
- Rate limiting per user/IP
- SQL injection prevention (SQLAlchemy ORM)
- Secure session management
- HTTPS only in production
- Content filtering (Azure OpenAI)
- API key security for LLM access

## Performance Considerations

### Frontend
- Lazy load components
- Virtual scrolling for large lists
- Debounce API calls
- Optimize D3 rendering (limit nodes)
- Use Web Workers for heavy computation
- Code splitting by route

### Backend (TinyTroupe-powered)
- Async operations with FastAPI
- Background tasks for simulations
- Database indexing
- Connection pooling
- Caching with Redis (future)
- Pagination for large datasets
- WebSocket for real-time updates
- Load balancing for scaling
- LLM response caching to reduce costs

## Deployment Architecture (Future)

```
┌─────────────────┐
│   Users         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   CDN           │ (Static Assets)
│   (Cloudflare)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Load Balancer │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Server │ │ Server │ (API + Simulation)
│   1    │ │   2    │
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         ▼
┌─────────────────┐
│   Database      │ (PostgreSQL)
│   (Primary +    │
│    Replica)     │
└─────────────────┘
```

## Future Enhancements

### Real-time Collaboration
- WebSocket connections
- Operational Transformation
- Presence system
- Conflict resolution

### AI Integration
- Advanced LLM features via TinyTroupe
- Natural language commands
- Sentiment analysis (built into TinyTroupe)
- Predictive analytics
- Custom agent behaviors

### Scalability
- Microservices architecture
- Message queue (RabbitMQ/Celery)
- Distributed simulation
- Cloud-native deployment

## TinyTroupe Backend Integration

### Why TinyTroupe?

TinyVerse leverages [TinyTroupe](https://github.com/microsoft/TinyTroupe), a Python library from Microsoft Research, as its simulation backend. TinyTroupe provides:

1. **LLM-Powered Agents**: Realistic agent behaviors using GPT-4
2. **Rich Personalities**: Detailed persona specifications with traits, goals, and memories
3. **Interactive Environments**: TinyWorld system for agent interactions
4. **Validation**: Built-in propositions for monitoring behavior
5. **Research-Backed**: Based on published research with proven use cases

### Integration Architecture

```
┌────────────────────────────────────────────┐
│       TinyVerse Frontend (Svelte)          │
│  Visual interface for simulation design    │
└──────────────────┬─────────────────────────┘
                   │ HTTP/WebSocket
                   │
┌──────────────────▼─────────────────────────┐
│    TinyVerse Backend API (FastAPI)         │
│  • REST endpoints for CRUD operations      │
│  • WebSocket for real-time updates         │
│  • State persistence (SQLite/PostgreSQL)   │
└──────────────────┬─────────────────────────┘
                   │ Python API
                   │
┌──────────────────▼─────────────────────────┐
│         TinyTroupe Library                 │
│  • TinyPerson (agents)                     │
│  • TinyWorld (environments)                │
│  • LLM integration                         │
└──────────────────┬─────────────────────────┘
                   │
┌──────────────────▼─────────────────────────┐
│      OpenAI / Azure OpenAI API             │
│  GPT-4 for realistic agent behavior        │
└────────────────────────────────────────────┘
```

### API Mapping

| TinyVerse Concept | TinyTroupe Equivalent | Implementation |
|-------------------|----------------------|----------------|
| Agent | `TinyPerson` | Created from persona JSON spec |
| World/Location | `TinyWorld` location | Managed within TinyWorld |
| Simulation | `TinyWorld.run()` | Async simulation execution |
| Agent Action | `TinyPerson.listen_and_act()` | Direct agent interaction |
| Simulation Log | TinyWorld events | Extracted and formatted |
| Relationship | TinyPerson connections | Stored in agent memory |

### Backend Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI entry point
│   ├── api/                       # API routes
│   │   ├── agents.py              # Agent CRUD
│   │   ├── simulation.py          # Simulation control
│   │   └── websocket.py           # Real-time updates
│   ├── services/
│   │   ├── tinytroupe_adapter.py  # TinyTroupe integration
│   │   └── simulation_service.py  # Simulation management
│   ├── models/                    # SQLAlchemy models
│   └── schemas/                   # Pydantic schemas
├── tests/                         # Backend tests
└── requirements.txt               # Python dependencies
```

### Key Features Enabled by TinyTroupe

1. **Realistic Agent Behavior**: GPT-4 generates contextual, personality-driven actions
2. **Memory System**: Agents remember past interactions and experiences
3. **Natural Conversations**: Agents can engage in believable dialogue
4. **Adaptive Behavior**: Agents respond dynamically to environment changes
5. **Validation**: Monitor agent adherence to persona specifications
6. **Experimentation**: A/B testing and controlled experiments

### Development Setup

```bash
# Backend setup
cd backend
pip install -r requirements.txt

# Set OpenAI API key
export OPENAI_API_KEY=your_key_here

# Run backend
uvicorn app.main:app --reload

# Frontend (in separate terminal)
npm run dev
```

For detailed integration information, see [TINYTROUPE_INTEGRATION.md](./TINYTROUPE_INTEGRATION.md).

---

*This architecture document will evolve as the project develops.*
