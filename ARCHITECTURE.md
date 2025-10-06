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
│                        REST API Server                           │
│                    (Express/Fastify - TBD)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Endpoints:                                                       │
│  • GET/POST/PATCH/DELETE /agents                                │
│  • GET/POST/PATCH/DELETE /locations                             │
│  • GET/POST/PATCH/DELETE /connections                           │
│  • GET/POST /simulation/state, /simulation/control              │
│  • GET /simulation/logs                                          │
│  • POST /simulation/action                                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                        │
│                    (Simulation Engine - TBD)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Agent Behavior   │  │   World Physics  │                    │
│  │ • Movement       │  │   • Pathfinding  │                    │
│  │ • Interactions   │  │   • Collisions   │                    │
│  │ • Decision Making│  │   • Time System  │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  Event System    │  │  Story Generator │                    │
│  │  • Event Queue   │  │  • LLM Integration│                   │
│  │  • Logging       │  │  • Templates     │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                   │
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

### Backend Stack (Planned)

| Component | Options | Recommendation |
|-----------|---------|----------------|
| Server | Express, Fastify | Fastify (performance) |
| Database | PostgreSQL, SQLite | PostgreSQL (production) |
| ORM | Prisma, TypeORM | Prisma (DX) |
| Validation | Zod, Joi | Zod (TypeScript) |
| Authentication | JWT, OAuth | JWT (simplicity) |
| WebSockets | Socket.io, ws | Socket.io (features) |

## Security Considerations

### Frontend
- Input validation on all forms
- XSS prevention (Svelte handles this)
- CSRF tokens for mutations
- Content Security Policy headers
- Sanitize user-generated content

### Backend (Future)
- Authentication with JWT
- Authorization checks on all endpoints
- Input validation with Zod
- Rate limiting per user/IP
- SQL injection prevention (use ORM)
- Secure session management
- HTTPS only in production

## Performance Considerations

### Frontend
- Lazy load components
- Virtual scrolling for large lists
- Debounce API calls
- Optimize D3 rendering (limit nodes)
- Use Web Workers for heavy computation
- Code splitting by route

### Backend (Future)
- Database indexing
- Connection pooling
- Caching with Redis
- Pagination for large datasets
- Background jobs for long operations
- Load balancing for scaling

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
- LLM for agent behaviors
- Natural language commands
- Sentiment analysis
- Predictive analytics

### Scalability
- Microservices architecture
- Message queue (RabbitMQ)
- Distributed simulation
- Cloud-native deployment

---

*This architecture document will evolve as the project develops.*
