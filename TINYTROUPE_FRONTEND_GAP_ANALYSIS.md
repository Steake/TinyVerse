# TinyTroupe Frontend Gap Analysis

**Date**: 2025-01-28  
**Purpose**: Comprehensive mapping of TinyTroupe capabilities vs. TinyVerse frontend coverage

---

## Executive Summary

This document maps the 57 Python modules and 40+ classes of TinyTroupe against the current TinyVerse frontend (52 Svelte components across 7 feature areas) to identify missing UI capabilities. The analysis reveals **significant gaps** in exposing TinyTroupe's advanced features through the web interface.

### Key Findings

1. **Adapter Exposure Rate**: ~30% of TinyTroupe capabilities exposed via REST API
2. **Frontend Coverage**: ~40% of exposed capabilities have dedicated UI components
3. **Overall UI Coverage**: ~12% of total TinyTroupe functionality accessible via web interface

### Priority Gaps

1. **Mental Faculties System** - Zero frontend exposure (HIGH PRIORITY)
2. **Tool System** (Calendar, Word Processor, Custom Tools) - No UI management (HIGH)
3. **Memory Management** (Episodic/Semantic) - No inspection/control (HIGH)
4. **Experimentation Framework** (A/B testing, propositions) - Completely missing (MEDIUM)
5. **Extraction & Enrichment** - No result processors or content stylers (MEDIUM)

---

## Part 1: TinyTroupe Capability Matrix

### 1.1 Core Agent System (`tinytroupe/agent/`)

| Module | Classes | Key Capabilities | Adapter Exposed? | Frontend Coverage |
|--------|---------|------------------|------------------|-------------------|
| `tiny_person.py` (1764 lines) | `TinyPerson` | • Agent creation with persona config<br>• Episodic/semantic memory<br>• Action generation with quality checks<br>• Stimulus observation (listen, see, think, socialize)<br>• Mental faculties integration<br>• Relationships management<br>• Accessible agents control<br>• Document reading (files/web)<br>• Location/context management<br>• Cognitive state tracking (goals, emotions, attention) | ✅ Partial (persona, relationships) | 🟡 Partial<br>• `AgentForm` - basic persona<br>• `RelationshipNetwork` - relationships<br>**Missing**: faculties, memory, cognitive state, document loading |
| `action_generator.py` | `ActionGenerator` | • LLM-driven action generation<br>• Quality checking/validation<br>• Action templates<br>• Retry logic | ❌ Internal only | ❌ No UI |
| `memory.py` | `TinyMemory`, `EpisodicMemory`, `SemanticMemory` | • Episodic memory storage/retrieval<br>• Semantic memory with RAG<br>• Memory consolidation<br>• Retrieval strategies | ❌ No exposure | ❌ No UI |
| `mental_faculty.py` | `TinyMentalFaculty`, `CustomMentalFaculty`, `RecallFaculty`, `FilesAndWebGroundingFaculty`, `TinyToolUse` | • Cognitive capabilities framework<br>• Tool usage abilities<br>• Grounding (files/web knowledge)<br>• Recall mechanisms<br>• Custom faculty definitions | ❌ No exposure | ❌ No UI<br>**Note**: `MindPalace.svelte` exists but unused! |
| `grounding.py` | `GroundingConnector`, `LocalFilesGroundingConnector`, `WebPagesGroundingConnector` | • External knowledge integration<br>• RAG from local files<br>• Web page scraping | ❌ No exposure | ❌ No UI |

### 1.2 Environment System (`tinytroupe/environment/`)

| Module | Classes | Key Capabilities | Adapter Exposed? | Frontend Coverage |
|--------|---------|------------------|------------------|-------------------|
| `tiny_world.py` (882 lines) | `TinyWorld` | • Agent collection management<br>• Datetime simulation (current_datetime)<br>• Broadcast messaging<br>• Intervention system<br>• Parallel execution support<br>• Communications buffer<br>• Step-based simulation | ✅ Partial (add/remove agents, run) | 🟡 Partial<br>• `WorldBuilder` - location/connection setup<br>• `GrandStage` - visualization<br>**Missing**: datetime control, interventions, parallel config |
| `social_network.py` | `TinySocialNetwork` | • Graph-based relationships<br>• Network analysis<br>• Relationship queries | ❌ No exposure | ❌ No UI |

### 1.3 Tools System (`tinytroupe/tools/`)

| Module | Classes | Key Capabilities | Adapter Exposed? | Frontend Coverage |
|--------|---------|------------------|------------------|-------------------|
| `tiny_tool.py` | `TinyTool` | • Tool base class<br>• Ownership enforcement<br>• Real-world side-effect protection<br>• Action processing framework | ❌ No exposure | ❌ No UI |
| `tiny_calendar.py` | `TinyCalendar` | • Event scheduling<br>• Availability tracking<br>• Time-based actions | ❌ No exposure | ❌ No UI |
| `tiny_word_processor.py` | `TinyWordProcessor` | • Document creation<br>• Text editing<br>• Content formatting | ❌ No exposure | ❌ No UI |

### 1.4 Experimentation Framework (`tinytroupe/experimentation/`)

| Module | Classes | Key Capabilities | Adapter Exposed? | Frontend Coverage |
|--------|---------|------------------|------------------|-------------------|
| `proposition.py` | `Proposition` | • Hypothesis definition<br>• Validation logic | ❌ No exposure | ❌ No UI |
| `statistical_tests.py` | `StatisticalTester` | • A/B testing<br>• Statistical significance<br>• Hypothesis testing | ❌ No exposure | ❌ No UI |
| `randomization.py` | `ABRandomizer` | • Controlled randomization<br>• A/B group assignment | ❌ No exposure | ❌ No UI |
| `in_place_experiment_runner.py` | `InPlaceExperimentRunner` | • Experiment orchestration<br>• Result collection | ❌ No exposure | ❌ No UI |

### 1.5 Extraction & Enrichment Systems

| Module | Classes | Key Capabilities | Adapter Exposed? | Frontend Coverage |
|--------|---------|------------------|------------------|-------------------|
| `extraction/results_extractor.py` | `ResultsExtractor` | • Artifact extraction<br>• Structured data mining | ❌ No exposure | 🟡 Stub<br>• `ResultsExtractor.svelte` exists but minimal |
| `extraction/artifact_exporter.py` | `ArtifactExporter` | • Export to JSON/CSV/etc.<br>• Report generation | ❌ No exposure | ❌ No UI |
| `enrichment/tiny_enricher.py` | `TinyEnricher` | • Content enhancement<br>• LLM-based enrichment | ❌ No exposure | ❌ No UI |
| `enrichment/tiny_styler.py` | `TinyStyler` | • Content styling<br>• Format conversion | ❌ No exposure | ❌ No UI |

### 1.6 Control & Utilities

| Module | Classes | Key Capabilities | Adapter Exposed? | Frontend Coverage |
|--------|---------|------------------|------------------|-------------------|
| `control.py` | `Simulation`, `Transaction` | • Transactional state management<br>• Checkpoint/rollback<br>• Simulation scoping | ❌ Internal only | ❌ No UI |
| `validation/` | Multiple | • Input validation<br>• Constraint checking | ❌ No exposure | ❌ No UI |
| `steering/` | Multiple | • Behavior control<br>• Response steering | ❌ No exposure | ❌ No UI |

---

## Part 2: Adapter Exposure Analysis

### 2.1 What `tinytroupe_adapter.py` Exposes

**Exposed Capabilities** (via REST API):

1. **Agent CRUD**
   - Create with basic persona (name, age, occupation, nationality, residence)
   - Personality traits, interests, backstory
   - Update basic fields
   - Delete agents
   - List all agents

2. **Relationships**
   - Add relationship to agent
   - Remove relationship
   - Store in metadata (not TinyPerson native)

3. **Location Management**
   - CRUD operations
   - Store in adapter registry (not TinyWorld native)

4. **World Simulation**
   - Run simulation (N steps)
   - Get simulation state
   - Pause simulation
   - Access communications buffer as logs

5. **Connections**
   - Create/list/delete location connections

**NOT Exposed** (missing from adapter):

1. ❌ Mental faculties (add, configure, list)
2. ❌ Tools (calendar, word processor, custom tools)
3. ❌ Memory operations (episodic retrieval, semantic queries, consolidation)
4. ❌ Cognitive state inspection (goals, emotions, attention, context)
5. ❌ Document reading (files, web URLs)
6. ❌ Agent accessible control (make_agent_accessible, make_agent_inaccessible)
7. ❌ Stimulus injection (listen, see, think, socialize via adapter methods)
8. ❌ Experimentation framework (propositions, A/B testing)
9. ❌ Extraction tools (artifact export, results extraction)
10. ❌ Enrichment (content styling, enhancement)
11. ❌ Datetime control (TinyWorld.current_datetime)
12. ❌ Interventions (manual simulation interruptions)
13. ❌ Social network analysis
14. ❌ Transaction control (checkpoints, rollbacks)
15. ❌ Action quality parameters (similarity thresholds, repetition prevention)

### 2.2 API Endpoint Inventory

**Current Endpoints** (from backend/app/api/):

```
Agents:
  POST   /agents                    - Create agent
  GET    /agents                    - List agents
  GET    /agents/{id}               - Get agent
  PATCH  /agents/{id}               - Update agent
  DELETE /agents/{id}               - Delete agent
  POST   /agents/import             - Bulk import
  GET    /agents/export             - Bulk export
  POST   /agents/{id}/relationships - Add relationship
  DELETE /agents/{id}/relationships/{target_id} - Remove relationship

Simulation:
  POST   /simulation/control        - Start/pause/reset
  GET    /simulation/state          - Get state
  GET    /simulation/logs           - Get logs
  POST   /simulation/action         - Manual action injection

World:
  GET    /world/locations           - List locations
  POST   /world/locations           - Create location
  PATCH  /world/locations/{id}      - Update location
  DELETE /world/locations/{id}      - Delete location
  GET    /world/connections         - List connections
  POST   /world/connections         - Create connection
  DELETE /world/connections/{id}    - Delete connection

Config:
  GET    /config                    - Get config
  PATCH  /config                    - Update config

WebSocket:
  WS     /ws                        - Real-time updates
```

**Missing Endpoints** (needed for full TinyTroupe access):

```
Mental Faculties:
  POST   /agents/{id}/faculties                - Add faculty
  GET    /agents/{id}/faculties                - List faculties
  DELETE /agents/{id}/faculties/{faculty_id}   - Remove faculty
  PATCH  /agents/{id}/faculties/{faculty_id}   - Configure faculty

Tools:
  POST   /agents/{id}/tools                    - Assign tool
  GET    /agents/{id}/tools                    - List tools
  POST   /tools                                - Create custom tool
  GET    /tools                                - List available tools
  DELETE /agents/{id}/tools/{tool_id}          - Remove tool

Memory:
  GET    /agents/{id}/memory/episodic          - Retrieve episodic memories
  GET    /agents/{id}/memory/semantic          - Query semantic memory
  POST   /agents/{id}/memory/documents         - Load documents
  POST   /agents/{id}/memory/consolidate       - Trigger consolidation
  GET    /agents/{id}/cognitive-state          - Get goals/emotions/attention

Experimentation:
  POST   /experiments                          - Create experiment
  GET    /experiments                          - List experiments
  POST   /experiments/{id}/run                 - Run experiment
  GET    /experiments/{id}/results             - Get results
  POST   /propositions                         - Define proposition

Extraction:
  POST   /simulation/extract                   - Extract artifacts
  POST   /simulation/export                    - Export results
  GET    /simulation/artifacts                 - List available artifacts

World Control:
  PATCH  /world/datetime                       - Set simulation datetime
  POST   /world/interventions                  - Manual intervention
  GET    /world/social-network                 - Get relationship graph
```

---

## Part 3: Frontend Component Inventory

### 3.1 Component Mapping by Feature Area

#### 3.1.1 Casting Call (Agent Creation)

**Components**: 11 files
- `CastingCall.svelte` (root view)
- `casting-call/AgentCard.svelte` - Agent display card
- `casting-call/AgentForm.svelte` - Agent creation form
- `casting-call/AgentGroupAssignment.svelte` - Group assignment UI
- `casting-call/AgentGroupContainer.svelte` - Group container
- `casting-call/AgentList.svelte` - Agent listing
- `casting-call/GroupContainer.svelte` - Group display
- `casting-call/GroupCreationControl.svelte` - Create groups
- `casting-call/GroupHeader.svelte` - Group header UI
- `casting-call/GroupManager.svelte` - Group management
- `casting-call/GroupSelector.svelte` - Group selection

**TinyTroupe Mapping**:
- ✅ Basic agent creation (TinyPerson name, age, occupation)
- ✅ Personality traits
- ✅ Interests (professional, personal)
- ✅ Backstory
- ❌ Mental faculties assignment
- ❌ Tool assignment
- ❌ Document loading
- ❌ Cognitive state initialization
- ❌ Memory configuration

#### 3.1.2 Playwright (Scenario Setup)

**Components**: 20 files
- `WorldBuilder.svelte` - Location/connection setup
- `RelationshipNetwork.svelte` - Relationship management
- `MindPalace.svelte` - **UNUSED! Mental faculty UI**
- `StoryManager.svelte` - Story/scenario management
- `world-builder/LocationEditModal.svelte`
- `world-builder/LocationPalette.svelte`
- `world-builder/ConnectionEditModal.svelte`
- `world-builder/LocationContextMenu.svelte`
- `relationship-network/AgentSelector.svelte`
- `relationship-network/NodeTooltip.svelte`
- `relationship-network/RelationshipEditModal.svelte`
- `mind-palace/FacultyAssignment.svelte` - **UNUSED!**
- `mind-palace/FacultyCard.svelte` - **UNUSED!**

**TinyTroupe Mapping**:
- ✅ Locations (but adapter stores separately from TinyWorld)
- ✅ Relationships
- ❌ Mental faculties (UI exists but not connected!)
- ❌ TinyWorld datetime setup
- ❌ Intervention planning
- ❌ Experiment design

#### 3.1.3 Grand Stage (Simulation Visualization)

**Components**: 10 files
- `GrandStage.svelte` - Main stage view
- `SimulationControls.svelte` - Start/pause/reset
- `StageBackground.svelte` - Background rendering
- `StageControls.svelte` - Control panel
- `TimeDisplay.svelte` - Time display
- `agents/AgentAvatar.svelte` - Agent visualization
- `agents/AgentNode.svelte` - Agent node in graph
- `agents/AgentTooltip.svelte` - Agent hover info
- `environment/TimeBasedBackground.svelte` - Dynamic background
- `speech/SpeechBubble.svelte` - Agent communication display
- `tools/ToolAnimation.svelte` - Tool usage animation

**TinyTroupe Mapping**:
- ✅ Start/pause simulation (via run_simulation)
- ✅ Log display (from communications buffer)
- ✅ Agent positions (frontend-managed, not TinyWorld)
- ❌ Datetime control (no TinyWorld.current_datetime manipulation)
- ❌ Intervention injection during runtime
- ❌ Cognitive state visualization (goals, emotions)
- ❌ Memory inspection (episodic/semantic)
- ❌ Tool usage tracking

#### 3.1.4 Critics Corner (Analysis & Results)

**Components**: 4 files
- `CriticsCorner.svelte` - Root analysis view
- `DataVisualizer.svelte` - Data visualization
- `ResultsExtractor.svelte` - **Stub implementation**
- `StoryGenerator.svelte` - Story generation

**TinyTroupe Mapping**:
- 🟡 Results extraction (stub only)
- ❌ Experimentation results
- ❌ Statistical testing
- ❌ Proposition validation
- ❌ Artifact export
- ❌ Enrichment/styling

#### 3.1.5 Common Components

**Components**: 9 files
- `Badge.svelte`, `Modal.svelte`, `Tooltip.svelte`
- `BaseModal.svelte`
- `ExportDialog.svelte`
- `RichTextEditor.svelte`
- `ToastContainer.svelte`
- `UniversalToolbar.svelte`

**TinyTroupe Mapping**: Generic UI utilities, no direct mapping

#### 3.1.6 Layout

**Components**: 1 file
- `Sidebar.svelte` - Navigation

### 3.2 Unused/Incomplete Components

**Critical Finding**: Several components exist but are **disconnected from backend**:

1. **`MindPalace.svelte`** + `mind-palace/FacultyAssignment.svelte` + `FacultyCard.svelte`
   - Purpose: Mental faculty management
   - Status: **Component exists but no API endpoints!**
   - Impact: Mental faculties (core TinyTroupe feature) completely inaccessible

2. **`ResultsExtractor.svelte`**
   - Purpose: Artifact extraction
   - Status: Stub implementation
   - Impact: No access to TinyTroupe's extraction framework

3. **`ToolAnimation.svelte`**
   - Purpose: Tool usage visualization
   - Status: Exists but no tool system exposed
   - Impact: Calendar/WordProcessor/custom tools invisible

---

## Part 4: Critical Gap Analysis

### 4.1 HIGH PRIORITY GAPS

#### Gap 1: Mental Faculties System (CRITICAL)

**TinyTroupe Capability**:
```python
# Add mental faculties to agent
agent.add_mental_faculty(RecallFaculty())
agent.add_mental_faculty(FilesAndWebGroundingFaculty())
agent.add_mental_faculty(TinyToolUse(tools=[calendar, word_processor]))
```

**Current State**:
- ❌ No adapter methods for faculty management
- ❌ No API endpoints
- ✅ Frontend components exist (`MindPalace.svelte`) but unused!

**Impact**:
- Agents cannot use tools (Calendar, WordProcessor)
- No external knowledge grounding (files/web)
- No recall mechanisms
- Custom cognitive capabilities impossible

**Recommendation**: **IMMEDIATE FIX**
1. Extend adapter with faculty CRUD methods
2. Create `/agents/{id}/faculties` endpoints
3. Connect existing `MindPalace` UI to backend
4. Expose built-in faculties (RecallFaculty, FilesAndWebGroundingFaculty, TinyToolUse)

---

#### Gap 2: Tool System (HIGH)

**TinyTroupe Capability**:
```python
# Create tools
calendar = TinyCalendar(owner=agent)
word_processor = TinyWordProcessor(owner=agent, exporter=exporter)

# Assign via mental faculty
agent.add_mental_faculty(TinyToolUse(tools=[calendar, word_processor]))
```

**Current State**:
- ❌ No tool CRUD in adapter
- ❌ No tool API endpoints
- 🟡 `ToolAnimation.svelte` exists but disconnected

**Impact**:
- No calendar scheduling
- No document creation
- No custom tool development
- Agents cannot perform complex tasks requiring tools

**Recommendation**: **HIGH PRIORITY**
1. Expose TinyCalendar and TinyWordProcessor in adapter
2. Create `/tools` and `/agents/{id}/tools` endpoints
3. Build tool creation/assignment UI
4. Connect `ToolAnimation` to tool usage logs

---

#### Gap 3: Memory Management (HIGH)

**TinyTroupe Capability**:
```python
# Episodic memory
agent.episodic_memory.retrieve(query="What did I do yesterday?")
agent.consolidate_episode_memories()

# Semantic memory
agent.semantic_memory.add_documents_path("/path/to/docs")
agent.semantic_memory.query("What is the product roadmap?")
```

**Current State**:
- ❌ No memory inspection API
- ❌ No memory management UI
- ❌ No document loading interface

**Impact**:
- Cannot see what agents remember
- Cannot load external knowledge
- Cannot trigger memory consolidation
- Cannot debug agent behavior based on memory state

**Recommendation**: **HIGH PRIORITY**
1. Add `/agents/{id}/memory/episodic` GET endpoint
2. Add `/agents/{id}/memory/semantic` query endpoint
3. Add `/agents/{id}/memory/documents` POST endpoint
4. Build memory inspector component
5. Add document upload UI

---

### 4.2 MEDIUM PRIORITY GAPS

#### Gap 4: Cognitive State Inspection

**TinyTroupe Capability**:
```python
# Access internal state
agent._mental_state["goals"]        # Current goals
agent._mental_state["emotions"]     # Emotional state
agent._mental_state["attention"]    # Focus of attention
agent._mental_state["context"]      # Situation context
```

**Current State**:
- ❌ No cognitive state API
- ❌ No visualization of goals/emotions/attention

**Impact**:
- Cannot see why agents make decisions
- Cannot debug goal-driven behavior
- No emotional intelligence visibility

**Recommendation**: **MEDIUM PRIORITY**
1. Add `/agents/{id}/cognitive-state` endpoint
2. Enhance `AgentTooltip` with cognitive state display
3. Add real-time cognitive state panel in GrandStage

---

#### Gap 5: Experimentation Framework

**TinyTroupe Capability**:
```python
# Define proposition
prop = Proposition(
    description="Agents prefer Feature A over Feature B",
    validation_func=lambda data: statistical_test(data, alpha=0.05)
)

# Run A/B test
randomizer = ABRandomizer()
runner = InPlaceExperimentRunner()
results = runner.run_experiment(world, prop, randomizer)
```

**Current State**:
- ❌ No experimentation API
- ❌ No proposition/test UI

**Impact**:
- Cannot run controlled experiments
- No A/B testing of scenarios
- No statistical validation of hypotheses

**Recommendation**: **MEDIUM PRIORITY**
1. Add `/experiments` endpoints
2. Create experiment designer UI in Critics Corner
3. Expose statistical testing results

---

#### Gap 6: Extraction & Enrichment

**TinyTroupe Capability**:
```python
# Extract artifacts
extractor = ResultsExtractor()
artifacts = extractor.extract_results(world, goals=["product feedback"])

# Enrich content
enricher = TinyEnricher()
styled_content = enricher.enrich(text, style="marketing")
```

**Current State**:
- 🟡 `ResultsExtractor.svelte` exists but stub only
- ❌ No enrichment API

**Impact**:
- Manual artifact extraction required
- No structured data mining
- No LLM-based content enhancement

**Recommendation**: **MEDIUM PRIORITY**
1. Expose extraction framework in adapter
2. Complete `ResultsExtractor` component
3. Add enrichment/styling API

---

### 4.3 LOW PRIORITY GAPS

#### Gap 7: Advanced World Control

**TinyTroupe Capability**:
```python
# Datetime control
world.current_datetime = datetime(2024, 1, 15, 9, 0)

# Interventions
world.broadcast("Emergency announcement: Office closes at 3pm")
```

**Current State**:
- ❌ No datetime manipulation UI
- ❌ No intervention API

**Recommendation**: **LOW PRIORITY**
- Add datetime picker in WorldBuilder
- Add intervention injection in GrandStage

---

#### Gap 8: Social Network Analysis

**TinyTroupe Capability**:
```python
network = TinySocialNetwork(agents)
network.get_shortest_path(agent_a, agent_b)
network.get_centrality_scores()
```

**Current State**:
- ❌ Not exposed

**Recommendation**: **LOW PRIORITY**
- Add social network analysis to Critics Corner

---

#### Gap 9: Transaction Control

**TinyTroupe Capability**:
```python
# Checkpoint/rollback
sim = Simulation()
sim.begin_checkpoint("experiment_1")
# ... run simulation ...
sim.rollback_to("experiment_1")
```

**Current State**:
- ❌ Not exposed

**Recommendation**: **LOW PRIORITY**
- Add checkpoint/rollback controls to SimulationControls

---

## Part 5: Implementation Roadmap

### Phase 1: Mental Faculties & Tools (Weeks 1-2)

**Goal**: Enable agents to use tools and cognitive capabilities

**Tasks**:
1. Extend `tinytroupe_adapter.py`:
   ```python
   def add_mental_faculty(self, agent_id: str, faculty_type: str, config: dict) -> dict
   def remove_mental_faculty(self, agent_id: str, faculty_id: str) -> bool
   def list_mental_faculties(self, agent_id: str) -> List[dict]
   def assign_tool(self, agent_id: str, tool_type: str, config: dict) -> dict
   def list_tools(self, agent_id: str) -> List[dict]
   ```

2. Add API endpoints:
   ```
   POST   /agents/{id}/faculties
   GET    /agents/{id}/faculties
   DELETE /agents/{id}/faculties/{faculty_id}
   POST   /agents/{id}/tools
   GET    /agents/{id}/tools
   DELETE /agents/{id}/tools/{tool_id}
   ```

3. Connect `MindPalace.svelte` to backend:
   - Faculty selection dropdown (RecallFaculty, FilesAndWebGroundingFaculty, TinyToolUse)
   - Tool assignment UI (TinyCalendar, TinyWordProcessor)
   - Configuration forms for each faculty type

4. Update `AgentForm.svelte` to include faculty/tool selection

5. Enhance `ToolAnimation.svelte` to show tool usage from logs

**Deliverables**:
- Agents can be assigned mental faculties via UI
- Calendar and word processor tools functional
- Tool usage visible in simulation logs

---

### Phase 2: Memory Management (Weeks 3-4)

**Goal**: Expose memory inspection and document loading

**Tasks**:
1. Extend `tinytroupe_adapter.py`:
   ```python
   def get_episodic_memories(self, agent_id: str, limit: int = 50) -> List[dict]
   def query_semantic_memory(self, agent_id: str, query: str) -> List[dict]
   def load_documents(self, agent_id: str, paths: List[str]) -> dict
   def consolidate_memories(self, agent_id: str) -> dict
   ```

2. Add API endpoints:
   ```
   GET  /agents/{id}/memory/episodic?limit=50
   GET  /agents/{id}/memory/semantic?query=...
   POST /agents/{id}/memory/documents
   POST /agents/{id}/memory/consolidate
   ```

3. Create `MemoryInspector.svelte` component:
   - Episodic memory timeline
   - Semantic memory search
   - Document upload interface

4. Add to Critics Corner or new "Memory Palace" section

**Deliverables**:
- View agent episodic memories
- Query semantic knowledge
- Upload documents for agent grounding
- Trigger memory consolidation

---

### Phase 3: Cognitive State & Experimentation (Weeks 5-6)

**Goal**: Enable debugging and A/B testing

**Tasks**:
1. Cognitive State API:
   ```python
   def get_cognitive_state(self, agent_id: str) -> dict:
       # Returns goals, emotions, attention, context
   ```

2. Enhance `AgentTooltip.svelte` with:
   - Current goals display
   - Emotional state indicator
   - Attention focus
   - Context description

3. Add cognitive state panel to `GrandStage.svelte`

4. Experimentation endpoints:
   ```
   POST /experiments
   GET  /experiments
   POST /experiments/{id}/run
   GET  /experiments/{id}/results
   ```

5. Create `ExperimentDesigner.svelte` in Critics Corner

**Deliverables**:
- Real-time cognitive state monitoring
- A/B testing framework accessible via UI
- Statistical test results visualization

---

### Phase 4: Extraction & Advanced Features (Weeks 7-8)

**Goal**: Complete extraction/enrichment and advanced world control

**Tasks**:
1. Complete `ResultsExtractor.svelte`:
   - Connect to extraction API
   - Artifact browsing
   - Export functionality

2. Add extraction endpoints:
   ```
   POST /simulation/extract
   GET  /simulation/artifacts
   POST /simulation/export
   ```

3. Add datetime control to `WorldBuilder.svelte`

4. Add intervention UI to `SimulationControls.svelte`

**Deliverables**:
- Structured artifact extraction
- Datetime simulation control
- Manual intervention capability

---

## Part 6: Prioritized Feature List

### Must-Have (for v1.0)

1. ✅ Mental faculties assignment (RecallFaculty, FilesAndWebGroundingFaculty, TinyToolUse)
2. ✅ Tool system (TinyCalendar, TinyWordProcessor)
3. ✅ Memory inspection (episodic retrieval, semantic queries)
4. ✅ Document loading (files, web URLs)
5. ✅ Cognitive state display (goals, emotions, attention)

### Should-Have (for v1.5)

6. Experimentation framework (propositions, A/B tests)
7. Artifact extraction (complete ResultsExtractor)
8. Datetime control (TinyWorld.current_datetime)
9. Interventions (broadcast messages)
10. Memory consolidation triggers

### Nice-to-Have (for v2.0)

11. Social network analysis
12. Transaction control (checkpoints, rollbacks)
13. Content enrichment/styling
14. Custom tool creation UI
15. Advanced validation/steering

---

## Part 7: Code Examples for Implementation

### Example 1: Adding Mental Faculty Support to Adapter

```python
# backend/app/services/tinytroupe_adapter.py

from tinytroupe.agent.mental_faculty import (
    RecallFaculty, 
    FilesAndWebGroundingFaculty, 
    TinyToolUse
)
from tinytroupe.tools.tiny_calendar import TinyCalendar
from tinytroupe.tools.tiny_word_processor import TinyWordProcessor

class TinyTroupeAdapter:
    def __init__(self):
        # ... existing init ...
        self.faculties: Dict[str, Dict[str, Any]] = {}  # {faculty_id: {type, config, agent_id}}
        self.tools: Dict[str, Any] = {}  # {tool_id: TinyTool instance}
    
    def add_mental_faculty(self, agent_id: str, faculty_type: str, config: dict) -> dict:
        """Add a mental faculty to an agent."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not found")
        
        person = self.agents[agent_id]
        faculty_id = str(uuid.uuid4())
        
        # Create faculty based on type
        if faculty_type == "recall":
            faculty = RecallFaculty()
        elif faculty_type == "grounding":
            faculty = FilesAndWebGroundingFaculty()
        elif faculty_type == "tool_use":
            # Tools must be assigned separately first
            tool_ids = config.get("tool_ids", [])
            tools = [self.tools[tid] for tid in tool_ids if tid in self.tools]
            faculty = TinyToolUse(tools=tools)
        else:
            raise ValueError(f"Unknown faculty type: {faculty_type}")
        
        person.add_mental_faculty(faculty)
        
        self.faculties[faculty_id] = {
            "id": faculty_id,
            "agent_id": agent_id,
            "type": faculty_type,
            "config": config,
            "created_at": datetime.now(timezone.utc)
        }
        
        return self.faculties[faculty_id]
    
    def assign_tool(self, agent_id: str, tool_type: str, config: dict) -> dict:
        """Create and assign a tool to an agent."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not found")
        
        person = self.agents[agent_id]
        tool_id = str(uuid.uuid4())
        
        # Create tool based on type
        if tool_type == "calendar":
            tool = TinyCalendar(owner=person)
        elif tool_type == "word_processor":
            tool = TinyWordProcessor(owner=person)
        else:
            raise ValueError(f"Unknown tool type: {tool_type}")
        
        self.tools[tool_id] = tool
        
        return {
            "id": tool_id,
            "agent_id": agent_id,
            "type": tool_type,
            "name": tool.name,
            "description": tool.description
        }
```

### Example 2: Memory Inspection API

```python
# backend/app/services/tinytroupe_adapter.py

def get_episodic_memories(self, agent_id: str, limit: int = 50) -> List[dict]:
    """Retrieve recent episodic memories from an agent."""
    if agent_id not in self.agents:
        raise ValueError(f"Agent {agent_id} not found")
    
    person = self.agents[agent_id]
    memories = person.episodic_memory.retrieve_all()[-limit:]
    
    return [
        {
            "role": mem.get("role"),
            "content": str(mem.get("content"))[:500],  # Truncate for API
            "timestamp": mem.get("simulation_timestamp"),
            "type": mem.get("type")
        }
        for mem in memories
    ]

def query_semantic_memory(self, agent_id: str, query: str, top_k: int = 5) -> List[dict]:
    """Query an agent's semantic memory."""
    if agent_id not in self.agents:
        raise ValueError(f"Agent {agent_id} not found")
    
    person = self.agents[agent_id]
    results = person.semantic_memory.query(query, top_k=top_k)
    
    return [
        {
            "document": result.get("document"),
            "score": result.get("score"),
            "metadata": result.get("metadata")
        }
        for result in results
    ]

def load_documents(self, agent_id: str, paths: List[str], web_urls: List[str] = None) -> dict:
    """Load documents into an agent's semantic memory."""
    if agent_id not in self.agents:
        raise ValueError(f"Agent {agent_id} not found")
    
    person = self.agents[agent_id]
    
    loaded_count = 0
    for path in paths:
        person.read_document_from_file(path)
        loaded_count += 1
    
    if web_urls:
        for url in web_urls:
            person.read_document_from_web(url)
            loaded_count += 1
    
    return {
        "agent_id": agent_id,
        "documents_loaded": loaded_count
    }
```

### Example 3: Mental Faculty UI Component

```svelte
<!-- src/lib/components/playwright/mind-palace/FacultyAssignment.svelte -->
<script lang="ts">
  import { agentStore } from '$lib/stores/agentStore';
  import { apiClient } from '$lib/api/client';
  
  export let agentId: string;
  
  let selectedFacultyType = 'recall';
  let availableTools = [];
  let selectedTools = [];
  
  const facultyTypes = [
    { value: 'recall', label: 'Recall Faculty', description: 'Enables memory retrieval' },
    { value: 'grounding', label: 'Grounding Faculty', description: 'External knowledge from files/web' },
    { value: 'tool_use', label: 'Tool Use', description: 'Use tools like calendar and word processor' }
  ];
  
  async function addFaculty() {
    const config = selectedFacultyType === 'tool_use' 
      ? { tool_ids: selectedTools }
      : {};
    
    await apiClient.post(`/agents/${agentId}/faculties`, {
      faculty_type: selectedFacultyType,
      config
    });
    
    // Refresh agent data
    agentStore.fetchAgent(agentId);
  }
  
  async function loadAvailableTools() {
    const response = await apiClient.get(`/agents/${agentId}/tools`);
    availableTools = response.data;
  }
  
  $: if (selectedFacultyType === 'tool_use') {
    loadAvailableTools();
  }
</script>

<div class="faculty-assignment">
  <h3>Assign Mental Faculty</h3>
  
  <select bind:value={selectedFacultyType}>
    {#each facultyTypes as ft}
      <option value={ft.value}>{ft.label}</option>
    {/each}
  </select>
  
  {#if selectedFacultyType === 'tool_use'}
    <div class="tool-selection">
      <h4>Select Tools</h4>
      {#each availableTools as tool}
        <label>
          <input type="checkbox" value={tool.id} bind:group={selectedTools} />
          {tool.name} - {tool.description}
        </label>
      {/each}
    </div>
  {/if}
  
  <button on:click={addFaculty}>Add Faculty</button>
</div>
```

---

## Part 8: Conclusion

### Summary of Findings

TinyVerse currently exposes **~12% of TinyTroupe's total functionality** through the web interface:

- **57 TinyTroupe modules** → **~30% exposed in adapter** → **~40% of exposed have UI** = **~12% total coverage**

### Critical Missing Features

1. **Mental Faculties** - Most impactful, UI exists but disconnected
2. **Tool System** - No calendar, word processor, or custom tools
3. **Memory Management** - Cannot inspect or control memory
4. **Experimentation** - No A/B testing or propositions
5. **Cognitive State** - Cannot see agent goals, emotions, attention

### Next Steps

**Immediate Actions** (Week 1):
1. Connect existing `MindPalace.svelte` to backend
2. Add `/agents/{id}/faculties` endpoints
3. Expose RecallFaculty, FilesAndWebGroundingFaculty, TinyToolUse

**Short-term Goals** (Weeks 2-4):
4. Implement tool system (Calendar, WordProcessor)
5. Add memory inspection APIs
6. Build memory inspector component

**Medium-term Goals** (Weeks 5-8):
7. Cognitive state monitoring
8. Experimentation framework
9. Complete artifact extraction

### Estimated Effort

- **Phase 1** (Mental Faculties & Tools): 2 weeks, 1 developer
- **Phase 2** (Memory Management): 2 weeks, 1 developer  
- **Phase 3** (Cognitive State & Experiments): 2 weeks, 1 developer
- **Phase 4** (Extraction & Advanced): 2 weeks, 1 developer

**Total**: 8 weeks for 80% coverage of critical TinyTroupe features

---

## Appendix A: TinyTroupe Module Reference

### Complete Module List (57 files)

```
tinytroupe/
├── agent/
│   ├── tiny_person.py (1764 lines) - Core agent class
│   ├── action_generator.py - LLM action generation
│   ├── memory.py - Episodic/semantic memory
│   ├── mental_faculty.py - Cognitive capabilities
│   └── grounding.py - External knowledge integration
├── environment/
│   ├── tiny_world.py (882 lines) - Simulation environment
│   └── social_network.py - Relationship graphs
├── tools/
│   ├── tiny_tool.py - Tool base class
│   ├── tiny_calendar.py - Calendar/scheduling
│   └── tiny_word_processor.py - Document creation
├── experimentation/
│   ├── proposition.py - Hypothesis definition
│   ├── statistical_tests.py - A/B testing
│   ├── randomization.py - Group assignment
│   └── in_place_experiment_runner.py - Experiment orchestration
├── extraction/
│   ├── results_extractor.py - Artifact extraction
│   ├── artifact_exporter.py - Export functionality
│   ├── results_reporter.py - Report generation
│   ├── normalizer.py - Data normalization
│   └── results_reducer.py - Data aggregation
├── enrichment/
│   ├── tiny_enricher.py - Content enhancement
│   └── tiny_styler.py - Content styling
├── control.py - Simulation/transaction control
├── validation/ - Input validation
├── steering/ - Behavior control
├── profiling/ - Performance profiling
├── factory/ - Agent factories
├── ui/ - (Internal UI utilities)
└── utils/ - Utilities
```

### Key TinyPerson Methods

```python
# Stimulus observation
agent.listen(speech, source=other_agent)
agent.see(visual_description)
agent.think(thought)
agent.socialize(social_description)
agent.internalize_goal(goal)

# Action generation
agent.act(until_done=True, n=5, return_actions=True)
agent.listen_and_act(speech)
agent.think_and_act(thought)

# Memory
agent.episodic_memory.retrieve(query)
agent.semantic_memory.add_documents_path(path)
agent.consolidate_episode_memories()

# Mental faculties
agent.add_mental_faculty(faculty)
agent.add_mental_faculties([faculty1, faculty2])

# Relationships
agent.related_to(other_agent, "my colleague", symmetric_description="my colleague")
agent.clear_relationships()

# Persona definition
agent.define(key, value)
agent.define_relationships(relationships)
agent.import_fragment(path)

# Location/context
agent.move_to(location, context)
agent.change_context(context)

# Accessible agents
agent.make_agent_accessible(other_agent, relation_description)
agent.make_agents_accessible(agents_list)
agent.make_agent_inaccessible(other_agent)

# Document reading
agent.read_documents_from_folder(path)
agent.read_document_from_file(path)
agent.read_documents_from_web(urls)
agent.read_document_from_web(url)

# Cognitive state access
agent._mental_state["goals"]
agent._mental_state["emotions"]
agent._mental_state["attention"]
agent._mental_state["context"]
agent._mental_state["datetime"]
agent._mental_state["location"]
agent._mental_state["accessible_agents"]
```

### Key TinyWorld Methods

```python
# Agent management
world.add_agent(agent)
world.remove_agent(agent)

# Simulation control
world.run(steps=10)
world.skip(steps=5)

# Datetime
world.current_datetime = datetime(2024, 1, 15, 9, 0)

# Broadcasting
world.broadcast(message)
world.broadcast_thought(thought)
world.broadcast_internal_goal(goal)

# Interventions
world.make_everyone_accessible()

# Communications
world._displayed_communications_buffer  # Access logs
```

---

## Appendix B: Frontend Component Reference

### Complete Component List (52 files)

```
src/lib/components/
├── casting-call/
│   └── CastingCall.svelte - Root agent creation view
├── common/ (9 files)
│   ├── Badge.svelte
│   ├── BaseModal.svelte
│   ├── ExportDialog.svelte
│   ├── Modal.svelte
│   ├── RichTextEditor.svelte
│   ├── ToastContainer.svelte
│   ├── Tooltip.svelte
│   └── UniversalToolbar.svelte
├── critics-corner/ (4 files)
│   ├── CriticsCorner.svelte
│   ├── DataVisualizer.svelte
│   ├── ResultsExtractor.svelte (STUB!)
│   └── StoryGenerator.svelte
├── grand-stage/ (10 files)
│   ├── GrandStage.svelte
│   ├── SimulationControls.svelte
│   ├── StageBackground.svelte
│   ├── StageControls.svelte
│   ├── TimeDisplay.svelte
│   ├── agents/
│   │   ├── AgentAvatar.svelte
│   │   ├── AgentNode.svelte
│   │   └── AgentTooltip.svelte
│   ├── environment/
│   │   └── TimeBasedBackground.svelte
│   ├── speech/
│   │   └── SpeechBubble.svelte
│   └── tools/
│       └── ToolAnimation.svelte
├── layout/
│   └── Sidebar.svelte
├── playwright/ (20 files)
│   ├── CastingCall.svelte
│   ├── MindPalace.svelte (UNUSED!)
│   ├── RelationshipNetwork.svelte
│   ├── StoryManager.svelte
│   ├── WorldBuilder.svelte
│   ├── casting-call/ (11 files)
│   │   ├── AgentCard.svelte
│   │   ├── AgentForm.svelte
│   │   ├── AgentGroupAssignment.svelte
│   │   ├── AgentGroupContainer.svelte
│   │   ├── AgentList.svelte
│   │   ├── GroupContainer.svelte
│   │   ├── GroupCreationControl.svelte
│   │   ├── GroupHeader.svelte
│   │   ├── GroupManager.svelte
│   │   ├── GroupSelector.svelte
│   │   ├── RichTextEditor.svelte
│   │   └── SortSelector.svelte
│   ├── mind-palace/ (2 files) (UNUSED!)
│   │   ├── FacultyAssignment.svelte
│   │   └── FacultyCard.svelte
│   ├── relationship-network/ (3 files)
│   │   ├── AgentSelector.svelte
│   │   ├── NodeTooltip.svelte
│   │   └── RelationshipEditModal.svelte
│   └── world-builder/ (4 files)
│       ├── ConnectionEditModal.svelte
│       ├── LocationContextMenu.svelte
│       ├── LocationEditModal.svelte
│       └── LocationPalette.svelte
└── settings/
    └── Settings.svelte
```

---

**End of Gap Analysis**

Generated: 2025-01-28  
Author: GitHub Copilot Analysis Agent  
TinyVerse Version: Development  
TinyTroupe Version: 0.x (vendored in backend/tinytroupe-local)
