# E2E Tests for TinyVerse

## Requirements

- **Node.js 18.19+** (required for Playwright ESM support)
- Backend and frontend services (auto-started by Playwright)

## Call Center Simulation Test

### Overview

`call-center.spec.ts` - Comprehensive simulation test that creates a realistic call center environment with multiple agent types and customer interactions.

### What It Tests

**Agent Types:**
- **TQ Floor** (Telequestioners) - Cold callers making initial contact
- **Closers Room** - Deal-closing specialists handling warm leads
- **Compliance Office** - QA monitoring and regulatory oversight
- **Customer Zone** - Simulated customer leads (qualified, hard, soft)

**Workflow:**
1. **Setup Phase** - Creates locations, agents, and relationships via API
2. **Simulation Phase** - Runs 20 steps of agent interactions
3. **Analysis Phase** - Generates performance metrics and compliance reports
4. **Cleanup Phase** - Stops simulation and verifies artifact generation

### Artifacts Generated

All artifacts are saved to `test-artifacts/call-center/`:

- `locations.json` - Created locations with IDs
- `agents.json` - Created agents with metadata
- `simulation_transcripts.json` - Raw simulation event logs
- `simulation_transcript_readable.txt` - Human-readable transcript
- `performance_metrics.json` - Performance analysis by role
- `compliance_report.json` - Compliance violations and recommendations
- `compliance_report.txt` - Human-readable compliance report

### What This Tests

This test exposes missing functionality including:

- **Simulation control** - Start/stop/step operations
- **Agent interactions** - Multi-agent communication
- **Event logging** - Capturing simulation events
- **State management** - Tracking simulation state changes
- **Relationship dynamics** - How agents interact based on relationships
- **Location-based behavior** - How environment affects actions

### Running the Test

```bash
# Run all e2e tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Run specific test
npx playwright test e2e/call-center.spec.ts
```

### Expected Failures

This test **will expose missing backend functionality**:

- Simulation step-by-step execution
- Agent action generation
- Event logging system
- Transcript generation
- State snapshots

That's the fucking point - it's a stress test that shows what needs to be built.

### Integration Points

Tests full-stack integration:
- ✅ REST API endpoints (agents, locations, relationships)
- ✅ Bulk import/export
- ⏳ WebSocket events (planned)
- ⏳ Simulation engine (needs implementation)
- ⏳ Agent AI behavior (needs TinyTroupe integration)
- ⏳ Event logging (needs implementation)

### Real-World Scenario

Models a high-pressure sales environment:
- Jake "The Snake" - Aggressive TQ with compliance issues
- Maria Hernandez - Bilingual, empathetic approach
- Richard "Dick" Steele - Ruthless closer, gets deals done
- Sarah Chen - Compliance officer, clashes with sales tactics

Customers range from qualified business owners to naive retirees, testing how agents adapt their approach.

### Next Steps

Run this test to identify gaps, then implement:
1. Simulation step execution in TinyTroupe adapter
2. Action generation for agent behaviors
3. Event logging system
4. Real-time transcript generation
5. State snapshot serialization
