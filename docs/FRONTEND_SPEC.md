# TinyVerse Frontend Specification
## UI Components and View Hierarchy

**Version**: 3.1 (Components & Views Only)  
**Date**: 2025-01-10

---

## View Hierarchy

### Primary Navigation Structure (Three-Surface Model)

#### 1. Playwright's Desk (Creation & Configuration)
- **Agents**
  - `/agents` - Agent list and creation
  - `/agents/:id` - Agent detail and editing
  - `/agents/:id/memory` - Memory inspector
  - `/agents/:id/relationships` - Relationship manager
  - `/agents/:id/faculties` - Mental faculties configuration
  - `/agents/:id/tools` - Tool assignments
- **Worlds**
  - `/worlds` - World list and configuration
  - `/worlds/:id/settings` - World settings
  - `/worlds/:id/agents` - Agent assignment
- **Tools**
  - `/tools` - Tool registry and builder
  - `/tools/custom` - Custom tool creator
  - `/tools/:id` - Tool detail/editor

#### 2. Grand Stage (Execution & Observation)
- **Simulation**
  - `/worlds/:id/stage` - Main simulation view
  - `/worlds/:id/timeline` - Historical timeline
  - `/worlds/:id/transcript` - Communication log
  - `/worlds/:id/broadcast` - Message broadcaster
- **Controls**
  - Simulation playback controls (overlay)
  - Speed controls (overlay)
  - Agent action panel (context panel)

#### 3. Critic's Corner (Analysis & Insights)
- **Experiments**
  - `/experiments` - Experiment designer
  - `/experiments/:id` - Experiment execution
  - `/experiments/:id/results` - Experiment analysis
- **Extraction**
  - `/extraction` - Extraction studio
  - `/extraction/history` - Extraction history
- **Analysis**
  - `/analysis` - Analysis dashboard
  - `/analysis/reports` - Generated reports

---

## Component Inventory

### Core Components (25)

#### Layout Components
- **AppShell** - Main application container with three-surface navigation
- **TopNav** - Top navigation bar with surface switcher
- **SideNav** - Context-sensitive sidebar navigation
- **Breadcrumbs** - Hierarchical navigation path
- **PageHeader** - Page title with primary actions

#### Common UI Elements
- **Button** - Standard button with variants (primary, secondary, ghost, danger)
- **Input** - Text input wrapper with validation states
- **Select** - Dropdown selector with search capability
- **Modal** - Full-screen or centered dialog container
- **Drawer** - Slide-out panel from edges
- **Card** - Content container with optional actions
- **Badge** - Status indicator or count display
- **Tooltip** - Contextual hover information
- **Loading** - Loading states (spinner, skeleton, progress)
- **EmptyState** - Placeholder for empty data states

#### Form Components
- **Form** - Form container with validation orchestration
- **FieldGroup** - Form field wrapper with label and error display
- **TagInput** - Multi-value input with autocomplete
- **RichTextEditor** - WYSIWYG text editor with formatting toolbar
- **JsonEditor** - JSON schema editor with visual/raw modes

#### Data Display Components
- **DataTable** - Sortable, filterable data table
- **VirtualList** - Performance-optimized scrolling list
- **Timeline** - Horizontal timeline visualization
- **NetworkGraph** - Interactive D3-based network visualization
- **Chart** - Chart.js wrapper for various chart types

### Domain-Specific Components (55+)

#### Agent Components (15)
- **AgentCard** - Compact agent display for lists
- **AgentFormComprehensive** - Multi-section agent creation form
- **AgentDetail** - Full agent profile view
- **AgentActionPanel** - Runtime agent control panel
- **AgentBehaviorLog** - Agent action history display
- **AgentIdentityForm** - Identity section of agent form
- **AgentPersonalityForm** - Personality traits editor
- **AgentSkillsForm** - Skills and capabilities builder
- **AgentBackstoryEditor** - Rich backstory composition
- **AgentGoalsManager** - Current goals editor
- **AgentStateDisplay** - Real-time state visualization
- **AgentConfigurationPanel** - Advanced LLM settings
- **AgentEmotionalState** - Emotional state indicator
- **AgentContextStack** - Current context display
- **AgentQuickActions** - Contextual action buttons

#### World Components (10)
- **WorldCard** - World list item with preview
- **WorldConfiguration** - Comprehensive world settings form
- **SimulationControls** - Playback control toolbar
- **BroadcastPanel** - Message broadcasting interface
- **GrandStage** - Main simulation visualization canvas
- **WorldAgentManager** - Agent assignment interface
- **WorldTimeDisplay** - Simulated time indicator
- **WorldCommunicationBuffer** - Message history viewer
- **WorldStateExporter** - State export controls
- **WorldResetConfirmation** - Reset confirmation modal

#### Memory Components (8)
- **MemoryInspector** - Full-screen memory browser
- **EpisodicMemoryTab** - Chronological memory view
- **SemanticMemoryTab** - Knowledge base view
- **MemoryItemCard** - Individual memory display
- **MemoryFilters** - Memory filtering controls
- **MemorySearch** - Semantic search interface
- **MemoryIngestor** - Content ingestion forms
- **MemorySummarizer** - Summary generation interface

#### Relationship Components (6)
- **RelationshipNetworkManager** - Split-view relationship editor
- **RelationshipGraph** - Force-directed network visualization
- **RelationshipList** - Tabular relationship display
- **RelationshipEditor** - Individual relationship form
- **RelationshipAddModal** - New relationship creator
- **RelationshipStrengthSlider** - Relationship strength control

#### Tool Components (8)
- **AgentCalendar** - Calendar view with events
- **CalendarEventModal** - Event creation/editing form
- **AgentWordProcessor** - Document editor interface
- **DocumentList** - Document browser sidebar
- **CustomToolBuilder** - Visual tool creation wizard
- **ToolRegistry** - Tool catalog browser
- **ToolCard** - Tool display in registry
- **ToolCapabilityEditor** - Tool action definer

#### Mental Faculty Components (4)
- **FacultyManager** - Faculty configuration modal
- **FacultyCard** - Faculty catalog item
- **FacultyConfig** - Dynamic configuration forms
- **FacultyDependencyGraph** - Faculty requirement visualizer

#### Extraction Components (8)
- **ExtractionStudio** - Three-column extraction workspace
- **ExtractorLibrary** - Extractor catalog sidebar
- **ExtractionWorkspace** - Central extraction configuration
- **ExtractionHistory** - Recent extractions list
- **ResultsExtractorConfig** - Structured data extraction form
- **ResultsReducerConfig** - Summarization configuration
- **NormalizingExtractorConfig** - Data normalization rules
- **GenericArgsExtractorConfig** - Function call extraction setup

#### Experiment Components (6)
- **ExperimentDesigner** - Multi-step experiment wizard
- **ExperimentExecution** - Live experiment view
- **ExperimentResults** - Post-experiment analysis
- **ConditionDefiner** - Experimental condition builder
- **AgentRandomizer** - Agent assignment interface
- **MetricsDashboard** - Real-time metrics display

#### Supporting Components (10)
- **AutofillTrigger** - LLM autofill button for any field
- **StepWizard** - Multi-step form orchestrator
- **SpeechBubble** - Agent speech visualization
- **ThoughtCloud** - Agent thought visualization
- **NotificationToast** - Temporary notification display
- **CommandPalette** - Global command search
- **KeyboardShortcutsHelp** - Shortcuts reference modal
- **ConnectionStatus** - WebSocket connection indicator
- **ExportDialog** - Data export options modal
- **ConfirmationModal** - Action confirmation dialog

---

## Component Categories Summary

### By Functionality
- **Forms & Input**: 18 components
- **Data Display**: 15 components
- **Visualization**: 12 components
- **Navigation**: 8 components
- **Modals & Overlays**: 10 components
- **Real-time Updates**: 8 components
- **Configuration**: 12 components
- **Analysis**: 8 components

### By Complexity
- **Atomic** (buttons, inputs, badges): 15 components
- **Molecular** (cards, forms, panels): 25 components
- **Organisms** (complex views, wizards): 20 components
- **Templates** (full pages): 15 components
- **Surfaces** (top-level navigation areas): 3 surfaces

### By Data Interaction
- **Read-only Display**: 20 components
- **User Input**: 25 components
- **Real-time Updated**: 15 components
- **Hybrid Interactive**: 20 components

---

## Total Component Count
- **Core Components**: 25
- **Domain Components**: 55+
- **Supporting Components**: 10
- **Total Unique Components**: ~90

---

**Document Version**: 3.1 (Components & Views Only)  
**Last Updated**: 2025-01-10
   - Columns: timestamp, action_type, content, outcome
   - Click row to expand full action payload

#### 1.1.3 Relationships System

**Extracted from relationship methods and `_relations` attribute**:

```python
_relations: List[dict] = []  # Each entry: {agent: TinyPerson, relation: str, description: str}
_accessible_agents: List[TinyPerson] = []  # Agents currently reachable
```

**Relationship Schema**:
```typescript
interface AgentRelationship {
  id: string;              // System UUID
  source_agent_id: string; // This agent
  target_agent_id: string; // Related agent
  relation_type: string;   // "friend", "colleague", "family", "rival", etc.
  description?: string;    // Optional narrative context
  strength: number;        // 0.0-1.0, computed or explicit
  bidirectional: boolean;  // If true, implies symmetric relation
  created_at: string;      // ISO 8601
  updated_at: string;
}
```

**UI Component**: `RelationshipNetworkManager.svelte`

**Layout**: Split view (graph + list)

**Left Pane (60% width)**: Force-directed graph
- **Nodes**: Agents (emoji + name label)
- **Edges**: Relationships (lines with labels)
  - Color by relation type (friend=blue, colleague=gray, family=green, rival=red)
  - Width by strength (0.1-1.0 scale)
  - Arrow for directional relationships
- **Interactions**:
  - Click node → highlight connected relationships, show detail in right pane
  - Click edge → show relationship detail in right pane
  - Drag node → reposition (layout persists)
  - Double-click node → navigate to agent detail
- **Controls** (overlay, top-right):
  - Layout algorithm dropdown (force, hierarchical, circular)
  - Zoom slider
  - "Fit to View" button
  - "Reset Layout" button

**Right Pane (40% width)**: Relationship list + editor
- **When No Selection**:
  - "Add Relationship" button (primary)
  - Relationship list (all relationships for current world):
    - Group by source agent
    - Each item: source emoji + name → target emoji + name
    - Relation badge (color-coded)
    - Edit / Delete buttons
- **When Node Selected**:
  - Agent card (compact):
    - Emoji + name
    - Relationship count badge
    - "View Agent" button
  - Connected relationships list:
    - Outgoing section (this agent → others)
    - Incoming section (others → this agent)
    - Each item: target emoji + name, relation badge, strength bar
    - Edit / Delete buttons
- **When Edge Selected**:
  - Relationship editor:
    - Source/Target (read-only, emoji + name)
    - Relation Type (text input with autocomplete):
      - Predefined: friend, colleague, family, rival, mentor, mentee, acquaintance
      - Custom allowed
    - Description (textarea, optional, 500 char max)
    - Strength (slider, 0.0-1.0, step 0.1)
    - Bidirectional (checkbox)
    - "Save" / "Cancel" buttons

**Add Relationship Modal**:
- Source agent dropdown (defaults to currently selected, if any)
- Target agent dropdown (excludes source)
- Relation type input (same as editor)
- Description textarea (optional)
- Strength slider
- Bidirectional checkbox
- "Create" / "Cancel" buttons
- **LLM Autofill**: "Infer relationship from agent profiles" button
  - Analyzes source + target backstories, interests, occupations
  - Suggests relation type, description, and strength

#### 1.1.4 Memory System (Detailed)

**Source Analysis**: `tinytroupe/agent/memory.py` (episodic + semantic implementations)

**Episodic Memory** (`EpisodicMemory` class):

```python
class EpisodicMemory:
    memory: List[dict] = []  # Chronological event log
    
    def store(item: dict, idx: int = None) -> None
    def retrieve(first_n: int = None, last_n: int = None, item_type: str = None) -> List[dict]
    def retrieve_recent(item_type: str = None, include_omission_info: bool = True) -> List[dict]
    def clear(max_prefix: int = None, max_suffix: int = None) -> None
    def count() -> int
```

**Semantic Memory** (`SemanticMemory` class):

```python
class SemanticMemory:
    documents: List[str] = []       # RAG corpus
    index: object = None            # Vector index (FAISS/similar)
    
    def store(text: str = None, url: str = None, metadata: dict = None) -> None
    def retrieve_all(item_type: str = None, limit: int = 100) -> List[dict]
    def query(query_text: str, top_k: int = 5) -> List[tuple]  # (doc, score)
    def summarize(query_text: str, batch_size: int = 10) -> str
    def clear() -> None
```

**UI Component**: `MemoryInspector.svelte` (modal, full-screen capable)

**Header**:
- Agent selector dropdown (if opened from agent list, pre-selects current agent)
- Tab switcher: Episodic | Semantic
- Export button (dropdown: JSON, CSV)
- Close button

**Episodic Tab**:

**Filters** (top bar):
- Item Type dropdown (all, action, stimulus, thought, speech, observation)
- Date range picker (start/end dates)
- Search input (full-text, debounced)
- "Clear Filters" button

**Timeline View** (main area):
- Virtualized list (handles 10,000+ items)
- Each memory item card:
  - Timestamp (HH:MM:SS, relative time on hover: "2 minutes ago")
  - Item type badge (color-coded)
  - Content (truncated to 3 lines, "Show more" expander)
  - Metadata section (collapsible):
    - Agent actions (if action type)
    - Source agent (if stimulus from another agent)
    - Location (if movement)
    - Thought type (if thought)
  - Actions: Copy JSON, Delete (with confirmation)
- **Infinite scroll**: Load 50 items at a time, append on scroll

**Actions Bar** (bottom):
- "Clear Recent" button (modal: "How many recent items to keep?")
  - Slider: 0-1000, default 100
  - "Confirm" / "Cancel"
- "Clear All" button (double confirmation)
  - First modal: "This will delete all episodic memories. Continue?"
  - Second modal: "Keep first/last N items?"
    - First N slider (0-500)
    - Last N slider (0-500)
    - "Clear Now" / "Cancel"

**Semantic Tab**:

**Search Section** (top):
- Query input (large textarea, placeholder: "What do you want to find?")
- Top K slider (1-20, default 5)
- "Search Memory" button (primary)
- "Summarize" button (secondary, opens modal)

**Results Section** (main area):
- When no query: "Enter a query to search semantic memory"
- When results present:
  - Result cards (ranked by relevance):
    - Relevance score (0.0-1.0, progress bar)
    - Content excerpt (first 500 chars, expandable)
    - Metadata:
      - Source (text, URL, or document name)
      - Timestamp stored
      - Item type
    - Actions: Copy, View Full, Delete
- Pagination (if more than 20 results)

**Ingest Section** (collapsible panel, bottom):
- "Add to Memory" header with toggle
- Content source tabs: Text | URL | Document
  - **Text Tab**:
    - Textarea (5000 char max)
    - "Ingest Text" button
  - **URL Tab**:
    - URL input (with validation)
    - "Fetch & Ingest" button (shows loading spinner)
    - Preview area (shows fetched content before ingesting)
  - **Document Tab**:
    - File uploader (accepts .txt, .md, .pdf, .docx)
    - Document name input (optional, defaults to filename)
    - "Upload & Ingest" button

**Summarize Modal**:
- Query input (same as search, pre-filled if search was run)
- Batch size slider (5-50, default 10)
  - Explanation tooltip: "Higher values = more comprehensive, slower"
- "Generate Summary" button
- Summary display area:
  - Markdown rendering
  - Copy button
  - "Refine" button (allows editing query and re-running)

### 1.2 TinyWorld (Environment System)

**Source**: `tinytroupe/environment/tiny_world.py` (843 lines)

#### 1.2.1 World Configuration

```python
class TinyWorld:
    name: str                              # World identifier
    agents: List[TinyPerson] = []          # Active participants
    current_datetime: datetime             # Simulated clock
    broadcast_channels: List[str] = []     # Communication channels
    communication_buffer: List[dict] = []  # Event history
    _step: int = 0                         # Iteration counter
    
    # Configuration
    _internal_communication_style: str     # "full", "selective", or "none"
    _allow_agents_to_die: bool = False     # Permanent agent removal
```

**UI Component**: `WorldConfiguration.svelte` (Settings page)

**Form Sections**:

1. **Basic Settings**:
   - World Name (text input, required, 1-100 chars)
   - Description (textarea, optional, 500 char max)
   - Created Date (read-only, ISO format)
   - Last Modified (read-only, ISO format, auto-updates)

2. **Simulation Settings**:
   - Starting DateTime (datetime picker):
     - Date picker
     - Time picker (HH:MM format)
     - "Use Current Time" button
   - Time Progression Mode (radio group):
     - Real-time (1 simulation second = 1 real second)
     - Accelerated (slider: 2x to 100x)
     - Manual (time only advances on explicit `advance_time` actions)

3. **Communication Settings**:
   - Internal Communication Style (dropdown):
     - Full: All agents hear all broadcasts
     - Selective: Agents only hear targeted messages
     - None: No inter-agent communication (isolated agents)
   - Broadcast Channels (tag input):
     - Predefined: "global", "location-based", "relationship-based"
     - Custom channels allowed
   - Buffer Size Limit (number input, 100-10000, default 1000):
     - Tooltip: "Older messages are discarded when limit is reached"

4. **Advanced Settings**:
   - Allow Agents to Die (checkbox):
     - Warning badge: "Irreversible. Dead agents are removed from the world."
     - Requires confirmation toggle to enable
   - Auto-Save Interval (number input, 0-3600 seconds, 0=disabled):
     - Saves world state to backend at interval
   - Maximum Simulation Steps (number input, 0=unlimited)
     - Simulation auto-pauses when limit is reached

**Actions**:
- Save Configuration (primary button)
- Reset to Defaults (secondary button, with confirmation)
- Export Configuration (ghost button, downloads JSON)

#### 1.2.2 World Execution Methods

**Extracted from public methods** (22 methods analyzed):

```python
# Core Simulation
run(steps: int = None, continue_from_step: int = None) -> None
run_minutes(minutes: int) -> None
run_hours(hours: int) -> None
run_days(days: int) -> None
skip(steps: int = 1) -> None

# Agent Management
add_agent(agent: TinyPerson) -> None
remove_agent(agent: TinyPerson) -> None
get_agent_by_name(name: str) -> TinyPerson
add_agents(agents: List[TinyPerson]) -> None

# Communication
broadcast(speech: str, source: TinyPerson = None) -> None
broadcast_to_channel(channel: str, speech: str, source: TinyPerson = None) -> None
broadcast_internal_stimulus(stimulus: dict) -> None

# State Management
encode_complete_state() -> dict
decode_complete_state(state: dict) -> TinyWorld
clear_communications() -> None
reset() -> None

# Observation
get_agent_observations(agent_name: str) -> List[dict]
get_agent_thoughts(agent_name: str) -> List[str]
get_agent_actions(agent_name: str) -> List[dict]
```

**UI Components for Execution**:

1. **SimulationControls.svelte** (sticky toolbar on Grand Stage):

   **Playback Controls** (left group):
   - Play button (▶️ / ⏸️ toggle):
     - Click to start continuous execution
     - Transforms to pause when running
     - Keyboard: Spacebar
   - Step button (⏭️):
     - Execute one step
     - Disabled while running
     - Keyboard: Right arrow
   - Skip button (⏩):
     - Opens modal: "Skip how many steps?"
     - Number input (1-1000)
     - "Skip Now" / "Cancel"
     - Keyboard: Shift + Right arrow

   **Time Controls** (center group):
   - Run by Time dropdown:
     - Options: Minutes (1, 5, 15, 30, 60)
     - Options: Hours (1, 2, 4, 8, 24)
     - Options: Days (1, 7, 30)
     - Click option to execute that duration
   - Current Step display (read-only badge)
   - Simulated Time display (HH:MM format, updates in real-time)

   **Speed Control** (right group):
   - Speed multiplier dropdown:
     - 0.25x (slow motion)
     - 0.5x
     - 1x (normal, default)
     - 2x
     - 5x
     - 10x (fast forward)
   - Auto-pause toggle:
     - When enabled, simulation pauses after each step
     - Useful for debugging

   **Actions** (far right):
   - Reset button (🔄):
     - Confirmation: "Reset world to initial state?"
     - Clears communications, resets step counter, restores agents
   - Export State button (💾):
     - Downloads complete world state as JSON
     - Includes agents, memories, relationships, communications

2. **BroadcastPanel.svelte** (drawer, toggleable from Grand Stage):

   **Header**:
   - "Broadcast Message" title
   - Channel selector dropdown
   - Close button

   **Message Composer**:
   - Source agent dropdown (optional, defaults to "System")
   - Message textarea (1000 char max)
   - "Send to All" button (primary)
   - "Send to Channel" button (secondary, requires channel selection)

   **Recent Broadcasts** (below composer):
   - Last 10 broadcasts displayed
   - Each item: timestamp, source, message preview, channel badge
   - Click to view full message

### 1.3 Mental Faculties System

**Source**: `tinytroupe/agent/mental_faculty.py` (412 lines)

#### 1.3.1 Faculty Base Architecture

```python
class TinyMentalFaculty:
    name: str                              # Faculty identifier
    requires_faculties: List[str] = []     # Dependencies
    _abilities_to_support: List[str] = []  # Supported actions
    
    def process_action(action: dict, agent: TinyPerson) -> bool
    def actions_definitions_prompt() -> str
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
  updated_at: string;   // ISO 8601
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
  - Results display (JSON tree view or markdown):

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
- Required field: "[Field] is required"
- Format error: "[Field] must be [format description]"
- Range error: "[Field] must be between X and Y"
- Uniqueness: "[Field] already exists"
- Dependency: "[Field] requires [other field] to be set first"

### 2.2 Real-Time Updates

#### 2.2.1 WebSocket Event System

**Event Categories**:

1. **Agent Events** (prefix: `agent:`):
   - `agent:speaking` - Agent produces speech
   - `agent:thinking` - Agent internal thought
   - `agent:acting` - Agent performs action
   - `agent:moving` - Agent changes location
   - `agent:state_changed` - Agent property updated

2. **World Events** (prefix: `world:`):
   - `world:step_advanced` - Simulation step completed
   - `world:time_changed` - Simulated time updated
   - `world:agent_added` - New agent joins world
   - `world:agent_removed` - Agent leaves world
   - `world:broadcast` - Global message sent

3. **Memory Events** (prefix: `memory:`):
   - `memory:episodic_stored` - New episodic memory
   - `memory:semantic_stored` - New semantic memory
   - `memory:memory_recalled` - Agent retrieves memory

4. **Tool Events** (prefix: `tool:`):
   - `tool:action_executed` - Tool action completed
   - `tool:document_created` - New document
   - `tool:calendar_event_added` - New calendar entry

**WebSocket Message Format**:
```typescript
interface WSMessage {
  event: string;           // Event type (e.g., "agent:speaking")
  timestamp: string;       // ISO 8601
  data: {
    agent_id?: string;     // Relevant agent
    world_id?: string;     // Relevant world
    payload: any;          // Event-specific data
  };
}
```

**UI Update Patterns**:
- Speech bubbles appear/fade on `agent:speaking`
- Thought clouds on `agent:thinking`
- Memory counter increments on `memory:*` events
- Timeline auto-scrolls on new events
- Notification toasts for critical events

#### 2.2.2 Optimistic Updates

**Pattern**: Update UI immediately, rollback on error.

**Implementation**:
```svelte
async function updateAgentProperty(property, value) {
  // 1. Optimistic update
  agent[property] = value;
  
  // 2. Mark as pending
  pendingUpdates.add(property);
  
  try {
    // 3. Persist to backend
    await api.updateAgent(agent.id, { [property]: value });
    
    // 4. Clear pending state
    pendingUpdates.delete(property);
  } catch (error) {
    // 5. Rollback
    agent[property] = originalValue;
    pendingUpdates.delete(property);
    showError(`Failed to update ${property}`);
  }
}
```

**Visual Feedback**:
- Pending updates show loading spinner overlay
- Success: brief green flash animation
- Error: red flash + error message

### 2.3 Data Visualization

#### 2.3.1 Network Graphs

**Library**: D3.js with custom Svelte wrapper

**Features**:
- Force-directed layout with configurable physics
- Zoom/pan with mouse and touch
- Node clustering for large networks (50+ nodes)
- Edge bundling for dense connections
- Minimap for navigation

**Interactions**:
- Hover: Highlight connected nodes
- Click: Select and show details
- Double-click: Center and zoom
- Drag: Reposition (physics continues)

#### 2.3.2 Timeline Visualizations

**Component**: `Timeline.svelte`

**Features**:
- Horizontal scrolling timeline
- Multiple tracks (one per agent)
- Event types as colored blocks
- Zoom levels (minutes, hours, days)
- Playback scrubber synchronized with simulation

**Event Rendering**:
- Speech: Blue blocks with text preview
- Actions: Green blocks with icon
- Thoughts: Gray italics
- Memories: Purple markers

### 2.4 Accessibility

#### 2.4.1 Keyboard Navigation

**Global Shortcuts**:
- `Ctrl/Cmd + K`: Command palette
- `Ctrl/Cmd + /`: Keyboard shortcuts help
- `Esc`: Close modals/drawers
- `Tab`: Focus navigation
- `Arrow keys`: List navigation

**Page-Specific**:
- Grand Stage: `Space` for play/pause
- Agent Form: `Ctrl/Cmd + Enter` to save
- Extraction: `Ctrl/Cmd + E` to run

#### 2.4.2 Screen Reader Support

**Requirements**:
- All interactive elements have labels
- Dynamic content announced via ARIA live regions
- Semantic HTML structure
- Skip navigation links

**ARIA Patterns**:
```svelte
<!-- Live region for real-time updates -->
<div role="status" aria-live="polite" aria-atomic="true">
  {#if latestMessage}
    {latestMessage.agent} says: {latestMessage.content}
  {/if}
</div>

<!-- Landmark navigation -->
<nav role="navigation" aria-label="Main">...</nav>
<main role="main" aria-label="Simulation Stage">...</main>
<aside role="complementary" aria-label="Agent Details">...</aside>
```

---

## 3. Navigation Structure

### 3.1 Primary Navigation

**Three-Surface Model**:

1. **Playwright's Desk** (Creation & Configuration)
   - `/agents` - Agent list and creation
   - `/agents/:id` - Agent detail and editing
   - `/worlds` - World list and configuration
   - `/worlds/:id/settings` - World settings
   - `/tools` - Tool registry and builder

2. **Grand Stage** (Execution & Observation)
   - `/worlds/:id/stage` - Main simulation view
   - `/worlds/:id/timeline` - Historical timeline
   - `/worlds/:id/transcript` - Communication log

3. **Critic's Corner** (Analysis & Insights)
   - `/experiments` - Experiment designer
   - `/experiments/:id` - Experiment results
   - `/extraction` - Extraction studio
   - `/analysis` - Analysis dashboard

### 3.2 Navigation Components

**TopNav.svelte**:
- Logo/Home link (left)
- Surface switcher (center, tab-style)
- User menu (right)
- WebSocket connection status indicator

**SideNav.svelte** (context-sensitive):
- Changes based on current surface
- Collapsible on mobile
- Quick actions at bottom

**Breadcrumbs.svelte**:
- Hierarchical navigation
- Current page highlighted
- Dropdown for siblings

---

## 4. State Management

### 4.1 Store Architecture

**Svelte Stores Structure**:

```typescript
// Core stores
export const currentWorld = writable<World | null>(null);
export const agents = writable<Agent[]>([]);
export const selectedAgent = writable<Agent | null>(null);

// Derived stores
export const agentsByWorld = derived(
  [agents, currentWorld],
  ([$agents, $world]) => $agents.filter(a => a.world_id === $world?.id)
);

// WebSocket store
export const wsConnection = writable<WebSocket | null>(null);
export const wsEvents = writable<WSMessage[]>([]);

// UI stores
export const sidebarOpen = writable(true);
export const activeModal = writable<string | null>(null);
export const notifications = writable<Notification[]>([]);
```

### 4.2 Data Flow

**Patterns**:

1. **REST for CRUD**:
   - GET for initial load
   - POST/PUT for updates
   - DELETE for removal

2. **WebSocket for Events**:
   - Subscribe on component mount
   - Unsubscribe on destroy
   - Update stores from events

3. **Local Storage**:
   - Draft agents/worlds
   - UI preferences
   - Recent searches

**Example Flow**:
```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { agents, wsEvents } from '$lib/stores';
  
  let unsubscribe;
  
  onMount(async () => {
    // Initial load
    const response = await fetch('/api/agents');
    agents.set(await response.json());
    
    // Subscribe to updates
    unsubscribe = wsEvents.subscribe(event => {
      if (event.type === 'agent:state_changed') {
        agents.update(list => 
          list.map(a => a.id === event.data.agent_id 
            ? { ...a, ...event.data.changes }
            : a
          )
        );
      }
    });
  });
  
  onDestroy(() => {
    unsubscribe?.();
  });
</script>
```

---

## 5. Technical Requirements

### 5.1 Performance Targets

**Metrics**:
- Initial load: < 2s (TTI)
- Navigation: < 200ms
- WebSocket latency: < 100ms
- Smooth animations: 60fps
- Bundle size: < 500KB gzipped

**Optimization Strategies**:
- Virtual scrolling for long lists
- Debounced search/filter
- Lazy-loaded modals
- Image/emoji sprites
- Service worker caching

### 5.2 Browser Support

**Required**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Progressive Enhancement**:
- Core functionality without WebSockets
- Fallback for unsupported CSS
- Polyfills for modern JS features

### 5.3 Responsive Design

**Breakpoints**:
- Mobile: 320-767px
- Tablet: 768-1023px
- Desktop: 1024px+

**Mobile Adaptations**:
- Collapsible sidebar
- Bottom sheet modals
- Swipe gestures
- Simplified Grand Stage

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
1. **Core Components**:
   - Layout shell (TopNav, SideNav, main areas)
   - Store setup
   - WebSocket connection manager
   - Basic routing

2. **Agent System**:
   - Agent list view
   - Agent creation form (basic fields only)
   - Agent detail view
   - Simple edit capabilities

### Phase 2: Simulation (Week 3-4)
1. **World Management**:
   - World list and creation
   - World settings panel
   - Agent assignment to worlds

2. **Grand Stage**:
   - Basic stage visualization
   - Play/pause controls
   - Speech bubbles
   - Real-time updates via WebSocket

### Phase 3: Enhancement (Week 5-6)
1. **Advanced Features**:
   - Memory inspector
   - Relationship network
   - Mental faculties configuration
   - Tool system

2. **Analysis Tools**:
   - Extraction studio (basic)
   - Timeline view
   - Transcript drawer

### Phase 4: Polish (Week 7-8)
1. **UX Improvements**:
   - LLM autofill integration
   - Keyboard shortcuts
   - Animations and transitions
   - Error handling

2. **Production Ready**:
   - Performance optimization
   - Accessibility audit
   - Browser testing
   - Documentation

---

## 7. Component Inventory

### 7.1 Core Components (25)

**Layout**:
- `AppShell.svelte` - Main layout container
- `TopNav.svelte` - Top navigation bar
- `SideNav.svelte` - Sidebar navigation
- `Breadcrumbs.svelte` - Breadcrumb navigation
- `PageHeader.svelte` - Page title and actions

**Common**:
- `Button.svelte` - Standard button
- `Input.svelte` - Text input wrapper
- `Select.svelte` - Dropdown selector
- `Modal.svelte` - Modal dialog container
- `Drawer.svelte` - Slide-out panel
- `Card.svelte` - Content card
- `Badge.svelte` - Status/count indicator
- `Tooltip.svelte` - Hover tooltip
- `Loading.svelte` - Loading states
- `EmptyState.svelte` - No data placeholder

**Forms**:
- `Form.svelte` - Form container with validation
- `FieldGroup.svelte` - Form field wrapper
- `TagInput.svelte` - Multi-value tag input
- `RichTextEditor.svelte` - WYSIWYG editor
- `JsonEditor.svelte` - JSON schema editor

**Data Display**:
- `DataTable.svelte` - Sortable data table
- `VirtualList.svelte` - Virtual scrolling list
- `Timeline.svelte` - Timeline visualization
- `NetworkGraph.svelte` - D3 network graph
- `Chart.svelte` - Chart wrapper (Chart.js)

### 7.2 Domain Components (30+)

**Agent**:
- `AgentCard.svelte` - Agent list item
- `AgentFormComprehensive.svelte` - Full agent form
- `AgentDetail.svelte` - Agent profile view
- `AgentActionPanel.svelte` - Agent controls
- `AgentBehaviorLog.svelte` - Action history

**World**:
- `WorldCard.svelte` - World list item
- `WorldConfiguration.svelte` - World settings
- `SimulationControls.svelte` - Playback controls
- `BroadcastPanel.svelte` - Message broadcaster
- `GrandStage.svelte` - Main simulation view

**Memory**:
- `MemoryInspector.svelte` - Memory browser
- `EpisodicMemoryTab.svelte` - Episodic view
- `SemanticMemoryTab.svelte` - Semantic view

**Relationships**:
- `RelationshipNetworkManager.svelte` - Network UI
- `RelationshipEditor.svelte` - Edit relationships

**Tools**:
- `AgentCalendar.svelte` - Calendar view
- `AgentWordProcessor.svelte` - Document editor
- `CustomToolBuilder.svelte` - Tool creator
- `ToolRegistry.svelte` - Tool list

**Extraction**:
- `ExtractionStudio.svelte` - Main extraction UI
- `ResultsExtractorConfig.svelte` - Results config
- `ResultsReducerConfig.svelte` - Reducer config
- `NormalizingExtractorConfig.svelte` - Normalizer
- `GenericArgsExtractorConfig.svelte` - Args extractor

**Experiments**:
- `ExperimentDesigner.svelte` - Experiment wizard
- `ExperimentExecution.svelte` - Running view
- `ExperimentResults.svelte` - Analysis view

**Faculties**:
- `FacultyManager.svelte` - Faculty configuration
- `FacultyCard.svelte` - Faculty list item

---

## 8. API Integration Patterns

### 8.1 REST Endpoints

**Pattern**: RESTful resources with consistent naming

```typescript
// Agent endpoints
GET    /api/agents              // List all agents
POST   /api/agents              // Create agent
GET    /api/agents/:id          // Get agent details
PUT    /api/agents/:id          // Update agent
DELETE /api/agents/:id          // Delete agent

// World endpoints  
GET    /api/worlds              // List worlds
POST   /api/worlds              // Create world
GET    /api/worlds/:id          // Get world details
PUT    /api/worlds/:id          // Update world
DELETE /api/worlds/:id          // Delete world
POST   /api/worlds/:id/run      // Execute simulation steps
POST   /api/worlds/:id/reset    // Reset world state

// Memory endpoints
GET    /api/agents/:id/memories/episodic   // Get episodic memories
GET    /api/agents/:id/memories/semantic   // Get semantic memories
POST   /api/agents/:id/memories/semantic   // Add semantic memory
DELETE /api/agents/:id/memories/:memoryId  // Delete memory

// Relationship endpoints
GET    /api/agents/:id/relationships       // Get relationships
POST   /api/agents/:id/relationships       // Create relationship
PUT    /api/relationships/:id              // Update relationship
DELETE /api/relationships/:id              // Delete relationship
```

### 8.2 Error Handling

**Client-Side Pattern**:

```svelte
<script>
  import { notifications } from '$lib/stores';
  
  async function saveAgent(data) {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save agent');
      }
      
      const agent = await response.json();
      notifications.success('Agent created successfully');
      return agent;
      
    } catch (error) {
      notifications.error(error.message);
      throw error;
    }
  }
</script>
```

**Error Response Format**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Agent name must be unique",
    "field": "name",
    "details": {}
  }
}
```

---

## 9. Conclusion

This specification provides a complete blueprint for building the TinyVerse frontend. Every TinyTroupe capability has been mapped to concrete UI components with detailed implementation guidance.

### Key Success Metrics
- **Coverage**: 100% of TinyTroupe Python methods accessible via UI
- **Usability**: < 5 clicks for common workflows
- **Performance**: < 2s initial load, real-time updates < 100ms
- **Accessibility**: WCAG 2.1 AA compliance

### Next Steps
1. Set up SvelteKit project with component library
2. Implement Phase 1 foundation components
3. Establish WebSocket connection architecture
4. Build first working prototype of agent creation + Grand Stage

---

**Document Version**: 3.0 (Complete)  
**Last Updated**: 2025-01-10  
**Total Components Specified**: 55+  
**Total UI Patterns**: 15  
**Estimated Development Time**: 8 weeks (1-2 developers)
