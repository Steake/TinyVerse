# Grand Stage UI Overhaul

## 1. Purpose & Context
The current `GrandStage` scene renders agents and interactions, but it lacks the structure the simulation team needs to audit agent behavior in real time. This plan outlines a holistic interface that:

- Tracks agent presence and movement across simulation time.
- Surfaces cognitive traces (thoughts, intentions) alongside verbal output.
- Visualises locations, weather, and other environmental factors that influence behavior.
- Highlights tool usage and other key actions so operators can diagnose scenarios quickly.
- Provides timeline controls (play, pause, step) with clear feedback on simulation progress.

## 2. Stakeholder Goals
| Stakeholder | Goal |
| --- | --- |
| Simulation operator | Observe the world state and agent interactions at a glance. |
| Narrative designer | Review thoughts vs. spoken dialogue to tune prompts. |
| QA engineer | Verify that tool invocations, movement, and state changes align with expectations. |

## 3. Requirements Inventory & Data Hooks
| Requirement | Description | Primary Data Source(s) | Notes |
| --- | --- | --- | --- |
| Agent tracking | Keep live roster of agents active in the scene, including status (idle, moving, speaking, using tool). | `stageStore.activeAgents`, `stageStore.agentPositions`, `simulationStore.logs` | Combine stage positions with latest log-derived status. |
| Movement visualisation | Show current position plus recent trail or animated movement to the next waypoint. | `stageStore.agentPositions`, `simulationStore.logs` (MOVE actions) | Animate positional updates, optionally leave fading trail per agent. |
| Location map | Render world layout so positions are contextual (rooms, outdoor spaces). | `worldStore.locations`, `worldStore.connections`, `StageBackground` | Layer top-down map or schematic under agents; reuse D3 map utilities where possible. |
| Thought feed | Stream internal cognition (thoughts, reflections). | `simulationStore.logs` (metadata.kind === 'thought') | Present in sidebar list grouped by agent with timestamps. |
| Dialogue/chat feed | Show spoken utterances in chat-like interface. | `simulationStore.logs` (action === 'TALK', metadata.rendering === 'speech') | Chat bubbles in scene + persistent scrolling panel. |
| Tool activity | Visual cue when an agent triggers a tool (icon flare, pulse) and log entry. | `simulationStore.logs` (metadata.kind === 'tool', metadata.toolId) | Icon overlay near agent plus timeline row. |
| Action timeline | Scrollable timeline summarising recent actions (move, interact, tool). | `simulationStore.logs` normalised events | Sync with playhead; clicking item scrubs scene. |
| Simulation status | Display current step, simulation time, weather, temperature. | `simulationStore` state DTO, `stageStore.time`, `stageStore.weather`, `stageStore.temperature` | Format as status bar with icons. |
| Playback controls | Play/pause/step/rewind with visual feedback. | `simulationStore.controlSimulation`, `simulationStore.tick` | Buttons plus keyboard shortcuts, disable states during async. |
| Weather + lighting | Show weather icon and reflect in background. | `stageStore.weather`, `stageStore.lighting` | Continue using canvas background but centralise config. |

## 4. Experience Layout
```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Status Strip: [Step #][Time][Weather/Temp][Play][Pause][Step][Speed Selector]  │
├───────────────┬───────────────────────────────────────────────────────────────┤
│ Agent Tracker │ Stage View                                                     │
│ (left panel)  │  • Location map/heatmap background                             │
│               │  • Agent avatars w/ badges + trails                            │
│ • Search      │  • Tool-use pulses & speech bubbles                            │
│ • Filters     │  • Hover = tooltip (stats, mood, prev action)                  │
│ • Status tags │                                                               │
├───────────────┴───────────────────────────────────────────────────────────────┤
│ Bottom Dock: Thought stream | Dialogue feed | Action timeline (tabbed or cols) │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Agent Tracker (left column, ~20% width)
- Virtualised list of active agents with photo/emoji, current status, location, and quick stats (mood, energy, tool in use).
- Clicking an agent focuses the stage camera, highlights trail, and filters feeds to that agent.
- Supports quick filters ("speaking", "using tools", "moving", "idle").

### Stage View (center canvas)
- Top-down or isometric map derived from `worldStore.locations` sized to viewport.
- Agents rendered as SVG/Canvas nodes (reuse `AgentNode`, augment with status ring + direction arrow).
- Movement animation using D3 force simulation or tween from previous position to new coordinate.
- Optional path trails: maintain last N positions per agent to render faint line or footsteps.
- Tool usage overlay: when metadata.kind === 'tool', show tool icon and radial pulse around agent for duration.
- Weather overlay continues via `StageBackground`, but integrate map layers (grid, rooms) before weather effects.

### Bottom Dock Streams
1. **Thought Stream** (left third): Card list with agent avatar, timestamp, and thought text. Metadata tags (e.g. importance, perception) shown as chips.
2. **Dialogue Feed** (middle third): Chat bubbles stacked chronologically; pairs consecutive lines by same speaker. Anchor to simulation step/time.
3. **Action Timeline** (right third): Horizontal mini-timeline with icons per action category. Includes tool, move, interact, memory events. Clicking scrubs stage (update `simulationStore` state & reposition agents/log focus).

Allow docking layout to collapse/expand each feed depending on operator preference.

### Status Strip (top)
- Simulation Step indicator pulling from `simulationStore.currentStep`.
- Clock showing formatted `stageStore.time` (or simulation state timestamp if authoritative).
- Weather/temperature indicator with icon + toggle to adjust (if permitted).
- Playback controls: play/pause/resume, step forward/back (±1 step), speed selector (0.5x/1x/2x), reset.

## 5. Interaction Design
- **Play/Pause**: integrate with `simulationStore.start/pause/step`. Provide progress spinner when awaiting backend control response.
- **Scrubbing**: selecting timeline entry or adjusting slider changes log index; call new `simulationStore.seek(step)` to hydrate state and reposition agents.
- **Agent Focus**: double-click agent for persistent focus—camera pans, other agents dimmed, feeds filtered.
- **Tool Visualization**: define tool icon mapping (from `ToolDefinition`) and show custom animation via `ToolAnimation` component; log panel entry expands to show parameters/results when hovered.
- **Thought vs Dialogue Toggle**: allow combined chronological view or separate columns.

## 6. Data & Component Contracts
| Component | Consumes | Emits |
| --- | --- | --- |
| `GrandStage` | `$agentStore`, `$stageStore`, `$simulationStore.logs`, `$worldStore` | `controlSimulation` commands, `seek` events |
| `StageCanvas` (new) | Scene graph created from locations + agents | `agentHover`, `agentSelect`, `viewportChange` |
| `AgentTrackerPanel` | Agent list derived from stores | `focusAgent`, `filterChange` |
| `ThoughtFeed` | Filtered simulation logs | `seek`, `focusAgent` |
| `DialogueFeed` | Filtered speech logs | `seek`, `focusAgent` |
| `ActionTimeline` | Normalised log events with timestamps | `seek`, `filterActionType` |
| `StatusControls` | Simulation state summary | `play`, `pause`, `step`, `speedChange` |

Data preparation will leverage the recent normalization utilities in `src/lib/utils/simulation.ts` so every feed consumes `SimulationLog` with consistent metadata.

## 7. Rollout Phases
1. **Foundation (Milestone 1)**
   - Refactor `GrandStage` into layout shell with top/bottom panels and left tracker column.
   - Introduce derived stores/selectors for agent status, timeline entries, and feeds.
   - Replace canvas/weather system with composable layers (map, weather, overlays).

2. **Interaction Layer (Milestone 2)**
   - Implement play/pause controls wired to backend.
   - Add agent focus interactions and tooltip improvements.
   - Build thought & dialogue feeds pulling from normalised logs.

3. **Advanced Visuals (Milestone 3)**
   - Movement trails & interpolation.
   - Tool use animations (hook into `ToolAnimation` variants).
   - Action timeline with scrubbing + keyboard shortcuts.

4. **Polish & Accessibility (Milestone 4)**
   - Responsive layout for wide vs. narrow screens.
   - Screen reader support for status/timeline updates.
   - Smooth theming for dark/light modes.

## 8. Open Questions
- **Movement granularity**: Do we need pathfinding to ensure agents traverse connections realistically, or are teleport updates acceptable?
- **Historical playback**: Should the timeline support rewinding the simulation (requires backend support to rehydrate state)?
- **Scalability**: Maximum agents before UI degrades—might need clustering or summarised views for >30 agents.
- **Tool result detail**: Determine how much of the tool payload (input/output) is safe to expose in UI.

Answering these will inform subsequent tickets and potential backend enhancements (e.g., step-based snapshots for rewind, location graph metadata).
