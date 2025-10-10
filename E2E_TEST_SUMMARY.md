# E2E Test Enhancement Summary

## Overview
Enhanced the call-center E2E test to run a full boiler-room scam simulation with comprehensive artifact generation.

## Changes Made

### 1. Test Specification (`e2e/call-center.spec.ts`)

#### Simulation Configuration
- **Default steps: 18** (configurable via `E2E_SIMULATION_STEPS` env var)
- Minimum requirement: 4+ steps guaranteed
- Full day progression with polling until completion

#### Pre-Test Cleanup
Added explicit cleanup before test execution:
```typescript
// Delete all existing agents and locations via API
// Prevents duplicate name conflicts
// Waits for error toasts to clear
```

#### Artifact Generation

**Core Artifacts:**
- `simulation_logs_raw.json` - Raw simulation log data
- `simulation_transcripts.json` - Structured transcript with state snapshots
- `simulation_transcript_readable.txt` - Human-readable timeline
- `simulation_state.json` - Final simulation state
- `simulation_summary.json` - Executive summary with top agents/actions
- `scenario_manifest.json` - Complete environment snapshot

**Per-Agent Logs** (`agent-logs/` directory):
- `{agent_name}.json` - Structured activity data per agent
- `{agent_name}.txt` - Human-readable timestamped log per agent

**End-of-Day Reviews** (`agent_reviews.json`):
- Individual performance reviews for each agent
- Action count and breakdown
- Key activity highlights
- Performance classification (high/moderate/low volume)

**TQ Report Email:**
- `tq_report_email.json` - Structured daily management report
- `tq_report_email.txt` - Email-style formatted report
- Includes:
  - Executive summary (steps, agents, interactions)
  - Team breakdown (dialers, closers, targets)
  - Individual performance sections with key actions
  - Operational recommendations

#### Test Validation
- Verifies all 11 core artifact files exist
- Confirms `agent-logs/` directory is populated
- Ensures per-agent files are generated

### 2. UI Quick Setup (`src/lib/components/playwright/WorldBuilder.svelte`)

#### Location Redesign - Boiler Room Theme
1. **Boiler Room Pit** - Windowless dialer floor with high-pressure scripts
2. **War Room** - Lieutenants coordinating squeeze tactics
3. **Wire Ops Nook** - Money mule staging corner
4. **Victim Scoreboard** - Real-time target tracking screens

#### Agent Roster - 7 Total
**Dialers (2):**
- Max "Mad Dog" Russo - Lead Dialer (high-pressure opener)
- Sonia "Silver Tongue" Patel - Senior Opener (rapport manufacturing)

**Closers (1):**
- Victor "The Hammer" Klein - Shutdown Closer (suffocating pressure)

**Support (2):**
- Lila Monroe - Narrative Architect (lethal script design)
- Gus Navarro - Wire Facilitator (money movement coordination)

**Compliance (1):**
- Dana Pierce - Token Compliance Officer (plausible deniability)

**Targets (1):**
- Evan Bradley - Retired Investor (high-value mark)

#### Relationship Graph
7 relationships mapping the scam funnel:
- Dialers → Closer (funnel/setup flow)
- Script Architect → Dialers (script feeds)
- Wire Ops → Closer (execution coordination)
- Compliance → Closer (cover operations)
- Closer → Target (pressure application)

### 3. Backend API (`backend/app/api/agents.py`)

#### Improved Error Handling
- **409 Conflict** for duplicate agent names
- **400 Bad Request** for validation errors
- **500 Internal Server Error** only for unexpected failures
- Prevents misleading error responses

## Running the Tests

### Standard Run (18 steps)
```bash
npm run test:e2e -- e2e/call-center.spec.ts --headed
```

### Custom Step Count
```bash
E2E_SIMULATION_STEPS=25 npm run test:e2e -- e2e/call-center.spec.ts --headed
```

### Headless CI Mode
```bash
npm run test:e2e -- e2e/call-center.spec.ts
```

## Artifacts Location
```
test-artifacts/call-center/
├── agents.json
├── locations.json
├── simulation_logs_raw.json
├── simulation_transcripts.json
├── simulation_transcript_readable.txt
├── simulation_state.json
├── simulation_summary.json
├── scenario_manifest.json
├── performance_metrics.json
├── compliance_report.json
├── compliance_report.txt
├── agent_reviews.json
├── tq_report_email.json
├── tq_report_email.txt
└── agent-logs/
    ├── max_mad_dog_russo.json
    ├── max_mad_dog_russo.txt
    ├── sonia_silver_tongue_patel.json
    ├── sonia_silver_tongue_patel.txt
    ├── victor_the_hammer_klein.json
    ├── victor_the_hammer_klein.txt
    ├── lila_monroe.json
    ├── lila_monroe.txt
    ├── gus_navarro.json
    ├── gus_navarro.txt
    ├── dana_pierce.json
    ├── dana_pierce.txt
    ├── evan_bradley.json
    └── evan_bradley.txt
```

## Test Requirements Met

✅ **End-to-end scenario** - Full UI-driven simulation from setup to teardown  
✅ **Boiler room day progression** - 18-step simulation with agent interactions  
✅ **Minimum 4 simulation steps** - Default 18, configurable higher  
✅ **Artifact generation** - 11 core files + per-agent logs  
✅ **One log per agent** - Dedicated JSON + TXT files in `agent-logs/`  
✅ **End-of-day review stage** - `agent_reviews.json` with performance analysis  
✅ **Agent reports** - Individual activity summaries with action breakdowns  
✅ **TQ report email** - Daily management communication to lead  

## Known Issues Resolved

1. **Duplicate agent names** - Pre-test cleanup ensures clean state
2. **500 errors on conflict** - Backend now returns proper 409 status
3. **Toast overlay interference** - Added delay for UI stabilization
4. **Incomplete artifact set** - Expanded from 7 to 18+ artifact files

## Future Enhancements

- [ ] Add performance benchmarking across simulation runs
- [ ] Generate conversion funnel visualization
- [ ] Export artifacts in additional formats (CSV, PDF)
- [ ] Add simulation replay capability
- [ ] Implement multi-day progression support
