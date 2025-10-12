# Narrative Strategy

## Overview

TinyVerse includes a **narrative timeline system** that enables structured storytelling through **story beats**—discrete narrative moments that guide simulation progression. This document outlines the narrative data model, propagation flow, and integration patterns.

---

## Data Model

### StoryBeat

A story beat represents a single narrative moment or milestone in the simulation storyline.

#### Frontend (`src/lib/stores/timeline.ts`)

```typescript
interface StoryBeat {
  id: string;              // Unique identifier
  title: string;           // Short beat name (e.g., "Opening Scene")
  description: string;     // Detailed narrative context
  status: StoryBeatStatus; // 'pending' | 'active' | 'complete'
  trigger?: string;        // Condition/event that activates this beat
  blocking?: boolean;      // If true, prevents progression until resolved
  metadata?: Record<string, unknown>; // Optional arbitrary data
}
```

#### Backend (`backend/app/schemas/agent.py`)

```python
class ScenarioBeat(BaseModel):
    id: int                 # Integer identifier
    title: str              # Short beat name
    description: str        # Narrative context
    trigger: str            # Activation condition description
    blocks_progress: bool   # Whether beat blocks simulation flow
```

### Key Differences

- **ID type**: Frontend uses `string`, backend uses `int`
- **Status**: Frontend tracks status (`pending`/`active`/`complete`); backend generates beats without status
- **Trigger**: Backend requires `trigger`, frontend makes it optional
- **Blocking**: Backend uses `blocks_progress`, frontend uses `blocking` (both boolean)

---

## Data Flow

### 1. Generation (Backend → Frontend)

```
User Input (Wizard)
    ↓
POST /autofill_scenario
    ↓
TinyTroupeAdapter._autofill_scenario()
    ↓ (LLM generates JSON)
_normalize_beat()
    ↓ (validates & coerces types)
AutofillScenarioResponse.beats
    ↓ (HTTP response)
wizardOrchestrator.normalizeBeats()
    ↓ (frontend mapping)
timelineStore.setBeats()
```

**Key transformation** (`wizardOrchestrator.ts`):
```typescript
function normalizeBeats(raw: any): StoryBeat[] {
  const beats = asArray<any>(raw);
  return beats.map((beat, index) => {
    const id = String(beat?.id ?? beat?.slug ?? `beat-${index + 1}`);
    return {
      id,
      title: String(beat?.title ?? `Beat ${index + 1}`),
      description: String(beat?.description ?? beat?.summary ?? ''),
      status: index === 0 ? 'active' : 'pending',  // First beat active
      trigger: beat?.trigger ?? beat?.condition,
      blocking: Boolean(beat?.blocking ?? beat?.requires_decision),
      metadata: typeof beat === 'object' ? { ...beat } : undefined
    };
  });
}
```

### 2. Persistence (Frontend)

Story beats are **ephemeral**—stored only in Svelte writable stores during the session. There is **no database persistence** currently. When the page reloads, narrative state is lost unless:

- User exports scenario data manually (future feature)
- Beats are regenerated via wizard

**Store location**: `src/lib/stores/timeline.ts`

```typescript
const timelineStore = writable<TimelineState>({ beats: [] });
```

### 3. Consumption (UI)

**Primary consumer**: `TimelinePanel.svelte`

```
TimelinePanel.svelte
    ├── Displays beats in ordered list
    ├── Shows progress (X of Y complete, %)
    ├── Active beat highlighted
    ├── Blocking alert when active beat is blocking
    └── Actions:
        ├── "Activate next beat" → timelineStore.markActive(id)
        ├── "Complete current beat" → timelineStore.markComplete(id)
        └── "Complete & auto-advance" → complete + activate next
```

**Secondary consumer**: `StageControls.svelte`

Currently subscribes to `timelineStore` but doesn't actively use beats for simulation control. Potential future integration point for:
- Auto-stopping simulation when blocking beat is reached
- Injecting narrative context into agent prompts
- Triggering events based on beat triggers

---

## State Machine

Each beat transitions through three states:

```
┌──────────┐
│ pending  │ ← Initial state (all beats except first)
└────┬─────┘
     │ markActive(id)
     ↓
┌──────────┐
│  active  │ ← Current narrative focus (only one beat active at a time)
└────┬─────┘
     │ markComplete(id)
     ↓
┌──────────┐
│ complete │ ← Resolved beat (no return transition)
└──────────┘
```

**Rules**:
- Only **one beat** can be `active` at a time
- When a beat becomes `active`, any previous `active` beat transitions to `complete`
- `blocking` beats show UI warnings but don't programmatically halt simulation (manual orchestration)

---

## Backend LLM Integration

### Prompt Contract (`_autofill_scenario`)

```python
user_prompt = """
5. beats: array of objects with keys: 
   - id (int)
   - title (string)
   - description (string)
   - trigger (string): condition/event that activates this beat
   - blocks_progress (boolean): whether beat must resolve before progression
"""
```

### Normalization (`_normalize_beat`)

```python
def _normalize_beat(self, raw: Dict[str, Any]) -> Dict[str, Any]:
    d = dict(raw or {})
    
    # Fix over-quoted keys (LLM sometimes returns "\"id\"" instead of "id")
    d = {unquote_key(k): v for k, v in d.items()}
    
    # Coerce types
    d["id"] = int(d.get("id", 1))  # Default to beat 1
    d["title"] = str(d.get("title", "Untitled")).strip()
    d["description"] = str(d.get("description", "")).strip()
    d["trigger"] = str(d.get("trigger", "")).strip()
    d["blocks_progress"] = bool(d.get("blocks_progress", False))
    
    return d
```

**Limits**: Backend caps beats at **12 maximum** per scenario.

---

## Current Limitations & Future Work

### 🔴 **Not Implemented**

1. **Trigger Automation**: `trigger` field is descriptive text only. No event system evaluates triggers to auto-advance beats.
2. **Blocking Enforcement**: `blocking` flag shows UI warning but doesn't halt backend simulation.
3. **Persistence**: Beats lost on page reload. No save/load mechanism.
4. **Editing**: No UI to add/edit/delete beats post-generation.
5. **Simulation Integration**: Beats don't inject context into agent prompts or influence world state.

### 🟡 **Partial Implementation**

1. **Wizard Generation**: ✅ Generates beats via LLM
2. **UI Display**: ✅ Timeline panel shows beats with status
3. **Manual Control**: ✅ User can activate/complete beats manually

### 🟢 **Potential Enhancements**

1. **Narrative Context Injection**
   - Append active beat description to agent system prompts
   - Example: "Current story beat: {{activeBeat.description}}"

2. **Trigger Evaluation System**
   - Define trigger DSL (e.g., `"agent:Alice.location == 'Lab' AND turn > 5"`)
   - Backend evaluates triggers after each simulation step
   - Auto-advance beats when conditions met

3. **Database Persistence**
   - Add `scenarios` table with `beats` JSON column
   - Save/load scenario state including narrative progress

4. **Beat Editing UI**
   - Modal to add/edit/reorder beats
   - Autofill individual beats (similar to agent/location autofill)

5. **Grand Stage Integration**
   - Display active beat in stage controls
   - "Resume from beat X" quick actions
   - Highlight agents/locations relevant to current beat

6. **Beat Branching**
   - Allow beats to have conditional next states
   - Dialogue choices influence which beat activates next

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User: Setup Wizard                          │
│  (Provides: prompt, agent count, location count, include narrative) │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    POST /autofill_scenario                          │
│                    (Backend API Endpoint)                           │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│              TinyTroupeAdapter._autofill_scenario()                 │
│         ┌────────────────────────────────────────────┐              │
│         │ 1. Build LLM prompt with context           │              │
│         │ 2. Call _call_llm_json()                   │              │
│         │ 3. Parse response with _extract_scenario_  │              │
│         │    payload()                                │              │
│         │ 4. Normalize agents, locations, beats      │              │
│         │ 5. Validate with Pydantic schemas          │              │
│         └────────────────────────────────────────────┘              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ↓ (JSON response)
┌─────────────────────────────────────────────────────────────────────┐
│             AutofillScenarioResponse                                │
│   { agents: [...], locations: [...], beats: [...] }                │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│           wizardOrchestrator.runScenarioBootstrap()                 │
│         ┌────────────────────────────────────────────┐              │
│         │ 1. Parse response                          │              │
│         │ 2. Normalize beats with normalizeBeats()   │              │
│         │    - Convert id to string                  │              │
│         │    - Map blocks_progress → blocking        │              │
│         │    - Set first beat status: 'active'       │              │
│         │ 3. Apply to stores                         │              │
│         │    - agentStore.addAgent()                 │              │
│         │    - worldStore.addLocation()              │              │
│         │    - timelineStore.setBeats()              │              │
│         └────────────────────────────────────────────┘              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Svelte Stores (in-memory)                      │
│  ┌────────────────┐  ┌───────────────┐  ┌───────────────────────┐  │
│  │  agentStore    │  │  worldStore   │  │   timelineStore       │  │
│  │  (agents)      │  │  (locations)  │  │   (beats with status) │  │
│  └────────────────┘  └───────────────┘  └───────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ↓ (reactive subscriptions)
┌─────────────────────────────────────────────────────────────────────┐
│                          UI Components                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │            TimelinePanel.svelte                             │   │
│  │  - Display beats in list with status indicators             │   │
│  │  - Show progress: "X of Y complete (Z%)"                    │   │
│  │  - Highlight active beat                                    │   │
│  │  - Warn if active beat is blocking                          │   │
│  │  - Actions:                                                 │   │
│  │    • "Activate next beat"   → markActive(id)                │   │
│  │    • "Complete current beat" → markComplete(id)             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │          StageControls.svelte (future integration)          │   │
│  │  - Subscribe to timelineStore                               │   │
│  │  - Potential: inject active beat into simulation context    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Code References

### Frontend
- **Store**: `src/lib/stores/timeline.ts`
- **Orchestrator**: `src/lib/stores/wizardOrchestrator.ts`
- **UI Panel**: `src/lib/components/grand-stage/TimelinePanel.svelte`
- **Types**: `src/lib/stores/timeline.ts` (StoryBeat, StoryBeatStatus)

### Backend
- **Adapter**: `backend/app/services/tinytroupe_adapter.py` (_autofill_scenario, _normalize_beat)
- **Schema**: `backend/app/schemas/agent.py` (ScenarioBeat, AutofillScenarioResponse)
- **Endpoint**: `backend/app/api/autofill.py` (POST /autofill_scenario)

---

## Summary

The narrative system provides **lightweight storytelling structure** through beats generated via LLM. The current implementation focuses on:

✅ **Generation**: Wizard creates beats from high-level prompt  
✅ **Display**: Timeline panel shows beat progression  
✅ **Manual Control**: User activates/completes beats

Future work should prioritize:
- **Trigger automation** (event-driven beat advancement)
- **Simulation integration** (beats influence agent behavior)
- **Persistence** (save/load scenario narratives)

The system is designed to be **unobtrusive**—beats are optional (wizard can disable narrative) and don't require backend changes to simulation logic for basic display/tracking.
