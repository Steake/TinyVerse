# Frontend-Backend Control Wiring Audit

**Date:** October 13, 2025  
**Project:** TinyVerse  
**Purpose:** Document all control flow between frontend and backend, identify gaps, and validate state synchronization

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Simulation Control Flow](#simulation-control-flow)
3. [Agent Operations](#agent-operations)
4. [World Management](#world-management)
5. [Real-time Communication](#real-time-communication)
6. [State Synchronization](#state-synchronization)
7. [Identified Issues](#identified-issues)
8. [Recommendations](#recommendations)

---

## Architecture Overview

### Technology Stack

**Frontend:**
- Framework: Svelte 4.x + TypeScript
- State Management: Svelte stores (writable, derived)
- HTTP Client: Fetch API wrapped in ApiClient
- WebSocket: Custom WebSocketService
- Styling: TailwindCSS + DaisyUI

**Backend:**
- Framework: FastAPI (Python)
- Database: SQLite + SQLAlchemy ORM
- Simulation Engine: TinyTroupe
- Real-time: WebSocket broadcast system
- LLM: OpenAI API integration

### Communication Patterns

1. **Request-Response (HTTP REST)**
   - CRUD operations for agents, locations, connections
   - Simulation control commands
   - Memory operations
   - Autofill/LLM generation

2. **Event Streaming (WebSocket)**
   - Real-time simulation updates
   - Agent dialogue broadcasts
   - State change notifications
   - Lifecycle events (created, updated, deleted)

3. **Polling (Fallback)**
   - Simulation logs fetch after step/start
   - State refresh on reconnection

---

## Simulation Control Flow

### 1. Start Simulation

**Frontend Flow:**
```
User clicks "Play" → StageControls.togglePlayPause()
  → simulationStore.start(steps)
  → api.controlSimulation('start', steps, { beatContext })
  → Backend: POST /simulation/control { action: 'start', steps: 5, beat_context?: string }
  → simulationStore.fetchLogs()
  → timelineStore.evaluateTriggers({ step: 0, agents: [] })
```

**Backend Handler:**
- `backend/app/api/simulation.py::control_simulation()`
- Validates TinyTroupe world exists
- Checks if already running (409 Conflict if true)
- Calls `tinytroupe_adapter.run_simulation(steps, beat_context)`
- Returns `SimulationControlResponse` with current state
- **Broadcasts WebSocket:** `{ type: 'simulation_started' }`

**State Updates:**
- Frontend: `simulationStore.isRunning = true`, `isBusy = false`
- Backend: TinyWorld starts execution loop
- WebSocket: All connected clients notified

**✅ Status:** Working correctly
- Proper error handling for 409 conflicts
- Beat context passed for narrative-driven simulation
- Logs fetched immediately after start

---

### 2. Pause Simulation

**Frontend Flow:**
```
User clicks "Pause" → StageControls.togglePlayPause()
  → simulationStore.pause()
  → api.controlSimulation('pause')
  → Backend: POST /simulation/control { action: 'pause' }
```

**Backend Handler:**
- Stops TinyWorld execution
- Returns current state snapshot
- **Broadcasts WebSocket:** `{ type: 'simulation_paused' }`

**State Updates:**
- Frontend: `simulationStore.isRunning = false`, `isBusy = false`
- Backend: TinyWorld execution halted (agents retain state)

**✅ Status:** Working correctly

---

### 3. Step Forward

**Frontend Flow:**
```
User clicks "Step" → StageControls.handleStepForward()
  → simulationStore.step(1)
  → api.controlSimulation('step', 1, { beatContext })
  → Backend: POST /simulation/control { action: 'step', steps: 1 }
  → simulationStore.fetchLogs()
  → timelineStore.evaluateTriggers({ step: currentStep, agents: [] })
```

**Backend Handler:**
- Executes exactly N steps
- Collects logs during execution
- Returns updated state + logs
- **Broadcasts WebSocket:** `{ type: 'simulation_step', data: { step: N } }`

**State Updates:**
- Frontend: `currentStep++`, logs appended, time advanced
- Backend: TinyWorld advances by N steps
- Timeline: Triggers evaluated (e.g., `step:5` beats activate)

**✅ Status:** Working correctly
- Beat triggers evaluated after each step
- Blocking beats prevent further steps

---

### 4. Stop Simulation

**Frontend Flow:**
- Currently **NOT IMPLEMENTED** in UI
- API method exists: `api.controlSimulation('stop')`

**Backend Handler:**
- Would reset TinyWorld state
- Clear all simulation context
- **Would broadcast:** `{ type: 'simulation_stopped' }`

**⚠️ Issue:** No UI button for "Stop" - users can only Pause
**Recommendation:** Add Stop button that fully resets simulation state

---

## Agent Operations

### 1. Create Agent

**Frontend Flow:**
```
User submits AgentForm → CastingCall.handleSave()
  → agentStore.addAgent(agent)
  → api.createAgent(agent)
  → Backend: POST /agents { name, occupation, emoji, ... }
  → agentStore.fetchAgents() // Refresh list
```

**Backend Handler:**
- `backend/app/api/agents.py::create_agent()`
- Validates required fields (name, occupation)
- Normalizes emoji via `_normalize_agent_autofill()`
- Creates TinyPerson in TinyTroupe adapter
- Stores in database via SQLAlchemy
- **Broadcasts WebSocket:** `{ type: 'agent_created', data: agent }`

**State Updates:**
- Frontend: Agent added to `agentStore`, UI updates reactively
- Backend: TinyPerson persisted in both DB and TinyTroupe memory
- WebSocket: All clients refresh agent list

**✅ Status:** Working correctly
- Full CRUD cycle validated
- Emoji normalization working (fixed in previous feature)

---

### 2. Update Agent

**Frontend Flow:**
```
User edits agent → AgentForm submits
  → agentStore.updateAgent(agent)
  → api.updateAgent(id, updates)
  → Backend: PATCH /agents/{id} { ...fields }
```

**Backend Handler:**
- Validates agent exists in DB
- Updates TinyPerson attributes in TinyTroupe
- Persists changes to database
- **Broadcasts WebSocket:** `{ type: 'agent_updated', data: agent }`

**⚠️ Issue:** Partial updates may cause TinyPerson sync issues
- TinyTroupe TinyPerson objects have complex state (memories, relationships)
- PATCH updates may not fully synchronize all nested attributes
- No validation that TinyPerson was successfully updated

**Recommendation:** Add validation layer to ensure TinyPerson attributes match DB

---

### 3. Delete Agent

**Frontend Flow:**
```
User confirms deletion → agentStore.deleteAgent(id)
  → api.deleteAgent(id)
  → Backend: DELETE /agents/{id}
```

**Backend Handler:**
- Removes agent from database
- **Does NOT remove from active TinyWorld if simulation running**
- **Broadcasts WebSocket:** `{ type: 'agent_deleted', data: { id } }`

**⚠️ Issue:** Agent deletion doesn't clean up TinyWorld
- If agent is deleted during simulation, TinyPerson still exists in TinyWorld
- May cause errors when simulation references deleted agent
- No cascade deletion for agent relationships/memories

**Recommendation:** 
- Prevent deletion of agents in active simulation
- OR automatically remove TinyPerson from TinyWorld on delete
- Add cascade deletion for related data

---

### 4. Memory Operations

**Episodic Memory (Agent experiences):**

Frontend: `api.getEpisodicMemory(agentId, { limit: 50 })`
- Backend: `GET /agents/{agent_id}/memory/episodic?limit=50`
- Returns chronological list of experiences
- **✅ Working:** Used in AgentDetailsPage

Frontend: `api.clearEpisodicMemory(agentId, { max_prefix, max_suffix })`
- Backend: `POST /agents/{agent_id}/memory/episodic/clear`
- Clears memory with prefix/suffix retention
- **⚠️ No UI:** Feature exists but no button in UI

**Semantic Memory (Agent knowledge):**

Frontend: `api.querySemanticMemory(agentId, { query, limit })`
- Backend: `POST /agents/{agent_id}/memory/semantic/query`
- Vector search in agent's knowledge base
- **✅ Working:** Used in AgentDetailsPage

Frontend: `api.ingestSemanticMemory(agentId, { text, sources })`
- Backend: `POST /agents/{agent_id}/memory/semantic/ingest`
- Adds knowledge to agent's semantic memory
- **⚠️ No UI:** Feature exists but no UI for manual ingestion

---

### 5. Mental Faculties & Tools

**Faculties (Cognitive capabilities):**

Frontend:
```
api.getFacultyDefinitions() // Available faculties
api.getAgentFaculties(agentId) // Agent's current faculties
api.assignFaculty(agentId, { faculty_name, config })
api.updateFaculty(agentId, facultyId, { config })
api.deleteFaculty(agentId, facultyId)
```

Backend: Full CRUD in `backend/app/api/agents.py`

**⚠️ Issue:** No UI for faculty management
- MindPalace component exists but doesn't use faculty APIs
- Users can't assign/configure mental faculties
- Powerful feature hidden from users

**Tools (Actions agents can take):**

Similar API structure to faculties:
```
api.getToolDefinitions()
api.getAgentTools(agentId)
api.assignTool(agentId, { tool_name, config })
```

**⚠️ Issue:** No UI for tool management
- Backend has full tool system
- Frontend has no way to assign/configure tools
- Critical for agent capabilities

**Recommendation:** Add faculty/tool management to AgentDetailsPage or MindPalace

---

## World Management

### 1. Locations

**Create Location:**
```
Frontend: LocationManager → worldStore.addLocation(location)
  → api.createLocation(location)
  → Backend: POST /locations { name, x, y, width, height, blocks_movement }
```

**Update Location:**
```
Frontend: worldStore.updateLocation(id, updates)
  → api.updateLocation(id, updates)
  → Backend: PATCH /locations/{id}
```

**Delete Location:**
```
Frontend: worldStore.deleteLocation(id)
  → api.deleteLocation(id)
  → Backend: DELETE /locations/{id}
```

**WebSocket Broadcasts:**
- `location_created` → All clients refresh locations
- `location_updated` → UI updates position/properties
- `location_deleted` → Remove from stage

**✅ Status:** Working correctly
- Full CRUD with WebSocket sync
- Visual updates on Grand Stage

---

### 2. Connections

**Create Connection:**
```
Frontend: RelationshipNetwork → worldStore.addConnection(connection)
  → api.createConnection(connection)
  → Backend: POST /world/connections { source, target, label, isDirectional }
```

**Delete Connection:**
```
Frontend: worldStore.deleteConnection(id)
  → api.deleteConnection(id)
  → Backend: DELETE /world/connections/{id}
```

**WebSocket Broadcasts:**
- `connection_created` → Clients draw edge on map
- `connection_deleted` → Remove edge

**✅ Status:** Working correctly

---

### 3. Scenario Persistence

**Frontend:**
```
wizardOrchestrator.persistScenario()
  → api: POST /world/scenario/persist {
      scenario_description,
      agents: [...],
      locations: [...],
      connections: [...]
    }
```

**Backend:**
- Creates all entities in transaction
- Broadcasts individual creation events
- Used by Setup Wizard for bulk creation

**✅ Status:** Working correctly

---

## Real-time Communication

### WebSocket Event Types

**From Backend → Frontend:**

| Event Type | Trigger | Frontend Action |
|------------|---------|-----------------|
| `agent_created` | Agent POST | Refresh agent list |
| `agent_updated` | Agent PATCH | Refresh agent list |
| `agent_deleted` | Agent DELETE | Refresh agent list |
| `location_created` | Location POST | Refresh locations |
| `location_updated` | Location PATCH | Refresh locations |
| `location_deleted` | Location DELETE | Refresh locations |
| `connection_created` | Connection POST | Refresh connections |
| `connection_deleted` | Connection DELETE | Refresh connections |
| `simulation_started` | Simulation start | Toast notification |
| `simulation_paused` | Simulation pause | Toast notification |
| `simulation_stopped` | Simulation stop | Toast notification |
| `simulation_step` | Each step | Refresh state, fetch logs |
| `dialogue` | Agent speech | Queue speech bubbles |
| `state` | State push | Update simulation state |
| `error` | Backend error | Toast error message |

**✅ Status:** Comprehensive event coverage

---

### Message Queue System

**Speech Bubble Throttling:**
- Frontend maintains message queue (`websocket.ts`)
- Messages displayed with 800ms delay between each
- Prevents UI flooding when many agents speak
- Configurable delay: `setMessageDelay(100-3000ms)`

**Process:**
```
WebSocket 'dialogue' event → projectEntries(entries)
  → Queue each entry with unique key
  → processQueue() async loop
  → Display one bubble every 800ms
  → Position at agent location
  → Auto-dismiss after 5 seconds
```

**✅ Status:** Working perfectly (implemented in previous feature)

---

### Reconnection Strategy

**Exponential Backoff:**
- Max 5 reconnection attempts
- Delay: `1000ms * 2^(attempt-1)`
- Attempts: 1s, 2s, 4s, 8s, 16s
- Toast notifications on success/failure

**State Recovery:**
- On reconnect: Fetch latest simulation state
- Re-subscribe to WebSocket events
- No message replay (stateless protocol)

**⚠️ Issue:** No message replay on reconnection
- If client disconnects during simulation step, may miss dialogue
- No way to retrieve missed real-time events
- Logs fetch helps but may have timing gaps

**Recommendation:** 
- Add message buffering on backend (last N events)
- Send replay on reconnect with `since` timestamp
- Or rely more heavily on polling as authoritative source

---

## State Synchronization

### Agent Store

**Source of Truth:** Backend database + TinyTroupe memory

**Sync Points:**
- On mount: `agentStore.fetchAgents()`
- After CRUD: Auto-refresh via WebSocket events
- Manual refresh: `agentStore.fetchAgents()`

**Consistency:**
- ✅ WebSocket keeps all clients in sync
- ✅ Optimistic updates with error rollback
- ⚠️ TinyPerson state may drift from DB during long simulations

---

### World Store

**Source of Truth:** Backend database

**Sync Points:**
- On mount: `worldStore.fetchLocations()`, `fetchConnections()`
- After CRUD: WebSocket triggers refresh
- Simulation state: Polling + WebSocket

**Consistency:**
- ✅ Full sync via WebSocket broadcasts
- ✅ No drift issues (world is relatively static)

---

### Simulation Store

**Source of Truth:** Backend TinyWorld state

**Sync Points:**
- On mount: `simulationStore.fetchState()`
- After control: `applyControlResponse()`
- Periodic: WebSocket `state` events
- Manual: `fetchState()`, `fetchLogs()`

**Consistency:**
- ✅ State synced via control responses
- ✅ Logs merged to prevent duplicates
- ⚠️ `currentTime` calculated client-side (may drift)
- ⚠️ No heartbeat to detect server crashes

**Time Tracking:**
```typescript
// Frontend calculates time based on elapsed real-time × speed
const elapsed = now - lastUpdateTime;
const newTime = currentTime + (elapsed * speed * 60);
```

**Issue:** Frontend time can drift from backend simulation time
- Speed changes don't retroactively adjust time
- Pauses may not sync perfectly
- No authoritative timestamp from backend

**Recommendation:** Backend should send simulation timestamp with each step

---

### Timeline Store

**Source of Truth:** Frontend only (local state)

**Sync Points:**
- Story beats stored in frontend store only
- No backend persistence
- Lost on page refresh
- Beat triggers evaluated client-side

**⚠️ Major Issue:** No backend integration
- Story beats are purely frontend decorations
- Backend doesn't know about narrative structure
- `beat_context` passed to simulation but not validated
- No persistence means beats lost on reload

**Recommendation:** Add backend persistence for story beats
- Store in database with simulation association
- Validate beat triggers server-side
- Send beat transitions via WebSocket
- Allow sharing story beats between users

---

## Identified Issues

### Critical Issues

1. **❌ No Stop Simulation Button**
   - Users can pause but not fully reset
   - May lead to unexpected state accumulation
   - **Fix:** Add Stop button to StageControls

2. **❌ Story Beats Not Persisted**
   - All timeline/narrative structure lost on refresh
   - Backend doesn't validate beat context
   - No multi-user collaboration on story
   - **Fix:** Add beat persistence API

3. **❌ Agent Deletion During Simulation**
   - Deleted agents still exist in TinyWorld
   - May cause simulation errors
   - No cleanup of TinyPerson instances
   - **Fix:** Prevent deletion or auto-remove from world

4. **❌ TinyPerson State Drift**
   - Updates to agent may not sync all TinyPerson attributes
   - Memory/relationship state may diverge
   - No validation that update succeeded in TinyTroupe
   - **Fix:** Add TinyPerson state validator

---

### Major Issues

5. **⚠️ No Mental Faculty/Tool UI**
   - Powerful backend features completely hidden
   - Users can't configure agent capabilities
   - MindPalace component unused
   - **Fix:** Add faculty/tool management to AgentDetailsPage

6. **⚠️ No Memory Management UI**
   - Can't manually add/remove memories
   - Can't clear episodic memory (API exists)
   - Can't ingest semantic knowledge
   - **Fix:** Add memory management to AgentDetailsPage

7. **⚠️ Time Drift**
   - Frontend calculates time independently
   - Backend has no authoritative timestamp
   - Speed changes cause inaccuracies
   - **Fix:** Backend should send timestamp with each step

8. **⚠️ No Message Replay**
   - Disconnected clients miss real-time events
   - No way to retrieve missed dialogue
   - **Fix:** Add event buffer + replay mechanism

9. **⚠️ No Agent Movement Tracking**
   - Backend doesn't track agent locations
   - Frontend positions are purely decorative
   - Can't persist or replay movement
   - **Fix:** Add location tracking to backend state

---

### Minor Issues

10. **⚠️ No Heartbeat/Health Check**
    - Can't detect server crashes vs network issues
    - No automatic state recovery
    - **Fix:** Add periodic ping/pong

11. **⚠️ Logs Deduplication**
    - Relies on `seenLogKeys` array (memory leak potential)
    - No timestamp-based deduplication
    - **Fix:** Use Set with LRU eviction

12. **⚠️ No Autosave**
    - World/agent changes require manual save
    - Easy to lose work if browser crashes
    - **Fix:** Add periodic autosave to localStorage

---

## Recommendations

### High Priority

1. **Add Stop Simulation Control**
   - Button in StageControls
   - Clears TinyWorld state
   - Resets timeline to initial

2. **Persist Story Beats**
   - Create beat CRUD API
   - Store beats with simulation ID
   - Send beat transitions via WebSocket
   - Auto-load beats on page refresh

3. **Prevent/Handle Agent Deletion Issues**
   - Option A: Block deletion during active simulation
   - Option B: Remove TinyPerson from world on delete
   - Add cascade deletion for memories/relationships

4. **Add Faculty/Tool Management UI**
   - Extend AgentDetailsPage with new tab
   - Show available faculties/tools
   - Allow assignment with configuration
   - Display current assignments

---

### Medium Priority

5. **Add Memory Management UI**
   - Button to clear episodic memory
   - Form to ingest semantic knowledge
   - Timeline view of memory events

6. **Fix Time Synchronization**
   - Backend sends timestamp with each response
   - Frontend uses server time as authoritative
   - Adjust for latency/clock skew

7. **Add Event Replay on Reconnect**
   - Backend buffers last 100 events
   - Client sends `last_event_id` on reconnect
   - Server replays missed events

8. **Add Agent Location Tracking**
   - Backend stores agent positions
   - Simulation can move agents between locations
   - Frontend syncs positions via WebSocket

---

### Low Priority

9. **Add Heartbeat Mechanism**
   - Ping every 30 seconds
   - Detect zombie connections
   - Faster reconnection detection

10. **Improve Log Deduplication**
    - Use Set with LRU cache
    - Timestamp-based filtering
    - Prevent memory leaks

11. **Add Autosave**
    - Save draft state to localStorage
    - Periodic snapshots (every 5 minutes)
    - Restore on crash recovery

---

## Testing Recommendations

### Integration Tests Needed

1. **Simulation Control Flow**
   - Test start → step → pause → resume cycle
   - Verify state consistency after each transition
   - Test error handling (409 conflicts, etc.)

2. **Agent CRUD During Simulation**
   - Create agent while running → Should appear
   - Delete agent while running → Should handle gracefully
   - Update agent while running → Changes reflected

3. **WebSocket Reliability**
   - Test reconnection after disconnect
   - Verify all event types trigger correct actions
   - Test message queue under load

4. **State Synchronization**
   - Multi-client simulation (2+ browsers)
   - Verify all see same agent states
   - Test race conditions (concurrent updates)

---

## Conclusion

The frontend-backend wiring is **generally solid** with good separation of concerns and comprehensive WebSocket coverage. However, several critical gaps exist:

1. **Story beats are frontend-only** (no persistence)
2. **Agent deletion doesn't clean up simulation**
3. **Powerful features hidden** (faculties, tools, memory management)
4. **Time synchronization issues** (client-side calculation)

The recommendation is to prioritize backend persistence for story beats and add UI for the existing faculty/tool/memory APIs. These changes would significantly improve user experience and system reliability.

---

**Document Version:** 1.0  
**Last Updated:** October 13, 2025  
**Reviewed By:** AI Architect
