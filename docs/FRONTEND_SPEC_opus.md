# TinyVerse Frontend Specification

---

## Executive Summary

TinyVerse is a web-based simulation platform that provides a visual interface for creating, managing, and observing AI-powered agent simulations. The frontend serves as the creative control center, allowing users to design worlds, craft agent personalities, orchestrate simulations, and analyze emergent behaviors through an intuitive, theater-inspired interface.

### Core Purpose
- **Visual Simulation Design**: Drag-and-drop world building with real-time visualization
- **Agent Management**: Create and configure AI-powered agents with rich personalities
- **Live Simulation**: Watch agents interact in real-time with speech bubbles and animations
- **Data Analysis**: Extract insights and generate narratives from simulation data

### Key Technologies
- **Framework**: SvelteKit 2.0 with TypeScript
- **Styling**: Tailwind CSS + DaisyUI components
- **Visualization**: D3.js for networks, Canvas API for simulation
- **Real-time**: WebSocket for live updates
- **State**: Svelte stores with persistence

---

## Architecture Overview

### Component Hierarchy

```
App.svelte (Root)
├── Layout
│   ├── Sidebar (Navigation + Export)
│   └── MainContent (Dynamic sections)
│
├── Sections (Route-based)
│   ├── PlaywrightDesk (Creation tools)
│   ├── GrandStage (Live simulation)
│   └── CriticsCorner (Analysis tools)
│
├── Shared Components
│   ├── Modals (Dialogs, forms)
│   ├── Controls (Buttons, inputs)
│   └── Visualizations (Charts, graphs)
│
└── Services
    ├── API Client (HTTP/WS)
    ├── State Stores
    └── Utilities
```

### Data Flow Architecture

```
User Interaction → Component → Store → API → Backend → TinyTroupe
                      ↑                           ↓
                      └──── WebSocket Updates ────┘
```

---

## Core Sections

### 1. Playwright's Desk
**Purpose**: Creation and configuration workspace

#### Components

##### WorldBuilder
- **Canvas-based map editor** (800x600 default)
- **Location nodes** with type indicators (room/outdoor/special)
- **Connection paths** between locations
- **Drag-and-drop positioning**
- **Zoom/pan controls**
- **Grid snapping** (optional)

##### CastingCall
- **Agent list view** with search/filter
- **Agent creation form** with:
  - Basic info (name, age, occupation)
  - Personality traits (multi-select)
  - Interests (professional/personal)
  - Skills with proficiency levels
  - Rich-text backstory editor
  - Emoji selector
- **AI Autofill** with context hints
- **Group management** for batch operations

##### RelationshipNetwork
- **D3.js force-directed graph**
- **Interactive node selection**
- **Relationship editor modal**
- **Relationship types**: family, friend, colleague, rival, romantic
- **Bidirectional connections**
- **Strength indicators** (visual weight)

##### MindPalace
- **Mental faculty catalog** (from TinyTroupe)
- **Tool assignment interface**
- **Faculty configuration panels**
- **Drag-to-assign interaction**
- **Active/inactive toggles**

### 2. Grand Stage
**Purpose**: Live simulation visualization

#### Components

##### SimulationControls
- **Play/Pause/Step buttons**
- **Speed control** (0.5x - 4x)
- **Step counter display**
- **Reset confirmation**

##### StageView (Canvas)
- **2D world representation**
- **Agent sprites/avatars**
- **Movement animations** (GSAP)
- **Speech bubbles** for dialogue
- **Action indicators** (icons)
- **Location backgrounds**
- **Camera follow modes**

##### TimeDisplay
- **Current simulation time**
- **Elapsed steps**
- **Time-of-day indicator**
- **Calendar view** (optional)

##### EventLog
- **Real-time event stream**
- **Filter by agent/type**
- **Expandable details**
- **Export to JSON/CSV**

### 3. Critic's Corner
**Purpose**: Analysis and narrative tools

#### Components

##### DataVisualizer
- **Chart.js visualizations**
- **Metrics**: interactions, emotions, activities
- **Time-series graphs**
- **Heatmaps** for location activity
- **Relationship evolution**

##### StoryGenerator
- **Event selection interface**
- **Narrative style options**
- **AI-powered generation**
- **Rich-text editor for refinement**
- **Export formats**: Markdown, HTML, PDF

##### ResultsExtractor
- **Simulation summary stats**
- **Key moments identification**
- **Pattern recognition**
- **Insight generation**
- **Report builder**

---

## State Management

### Store Architecture

```typescript
// Core Stores
interface Stores {
  // Agent management
  agents: {
    items: Map<string, Agent>
    selected: string | null
    loading: boolean
    error: string | null
  }
  
  // World configuration
  world: {
    locations: Map<string, Location>
    connections: Map<string, Connection>
    bounds: { width: number, height: number }
  }
  
  // Simulation state
  simulation: {
    running: boolean
    step: number
    speed: number
    logs: SimulationLog[]
    lastUpdate: Date
  }
  
  // UI state
  ui: {
    activeSection: 'desk' | 'stage' | 'corner'
    modals: Set<string>
    notifications: Notification[]
    theme: 'light' | 'dark' | 'auto'
  }
}
```

### Store Actions

```typescript
// Agent Store Actions
addAgent(data: AgentCreate): Promise<Agent>
updateAgent(id: string, data: Partial<Agent>): Promise<Agent>
deleteAgent(id: string): Promise<void>
selectAgent(id: string | null): void
assignFaculty(agentId: string, facultyKey: string): Promise<void>
assignTool(agentId: string, toolKey: string): Promise<void>

// Simulation Store Actions
start(steps?: number): Promise<void>
pause(): Promise<void>
step(): Promise<void>
reset(): Promise<void>
setSpeed(multiplier: number): void
appendLog(entry: SimulationLog): void
```

---

## API Integration

### HTTP Client

```typescript
class APIClient {
  // Agent endpoints
  agents = {
    list: () => GET<Agent[]>('/agents'),
    get: (id: string) => GET<Agent>(`/agents/${id}`),
    create: (data: AgentCreate) => POST<Agent>('/agents', data),
    update: (id: string, data: Partial<Agent>) => PATCH<Agent>(`/agents/${id}`, data),
    delete: (id: string) => DELETE(`/agents/${id}`),
    
    // Mental faculties
    getFaculties: (id: string) => GET<Faculty[]>(`/agents/${id}/faculties`),
    addFaculty: (id: string, key: string, params?: any) => 
      POST<Faculty>(`/agents/${id}/faculties`, { key, parameters: params }),
    
    // Tools
    getTools: (id: string) => GET<Tool[]>(`/agents/${id}/tools`),
    assignTool: (id: string, key: string, params?: any) =>
      POST<Tool>(`/agents/${id}/tools`, { key, parameters: params }),
    
    // Memory
    getMemory: (id: string, type: 'episodic' | 'semantic') =>
      GET<Memory[]>(`/agents/${id}/memory/${type}`),
    addMemory: (id: string, content: string) =>
      POST(`/agents/${id}/memory/semantic`, { text: content })
  }
  
  // Simulation endpoints
  simulation = {
    getState: () => GET<SimulationState>('/simulation/state'),
    control: (action: 'start' | 'pause' | 'reset', steps?: number) =>
      POST('/simulation/control', { action, steps }),
    getLogs: (limit?: number) => GET<SimulationLog[]>(`/simulation/logs?limit=${limit}`),
    autofill: (form: string, context?: string, seed?: any) =>
      POST('/autofill', { form, context, seed })
  }
  
  // World endpoints
  locations = {
    list: () => GET<Location[]>('/locations'),
    create: (data: LocationCreate) => POST<Location>('/locations', data),
    update: (id: string, data: Partial<Location>) => PATCH<Location>(`/locations/${id}`, data),
    delete: (id: string) => DELETE(`/locations/${id}`)
  }
  
  connections = {
    list: () => GET<Connection[]>('/connections'),
    create: (data: ConnectionCreate) => POST<Connection>('/connections', data),
    delete: (id: string) => DELETE(`/connections/${id}`)
  }
}
```

### WebSocket Client

```typescript
class WSClient {
  private ws: WebSocket | null = null
  private handlers: Set<(event: WSEvent) => void> = new Set()
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(WS_URL)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        resolve()
      }
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data) as WSEvent
        this.handlers.forEach(handler => handler(data))
      }
      
      this.ws.onerror = reject
    })
  }
  
  on(handler: (event: WSEvent) => void): () => void {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }
  
  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
}

// WebSocket Events
interface WSEvent {
  type: 'agent_action' | 'simulation_update' | 'log_entry' | 'error'
  data: any
  timestamp: string
}
```

---

## User Flows

### 1. Create Agent Flow

```
1. Navigate to Casting Call
2. Click "Create Agent"
3. Fill basic information
   → Optional: Use AI Autofill
4. Add personality traits
5. Define interests & skills
6. Write backstory
7. Click "Create"
   → API: POST /agents
   → Store: Add to agents map
   → UI: Show success notification
8. Agent appears in list
```

### 2. Build World Flow

```
1. Navigate to World Builder
2. Click "Add Location"
3. Select location type
4. Position on canvas (drag)
5. Configure properties
6. Click "Save"
   → API: POST /locations
7. Add connections between locations
   → Drag from location A to B
   → API: POST /connections
8. Save world configuration
```

### 3. Run Simulation Flow

```
1. Navigate to Grand Stage
2. Ensure agents & world configured
3. Click "Start Simulation"
   → API: POST /simulation/control
   → WS: Subscribe to updates
4. Watch real-time visualization
   → Agents move between locations
   → Speech bubbles show dialogue
   → Event log updates
5. Pause/resume as needed
6. Export logs when complete
```

### 4. Generate Story Flow

```
1. Navigate to Critic's Corner
2. Select simulation logs
3. Filter by agents/events
4. Click "Generate Story"
   → API: POST /stories
5. Review generated narrative
6. Edit in rich-text editor
7. Export to desired format
```

---

## Component Specifications

### Shared Components

#### Modal System
```svelte
<Modal {open} on:close>
  <h2 slot="header">Title</h2>
  <div slot="content">
    <!-- Form or content -->
  </div>
  <div slot="actions">
    <button on:click={save}>Save</button>
    <button on:click={close}>Cancel</button>
  </div>
</Modal>
```

#### Rich Text Editor
```svelte
<RichTextEditor
  bind:content
  placeholder="Enter backstory..."
  features={['bold', 'italic', 'lists', 'links']}
  maxLength={2000}
  on:change={handleChange}
/>
```

#### Agent Avatar
```svelte
<AgentAvatar
  {agent}
  size="lg"
  showStatus={true}
  animate={isActive}
  on:click={selectAgent}
/>
```

---

## Technical Requirements

### Performance Targets
- **Initial Load**: < 3 seconds
- **Time to Interactive**: < 5 seconds
- **API Response**: < 200ms (p95)
- **Animation FPS**: 60fps target, 30fps minimum
- **WebSocket Latency**: < 100ms

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Responsive Design
- **Desktop**: 1920x1080 optimal
- **Laptop**: 1366x768 minimum
- **Tablet**: Limited support (view-only)
- **Mobile**: Not supported (desktop-first)

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators

---

## Development Guidelines

### Code Organization

```
src/
├── lib/
│   ├── api/           # API client & types
│   ├── components/    # Reusable components
│   ├── stores/        # Svelte stores
│   ├── utils/         # Helper functions
│   └── types.ts       # TypeScript definitions
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte
│   ├── desk/
│   ├── stage/
│   └── corner/
└── app.html
```

### Component Guidelines

1. **Single Responsibility**: Each component has one clear purpose
2. **Props Interface**: Define TypeScript interfaces for all props
3. **Event Forwarding**: Use Svelte's event forwarding for bubbling
4. **Composition**: Prefer composition over inheritance
5. **Testing**: Unit tests for logic, E2E for flows

### State Management Rules

1. **Derived State**: Use derived stores for computed values
2. **Persistence**: Save UI preferences to localStorage
3. **Optimistic Updates**: Update UI before API confirmation
4. **Error Handling**: Graceful degradation with user feedback
5. **Loading States**: Show skeletons/spinners during async ops

---

## Testing Strategy

### Unit Tests
- Component logic
- Store actions
- Utility functions
- API client methods

### Integration Tests
- API integration
- WebSocket communication
- Store interactions
- Component composition

### E2E Tests (Playwright)
- User flows
- Critical paths
- Error scenarios
- Performance benchmarks

---

## Deployment

### Build Process
```bash
npm run build
# Outputs to build/
# Static files + SSR handler
```

### Environment Variables
```env
PUBLIC_API_URL=https://api.tinyverse.app
PUBLIC_WS_URL=wss://api.tinyverse.app/ws
PUBLIC_ENABLE_ANALYTICS=true
```

### CDN Strategy
- Static assets on Cloudflare
- API responses cached (where appropriate)
- WebSocket through dedicated subdomain

---

## Future Enhancements

### Phase 2 Features
- **Collaboration**: Multi-user simulations
- **Templates**: Pre-built scenarios
- **Plugins**: Custom visualizations
- **Mobile**: Responsive tablet view

### Phase 3 Features
- **3D Visualization**: Three.js integration
- **VR Mode**: Immersive viewing
- **AI Director**: Automated story beats
- **Export**: Video generation

---

## Appendix

### Type Definitions

```typescript
interface Agent {
  id: string
  name: string
  age: number
  occupation: string
  personality_traits: string[]
  professional_interests: string[]
  personal_interests: string[]
  skills: Skill[]
  backstory: string
  emoji?: string
  created_at: string
  relationships?: Relationship[]
  faculties?: Faculty[]
  tools?: Tool[]
}

interface Location {
  id: string
  name: string
  type: 'room' | 'outdoor' | 'special'
  description: string
  x: number
  y: number
  width: number
  height: number
  image?: string
}

interface SimulationLog {
  timestamp: string
  agent_id?: string
  agent_name?: string
  action_type: string
  content: string
  metadata?: Record<string, any>
}
```

---

*Frontend Specification v1.0 - Based on TinyTroupe Integration*
    def actions_constraints_prompt() -> str
```

#### 1.3.2 Implemented Faculties

**1. RecallFaculty** (Proactive Memory Search)

```python
class RecallFaculty(TinyMentalFaculty):
    name = "Recall"
    _abilities_to_support = ["RECALL"]
    
    # Configuration
    enable_full_scan: bool = True  # Allow exhaustive memory search
```

**Actions Supported**:
- `RECALL`: Search episodic memory for relevant information

**UI Configuration Form**:
```svelte
<FacultyConfig faculty="recall">
  <Toggle 
    label="Enable Full Memory Scan" 
    bind:checked={config.enable_full_scan}
    hint="When enabled, agents can search entire memory history. Disable for performance."
  />
</FacultyConfig>
```

**2. FilesAndWebGroundingFaculty** (Knowledge Base Integration)

```python
class FilesAndWebGroundingFaculty(TinyMentalFaculty):
    name = "FilesAndWebGrounding"
    _abilities_to_support = []  # Passive faculty, enriches context
    
    # Configuration
    allow_files: bool = True
    allow_web: bool = True
    folders_paths: List[str] = []  # File system paths
    web_urls: List[str] = []       # Web references
```

**UI Configuration Form**:
```svelte
<FacultyConfig faculty="grounding">
  <CheckboxGroup label="Knowledge Sources">
    <Checkbox bind:checked={config.allow_files} label="Local Files" />
    <Checkbox bind:checked={config.allow_web} label="Web URLs" />
  </CheckboxGroup>

  {#if config.allow_files}
    <PathSelector 
      label="Document Folders"
      bind:paths={config.folders_paths}
      placeholder="Select folders containing reference documents"
      multiple
    />
  {/if}

  {#if config.allow_web}
    <URLListBuilder
      label="Web References"
      bind:urls={config.web_urls}
      placeholder="https://example.com/reference"
      validate
    />
  {/if}
</FacultyConfig>
```

**3. TinyToolUse** (Tool Orchestration)

```python
class TinyToolUse(TinyMentalFaculty):
    name = "ToolUse"
    requires_faculties = ["Recall"]  # Needs memory to track tool state
    
    # Configuration
    tools: List[TinyTool] = []  # Assigned tools
```

**UI Configuration Form**:
```svelte
<FacultyConfig faculty="tool_use">
  <ToolSelector
    label="Enabled Tools"
    bind:selected={config.tool_ids}
    options={agentTools}
    hint="Select tools this agent can actively use"
  >
    <template slot="tool-card" let:tool>
      <div class="tool-card">
        <span class="tool-icon">{tool.icon}</span>
        <div class="tool-info">
          <h4>{tool.name}</h4>
          <p>{tool.description}</p>
          <div class="capabilities">
            {#each tool.capabilities as cap}
              <Badge>{cap}</Badge>
            {/each}
          </div>
        </div>
      </div>
    </template>
  </ToolSelector>
</FacultyConfig>
```

#### 1.3.3 Faculty Management UI

**Component**: `FacultyManager.svelte` (modal, accessed from agent detail)

**Layout**: Two-column

**Left Column (40% width)**: Faculty Catalog
- **Available Faculties** section:
  - Card grid (1 column)
  - Each faculty card:
    - Name + icon
    - Type badge (memory, knowledge, tools)
    - Description (2-3 sentences)
    - Requirements badge (if has dependencies)
    - "Activate" button (primary)
    - "Learn More" button (opens documentation modal)
- **Active Faculties** section (below):
  - Compact list
  - Each item: name, active badge, "Configure" / "Deactivate" buttons

**Right Column (60% width)**: Configuration Pane
- **When No Faculty Selected**:
  - Empty state: "Select a faculty to configure"
  - Illustration or icon
- **When Faculty Selected**:
  - Faculty header:
    - Name + icon
    - Active/Inactive toggle
    - Delete button (danger, with confirmation)
  - Configuration form (dynamic, based on faculty type)
  - "Save Changes" button (primary)
  - "Cancel" button (secondary)

**Keyboard Shortcuts**:
- `Esc`: Close modal
- `Ctrl/Cmd + S`: Save current faculty configuration
- Arrow keys: Navigate faculty list

### 1.4 Tools System

**Source**: `tinytroupe/tools/` directory (4 tool implementations)

#### 1.4.1 TinyTool Base Class

```python
class TinyTool:
    name: str                      # Tool identifier
    description: str               # Human-readable purpose
    owner: TinyPerson              # Agent that owns this tool instance
    real_world_side_effects: bool  # If true, actions have external effects
    
    # Capabilities
    _actions_definitions_prompt: str  # LLM prompt describing actions
    _actions_constraints_prompt: str  # LLM prompt with usage rules
    
    def process_action(action: dict, agent: TinyPerson) -> bool
    def _produce_tool_result(action: dict) -> dict
```

#### 1.4.2 Implemented Tools

**1. TinyCalendar** (Event Scheduling)

**Source**: `tinytroupe/tools/tiny_calendar.py`

```python
class TinyCalendar(TinyTool):
    name = "calendar"
    calendar: dict = {}  # {date_str: List[Event]}
    
    # Actions
    def create_event(title: str, start: datetime, duration: int, description: str = None, mandatory: bool = False) -> dict
    def find_events(year: int, month: int, day: int = None, hour: int = None, minute: int = None) -> List[dict]
    def is_time_available(year: int, month: int, day: int, hour: int, minute: int, duration: int) -> bool
```

**Event Schema**:
```typescript
interface CalendarEvent {
  id: string;           // UUID
  title: string;        // Event name
  start: string;        // ISO 8601 datetime
  duration: number;     // Minutes
  description?: string; // Optional details
  mandatory: boolean;   // If true, agent cannot decline
  attendees: string[];  // Agent IDs (owner always included)
  created_by: string;   // Agent ID
  created_at: string;   // ISO 8601
}
```

**UI Component**: `AgentCalendar.svelte`

**Views**:

1. **Month View** (default):
   - Grid layout (7 columns × 5-6 rows)
   - Each cell: date number + event indicators (dots, max 3)
   - Click cell to open day view
   - Click event dot to open event detail modal

2. **Week View**:
   - Time slots (rows, 00:00-23:59, 30min increments)
   - Day columns (7)
   - Events render as blocks with title + duration
   - Drag event to reschedule (if agent is owner)
   - Click event to open detail modal

3. **Day View**:
   - Single-day timeline (00:00-23:59, 15min increments)
   - Events render as timeline items
   - "Add Event" button (fixed, bottom-right)
   - Availability indicator (green=free, yellow=busy, red=conflict)

**Event Detail Modal**:
- Title (read-only if not owner, editable if owner)
- Start datetime (datetime picker, if owner)
- Duration (number input + unit selector: minutes/hours, if owner)
- Description (textarea, if owner)
- Mandatory checkbox (if owner)
- Attendees list (multi-select agent dropdown, if owner)
- Actions:
  - "Save Changes" (if owner)
  - "Delete Event" (danger, if owner, with confirmation)
  - "Close"

**Add Event Form** (modal):
- Title (text input, required)
- Start datetime (datetime picker, defaults to selected cell)
- Duration (number input, default 60, + unit selector)
- Description (textarea, optional)
- Mandatory (checkbox, default false)
- Attendees (multi-select, defaults to owner)
- "Create Event" / "Cancel"

**Calendar Sharing**:
- "Share Calendar" button (in toolbar)
- Opens modal: "Who can view this calendar?"
  - Agent multi-select
  - "Share" / "Cancel"
- Shared calendars appear in agent's calendar list (read-only)

**2. TinyWordProcessor** (Document Creation)

**Source**: `tinytroupe/tools/tiny_word_processor.py`

```python
class TinyWordProcessor(TinyTool):
    name = "word_processor"
    documents: List[Document] = []  # Owned documents
    
    # Actions
    def create_document(title: str, content: str = "") -> Document
    def write_document(document_id: str, content: str, clear_first: bool = False) -> None
    def edit_document(document_id: str, heading: str, new_content: str) -> None
    def read_document(document_id: str, return_remaining_headings: bool = False) -> tuple
    def export_document(document_id: str, format: str = "md") -> str  # "md", "docx", "json"
```

**Document Schema**:
```typescript
interface Document {
  id: string;              // UUID
  title: string;           // Document name
  content: string;         // Markdown or rich text
  headings: string[];      // Extracted section headings
  word_count: number;      // Auto-computed
  created_by: string;      // Agent ID
  created_at: string;      // ISO 8601
  updated_at: string;      // ISO 8601
  shared_with: string[];   // Agent IDs (read-only access)
}
```

**UI Component**: `AgentWordProcessor.svelte`

**Layout**: List + editor

**Left Pane (30% width)**: Document List
- Search bar (filters by title)
- Sort dropdown (title, date, word count)
- Document cards (compact):
  - Title
  - Word count
  - Last modified (relative time)
  - Shared indicator (if shared)
  - Actions: Open, Duplicate, Delete
- "New Document" button (fixed, top)

**Right Pane (70% width)**: Editor
- **When No Document Selected**:
  - Empty state: "Select a document or create a new one"
- **When Document Selected**:
  - **Toolbar**:
    - Title input (inline-editable)
    - Save button (auto-saves on blur, manual save via Ctrl/Cmd+S)
    - Export dropdown (Markdown, DOCX, JSON)
    - Share button (opens share modal)
    - Delete button (danger, with confirmation)
  - **Editor Area**:
    - Rich text editor (Tiptap integration):
      - Formatting: bold, italic, underline, strikethrough
      - Headings (H1-H6)
      - Lists (ordered, unordered)
      - Links
      - Code blocks
      - Quotes
    - Character count (bottom-right)
    - Last saved indicator (bottom-left, auto-updates)
  - **Metadata Panel** (collapsible, right sidebar):
    - Created by: Agent name
    - Created at: ISO date
    - Updated at: ISO date + relative time
    - Word count: Auto-computed
    - Shared with: Agent chips (removable if owner)

**Share Modal**:
- "Share Document" title
- Agent multi-select (excludes owner)
- Access level radio (future: read-only / edit)
- "Share" / "Cancel"

**Export Behavior**:
- **Markdown**: Downloads `.md` file with document title as filename
- **DOCX**: Downloads `.docx` (uses backend conversion with fallback to MD)
- **JSON**: Downloads structured JSON (includes metadata + content)

**3. Custom Tools** (Extensible System)

**Source**: User-defined subclasses of `TinyTool`

**UI Component**: `CustomToolBuilder.svelte` (modal)

**Form Sections**:

1. **Basic Info**:
   - Tool Name (text input, required, snake_case enforced)
   - Description (textarea, 200 char max)
   - Icon (emoji picker or icon selector)

2. **Capabilities**:
   - Actions list (repeatable fieldset):
     - Action Name (text input, UPPER_SNAKE_CASE enforced)
     - Action Description (textarea, LLM prompt format)
     - Parameters schema (JSON editor):
       - Visual builder option: add parameter, select type, set constraints
       - Raw JSON option: paste JSON Schema
     - Add/Remove buttons

3. **Configuration**:
   - Real-world Side Effects (checkbox):
     - Warning: "Enable only if this tool affects external systems"
   - LLM Constraints Prompt (textarea, optional):
     - Placeholder: "Describe usage rules for the LLM agent"

4. **Testing** (expandable):
   - Test Action form:
     - Action dropdown (populated from capabilities)
     - Parameter inputs (dynamic, based on schema)
     - "Invoke Test" button
   - Test Results display:
     - Success/error badge
     - Result payload (JSON tree view)

**Actions**:
- "Save Tool" (primary)
- "Save & Assign to Agent" (secondary, opens agent selector)
- "Cancel"

**Tool Registry View** (page accessible from Playwright's Desk):
- **Built-in Tools** section:
  - Card grid (calendar, word processor)
  - Each card: icon, name, description, "Assign to Agent" button
- **Custom Tools** section:
  - Card grid (user-created tools)
  - Each card: icon, name, description, usage count badge
  - Actions: Edit, Duplicate, Delete, "Assign to Agent"
- "Create Custom Tool" button (primary, top-right)

### 1.5 Extraction & Analysis System

**Source**: `tinytroupe/extraction/` directory (4 extractor types)

#### 1.5.1 Extractor Base Class

```python
class Extractor:
    chunk_size: int = 4000            # Max tokens per LLM call
    extraction_objective: str         # What to extract
    extraction_prompt: str            # LLM instructions
    
    def extract(text: str = None, agent: TinyPerson = None, artifact: object = None) -> dict
    def _extract_from_text(text: str) -> dict
    def _extract_from_agent(agent: TinyPerson) -> dict
```

#### 1.5.2 Implemented Extractors

**1. ResultsExtractor** (Structured Data Extraction)

```python
class ResultsExtractor(Extractor):
    fields: List[dict] = []  # [{name: str, description: str, type: str}]
    
    def extract(text: str) -> dict  # Returns {field_name: extracted_value}
```

**Example Use Case**: Extract survey responses, interview insights, or simulation outcomes as structured JSON.

**UI Component**: `ResultsExtractorConfig.svelte`

**Configuration Form**:
- Extraction Objective (textarea, required):
  - Placeholder: "Extract user feedback themes from agent conversations"
- Fields definition (repeatable rows):
  - Field Name (text input, snake_case)
  - Description (textarea, guides LLM extraction)
  - Expected Type (dropdown: string, number, boolean, array)
  - Add/Remove buttons
- Test Extraction (expandable):
  - Sample text input (textarea)
  - "Run Test" button
  - Results display (JSON tree view)

**2. ResultsReducer** (Summarization)

```python
class ResultsReducer(Extractor):
    reduce_on: str                        # Focus area for reduction
    result_key: str = "summary"           # Output key
    mode: str = "default"                 # "default", "comprehensive", "brief"
    
    def extract(results: dict) -> dict    # Returns {result_key: summary_text}
```

**Example Use Case**: Summarize a large set of extraction results into a concise narrative.

**UI Component**: `ResultsReducerConfig.svelte`

**Configuration Form**:
- Reduce On (text input, required):
  - Placeholder: "main themes and action items"
  - Hint: "Describes what aspect to focus on in the summary"
- Mode (radio group):
  - Default (balanced, ~500 words)
  - Comprehensive (detailed, ~1500 words)
  - Brief (concise, ~200 words)
- Result Key (text input, default "summary"):
  - Output field name in returned JSON

**3. NormalizingExtractor** (Data Cleaning)

```python
class NormalizingExtractor(Extractor):
    fields: List[dict] = []               # Field definitions with normalization rules
    normalizer: callable                  # Custom normalization function
    
    def extract(text: str) -> dict        # Returns normalized {field: value}
```

**Example Use Case**: Extract and standardize dates, currency, names with variations.

**UI Component**: `NormalizingExtractorConfig.svelte`

**Configuration Form**:
- Normalization Rules (repeatable rows):
  - Field Name (text input)
  - Normalization Type (dropdown):
    - Date (converts to ISO 8601)
    - Currency (converts to float + currency code)
    - Name (title-cases, removes extra whitespace)
    - Custom (JSON logic)
  - Custom Logic (JSON editor, if type=Custom):
    - Example: `{"regex": "\\d{4}-\\d{2}-\\d{2}", "format": "ISO8601"}`
  - Add/Remove buttons

**4. GenericArgsExtractor** (Function Call Extraction)

```python
class GenericArgsExtractor(Extractor):
    action_spec: dict                     # Function signature
    
    def extract(text: str) -> dict        # Returns {function_name: {arg: value}}
```

**Example Use Case**: Parse natural language into structured API calls or agent actions.

**UI Component**: `GenericArgsExtractorConfig.svelte`

**Configuration Form**:
- Action Specification (JSON editor):
  - Visual builder option:
    - Function name input
    - Parameters section (repeatable):
      - Param name, type, description, required checkbox
    - Add/Remove buttons
  - Raw JSON option:
    - Textarea with JSON Schema validation

#### 1.5.3 Unified Extraction UI

**Component**: `ExtractionStudio.svelte` (full page in Critic's Corner)

**Layout**: 3-column

**Left Column (25% width)**: Extractor Library
- Tabs: Built-in | Custom
- **Built-in Tab**:
  - List view:
    - ResultsExtractor card
    - ResultsReducer card
    - NormalizingExtractor card
    - GenericArgsExtractor card
  - Each card: name, icon, description, "Use" button
- **Custom Tab**:
  - User-created extractors list
  - Each card: name, type, last used, "Edit" / "Delete" buttons
  - "Create Custom Extractor" button (opens modal)

**Center Column (50% width)**: Extraction Workspace
- **Source Selection**:
  - Tabs: Text | Agent | Artifact
  - **Text Tab**:
    - Textarea input (10,000 char max)
    - Character count indicator
  - **Agent Tab**:
    - Agent selector dropdown
    - Memory range selector (episodic, semantic, or both)
  - **Artifact Tab**:
    - Document selector (from TinyWordProcessor)
- **Extractor Configuration**:
  - Active extractor header (name + icon)
  - Config form (dynamic, based on extractor type)
  - "Run Extraction" button (primary)
- **Results Area**:
  - Loading spinner (when running)
  - Results display (JSON tree view or markdown):
    - Copy JSON button
    - Download JSON button
    - "Reduce Results" button (if ResultsExtractor was used)

**Right Column (25% width)**: Extraction History
- List of recent extractions (last 50)
- Each item:
  - Extractor type badge
  - Timestamp (relative)
  - Source type indicator
  - "View Results" button
- Click item to load in workspace

**Keyboard Shortcuts**:
- `Ctrl/Cmd + Enter`: Run extraction
- `Ctrl/Cmd + C`: Copy results
- `Esc`: Close modals

### 1.6 Experimentation Framework

**Source**: `tinytroupe/experimentation/experiment.py` (389 lines)

#### 1.6.1 Experiment Structure

```python
class ABRandomizer:
    choices: List[str] = []               # Experimental conditions
    randomization_table: dict = {}        # {agent_name: chosen_condition}
    
    def randomize(items: List[object], agent: TinyPerson) -> object
    def derandomize(agent: TinyPerson, choices: List[object] = None) -> object
    def store_choices_in_agent(agent: TinyPerson, choices: List[object]) -> None
```

**Example Use Cases**:
- A/B test different prompt variations
- Randomize agent personalities across simulation runs
- Test factorial designs (2×2, 3×2, etc.)

**UI Component**: `ExperimentDesigner.svelte` (page in Critic's Corner)

**Layout**: Wizard-style (multi-step form)

**Step 1: Define Conditions**
- Experiment Name (text input, required)
- Description (textarea, optional)
- Conditions (repeatable rows):
  - Condition Name (text input, e.g., "Treatment A", "Control")
  - Description (textarea)
  - Parameters (JSON editor):
    - Visual option: key-value pairs
    - Raw JSON option
  - Add/Remove buttons
- "Next" button (validates min 2 conditions)

**Step 2: Select Agents**
- Agent multi-select (all agents in current world)
- Randomization mode (radio):
  - Fully Random (default)
  - Stratified (requires stratification variable, e.g., age, occupation)
  - Blocked (group agents, randomize within blocks)
- "Previous" / "Next" buttons

**Step 3: Configure Simulation**
- Simulation Steps (number input, required)
- Time Progression (radio: real-time, accelerated, manual)
- Metrics to Track (checklist):
  - Agent actions count
  - Memory size (episodic, semantic)
  - Inter-agent communication frequency
  - Custom metrics (JSON schema input for advanced users)
- "Previous" / "Next" buttons

**Step 4: Review & Launch**
- Summary view:
  - Experiment name
  - Conditions count + agent assignment preview
  - Simulation parameters
  - Estimated runtime (based on steps + speed)
- "Edit" buttons for each section (jumps back to relevant step)
- "Launch Experiment" button (primary)
- "Save as Draft" button (secondary)

**Experiment Execution View** (replaces Grand Stage during experiment):

**Header**:
- Experiment name
- Progress bar (steps completed / total steps)
- Current condition display (shows active conditions per agent)
- Control buttons: Pause, Resume, Stop (with confirmation)

**Main Area**:
- Split view:
  - **Left (60%)**: Condition-specific Grand Stage views
    - Tab per condition
    - Each tab shows agents in that condition
    - Live speech bubbles and interactions
  - **Right (40%)**: Real-time Metrics Dashboard
    - Charts (updated every N steps):
      - Actions per condition (bar chart)
      - Memory growth (line chart)
      - Communication heatmap
    - Metrics table (live data)

**Post-Experiment Analysis**:
- Automatically opens Extraction Studio
- Pre-configured with:
  - ResultsExtractor targeting experiment metrics
  - ResultsReducer for summary
- Export options:
  - Full results (JSON)
  - Summary report (Markdown/PDF)
  - Per-condition data (CSV)

---

## 2. UI Patterns & Component Library

### 2.1 Form Patterns

#### 2.1.1 LLM-Assisted Autofill

**Design Pattern**: Every input field can have an optional "autofill" enhancement without requiring it.

**Implementation**:
```svelte
<script>
  import AutofillTrigger from '$lib/components/common/AutofillTrigger.svelte';
  let value = '';
</script>

<div class="field-wrapper">
  <label for="field">Field Label</label>
  <div class="input-group">
    <input 
      id="field" 
      bind:value 
      placeholder="Enter manually or use autofill"
    />
    <AutofillTrigger 
      fieldName="field"
      context={{ agent: currentAgent, world: currentWorld }}
      on:filled={(e) => value = e.detail}
    />
  </div>
  <span class="field-hint">Helper text here</span>
</div>
```

**AutofillTrigger Component Spec**:
- **Props**:
  - `fieldName` (string, required): Semantic name for LLM prompt context
  - `context` (object, optional): Additional data for LLM (agent profile, world state, etc.)
  - `compact` (boolean, default false): If true, renders as emoji-only button (✨)
- **Events**:
  - `filled`: Dispatched with `{ detail: generated_value }` when LLM returns
- **States**:
  - Idle: Small ghost button with sparkle emoji
  - Loading: Spinner replaces emoji
  - Success: Brief checkmark animation, then returns to idle
  - Error: Error icon + tooltip with retry button
- **Accessibility**:
  - Button has `aria-label="Autofill [field name]"`
  - Keyboard navigable
  - Screen reader announces when field is filled

#### 2.1.2 Multi-Step Wizards

**Design Pattern**: Complex creation flows split into digestible steps with validation per step.

**Implementation**: `StepWizard.svelte` base component

**Props**:
- `steps` (array, required): `[{ id, label, component, validate }]`
- `initialData` (object, optional): Pre-fill data
- `onComplete` (function, required): Called with final data

**Features**:
- Progress indicator (1 of N)
- Back/Next buttons (disabled when validation fails)
- Summary step (last step, read-only review)
- Dirty state tracking (warns on close if unsaved)
- Keyboard navigation (Ctrl+Left/Right for steps)

**Example Usage**:
```svelte
<StepWizard
  steps={[
    { id: 'identity', label: 'Identity', component: AgentIdentityForm, validate: validateIdentity },
    { id: 'personality', label: 'Personality', component: AgentPersonalityForm, validate: validatePersonality },
    { id: 'skills', label: 'Skills', component: AgentSkillsForm, validate: validateSkills },
    { id: 'review', label: 'Review', component: AgentReviewStep }
  ]}
  initialData={draftAgent}
  onComplete={createAgent}
/>
```

#### 2.1.3 Inline Validation

**Design Pattern**: Real-time validation feedback without blocking input.

**States**:
1. **Pristine**: No validation run yet (field untouched)
2. **Valid**: Green checkmark icon (far-right of input)
3. **Invalid**: Red error icon + error message below input
4. **Warning**: Yellow warning icon + warning message (non-blocking)

**Timing**:
- Validation runs `onBlur` for single fields
- Real-time validation for critical fields (name uniqueness, email format)
- Form-level validation on submit attempt

**Error Message Patterns**:
- Required: "[Field] is required"
- Format: "[Field] must be [format description]" (e.g., "Age must be between 0 and 120")
- Uniqueness: "[Field] '[value]' already exists"
- Relationship: "[Field] requires [other field] to be set first"

### 2.2 Visualization Patterns

#### 2.2.1 Grand Stage (Spatial Canvas)

**Technology**: SVG-based canvas with pan/zoom (D3.js zoom behavior)

**Coordinate System**:
- World units: Arbitrary scale (e.g., 1 unit = 1 meter)
- Canvas dimensions: Viewport-relative (fills container)
- Transform: `translate(x, y) scale(k)` where k is zoom level

**Rendering Layers** (z-index order, bottom to top):
1. **Background Layer** (z=0):
   - Grid overlay (toggleable)
   - Background image (if world has one)
2. **Connections Layer** (z=10):
   - Lines between locations
   - Arrow markers for directional
   - Labels at midpoints
3. **Locations Layer** (z=20):
   - Rectangles with rounded corners
   - Fill color by type
   - Name labels centered
4. **Agents Layer** (z=30):
   - Circles with emoji or avatar
   - Name labels below circle
   - Active agent highlight (glow effect)
5. **Interactions Layer** (z=40):
   - Speech bubbles (see 2.2.2)
   - Action indicators (icons for tools, movement arrows)
6. **UI Overlays** (z=50):
   - Selection handles (for locations)
   - Context menus
   - Minimap (bottom-left corner)

**Interactions**:
- **Pan**: Click and drag background OR middle-click drag
- **Zoom**: Mouse wheel OR pinch gesture OR zoom controls
- **Select**: Click agent or location → highlights + shows context panel
- **Multi-select**: Shift+click OR drag selection box
- **Move**: Drag agent → updates `current_location` in real-time
- **Resize Location**: Drag corner handles (when location selected)
- **Create Connection**: Select tool, click source location, click target location

**Performance Optimizations**:
- Virtualization: Only render entities within viewport + buffer (20% margin)
- Interaction debouncing: Drag updates throttled to 60fps
- Layer caching: Pre-render static layers (background, locations) to off-screen canvas

#### 2.2.2 Speech Bubbles

**Design Spec**:

**Visual Style**:
- Background: Semi-transparent surface color (`var(--color-surface-variant)`)
- Border: 1px solid with slight alpha
- Border radius: 12px
- Padding: 12px 16px
- Drop shadow: Subtle, 2px offset, 8px blur
- Tail: Small triangle pointing to agent (CSS clip-path)

**Text Styling**:
- Font: System UI, 14px
- Color: High-contrast text (`var(--color-text)`)
- Max width: 200px
- Word wrap: Enabled
- Max lines: 5 (with ellipsis on overflow)

**Positioning**:
- Anchor: Agent center position
- Offset: 60px above agent (base), -40px per stack index
- Stack limit: 3 bubbles per agent (oldest fades out)

**Animation**:
- Entry: Fade in (200ms) + slight scale-up (0.9→1.0)
- Exit: Fade out (400ms) + slight scale-down (1.0→0.95)
- Duration: 1.6s minimum + 0.5s per 10 words (max 8s)

**Accessibility**:
- Bubbles are announced by screen readers in chronological order
- Color contrast ratio ≥ 4.5:1 (WCAG AA)

#### 2.2.3 Network Graphs (Relationships)

**Technology**: D3.js force-directed layout

**Node Design**:
- Circle: 40px diameter
- Fill: Agent emoji or solid color (if no emoji)
- Stroke: 2px, color based on selection state
- Label: Agent name, positioned below, max-width 80px with ellipsis

**Edge Design**:
- Line: 2px stroke width
- Color: Based on relationship type (see color palette)
- Style: Solid (bidirectional) or dashed (one-way)
- Arrow: SVG marker at target end (if directional)
- Label: Relationship type, positioned at midpoint, background for readability

**Layout Options**:
1. **Force-Directed** (default):
   - Forces: repulsion (agents), attraction (relationships), centering
   - Customizable: Gravity, link distance, charge strength
2. **Hierarchical**:
   - Root agent at top, relationships radiate downward
   - Useful for mentor-mentee or org chart structures
3. **Circular**:
   - Agents arranged in circle, relationships as chords
   - Good for highlighting symmetry

**Interactions**:
- Hover node: Highlight node + connected edges
- Click node: Select agent, show relationships in side panel
- Click edge: Select relationship, show detail in side panel
- Drag node: Reposition (layout persists via localStorage)

**Color Palette** (relationship types):
- Friend: Blue (#3B82F6)
- Colleague: Gray (#6B7280)
- Family: Green (#10B981)
- Rival: Red (#EF4444)
- Mentor: Purple (#8B5CF6)
- Custom: Orange (#F59E0B)

### 2.3 Real-Time Update Patterns

#### 2.3.1 WebSocket Event Handling

**Architecture**: Centralized WebSocket service with pub-sub event bus

**Service**: `src/lib/services/websocket.ts`

```typescript
class WebSocketService {
  private ws: WebSocket;
  private subscribers: Map<string, Set<Function>>;
  
  connect(url: string): void
  disconnect(): void
  subscribe(eventType: string, callback: Function): UnsubscribeFunction
  send(message: object): void
  
  // Auto-reconnect with exponential backoff
  private reconnect(): void
}
```

**Event Types** (backend emits, frontend consumes):

1. **`simulation_step`**:
   - Payload: `{ step: number, timestamp: string }`
   - Subscribers: StageControls (step counter), GrandStage (trigger log fetch)

2. **`dialogue`**:
   - Payload: `{ agent_id, agent_name, content, timestamp }`
   - Subscribers: GrandStage (speech bubble), TranscriptDrawer (log append)

3. **`agent_action`**:
   - Payload: `{ agent_id, action_type, content, target?, metadata }`
   - Subscribers: TranscriptDrawer (log), AgentActionPanel (live action list)

4. **`agent_moved`**:
   - Payload: `{ agent_id, from_location, to_location, timestamp }`
   - Subscribers: GrandStage (update agent position)

5. **`memory_updated`**:
   - Payload: `{ agent_id, memory_type: 'episodic'|'semantic', operation: 'add'|'delete', item_id? }`
   - Subscribers: MemoryInspector (refresh if agent matches)

6. **`simulation_paused`**:
   - Payload: `{ step: number, reason?: string }`
   - Subscribers: SimulationControls (```markdown
// filepath: /Users/oli/code/tinyverse/docs/FRONTEND_SPECIFICATION.md
