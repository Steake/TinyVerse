# Example: Creating Issues from ISSUES.md

This document provides examples of how to create GitHub issues using the templates and ISSUES.md guide.

## Example 1: Critical Issue - TypeScript Compilation Errors

**Using Template**: Roadmap Task (`.github/ISSUE_TEMPLATE/roadmap-task.md`)

**Issue Details**:

```markdown
---
name: Roadmap Task
about: Track a major roadmap item from the TinyVerse development plan
title: '[ROADMAP] Fix TypeScript Compilation Errors'
labels: roadmap, critical, typescript, frontend
assignees: ''
---

## Overview
Fix 62 TypeScript errors preventing successful builds. This is blocking development and deployment.

## Priority
Critical

## Effort Estimate
Medium (1-2 weeks)

## Related Documentation
- [x] ROADMAP.md section: Critical Issues → Section 1
- [x] ARCHITECTURE.md section: Component Architecture
- [x] ISSUES.md: Issue #1

## Action Items
From ROADMAP.md:
- [ ] Fix API client type definitions in `src/lib/api/client.ts`
- [ ] Add missing methods to world store or update export utilities
- [ ] Add missing methods to agent store
- [ ] Add missing methods to simulation store
- [ ] Export AgentGroup type from groups store
- [ ] Verify all type imports and exports

## Success Criteria
- [ ] `npm run check` passes with zero TypeScript errors
- [ ] All imports resolve correctly
- [ ] No `any` types introduced as workarounds
- [ ] Build completes successfully

## Dependencies
- None (this is a prerequisite for other work)

## Notes
- Some errors are in API client due to LogFilters vs QueryParams mismatch
- Missing methods: getLocations, getConnections, getAgents, getLogs, getCurrentState
- Type export issue with AgentGroup
```

**How to Create**:
1. Go to https://github.com/Steake/TinyVerse/issues/new/choose
2. Select "Roadmap Task" template
3. Fill in the fields as shown above
4. Add labels: `roadmap`, `critical`, `typescript`, `frontend`
5. Assign to milestone: `v0.1.0 - Stabilization`
6. Create the issue

---

## Example 2: Bug Report

**Using Template**: Bug Report (`.github/ISSUE_TEMPLATE/bug-report.md`)

**Issue Details**:

```markdown
---
name: Bug Report
about: Report a bug or issue in TinyVerse
title: '[BUG] Agent creation form validation not working'
labels: bug, frontend
assignees: ''
---

## Description
When creating a new agent in the Casting Call, form validation doesn't trigger for required fields. Users can submit incomplete agent profiles.

## Steps to Reproduce
1. Go to Playwright's Desk → Casting Call
2. Click "New Agent"
3. Leave name field empty
4. Click "Create Agent"
5. Form submits without validation error

## Expected Behavior
- Form should show validation error: "Agent name is required"
- Submit button should be disabled until all required fields are filled
- Required fields should have visual indicator (*)

## Actual Behavior
- Form submits successfully
- Agent is created with empty name
- No validation errors shown

## Environment
- Browser: Chrome 120
- OS: macOS 14
- Node version: 20.x
- Commit: caec8c5

## Screenshots
[Screenshot would be attached here]

## Additional Context
This affects data quality and could cause issues with the simulation engine.
Related to ROADMAP.md Phase 3.3 Error Handling.
```

---

## Example 3: Feature Request

**Using Template**: Feature Request (`.github/ISSUE_TEMPLATE/feature-request.md`)

**Issue Details**:

```markdown
---
name: Feature Request
about: Suggest a new feature for TinyVerse
title: '[FEATURE] Add drag-and-drop for agent placement in Grand Stage'
labels: enhancement, frontend
assignees: ''
---

## Feature Description
Enable drag-and-drop functionality to manually position agents on the Grand Stage visualization.

## Use Case
- **Who**: Simulation designers and storytellers
- **Problem**: Currently agents are positioned automatically, limiting control over visual storytelling
- **Solution**: Allow manual positioning for screenshots, presentations, and narrative control

## Proposed Solution
1. Add drag-and-drop handlers to agent avatars on Grand Stage
2. Store custom positions in simulation state
3. Add "Reset to auto-position" button
4. Persist positions across simulation pause/resume
5. Add grid snap option for precise alignment

Implementation:
- Use GSAP for smooth dragging animation
- Update agent position in simulation store
- Add toggle between "auto" and "manual" positioning mode

## Alternatives Considered
1. **Click-to-place**: Less intuitive, requires mode switching
2. **Coordinate input**: Too technical for casual users
3. **Path drawing**: Over-engineered for this use case

## Priority
Medium - Nice enhancement but not blocking core functionality

## Related Roadmap Items
- [x] Related to ROADMAP.md: Medium-Term → Advanced Visualizations
- [x] Aligns with Grand Stage improvements

## Additional Context
- Similar to theater stage blocking tools
- Would pair well with camera controls (also on roadmap)
- Could extend to location elements later

Example from similar tools:
- Unity Editor drag-and-drop
- Figma object positioning
```

---

## Creating Multiple Issues at Once

### Batch Creation Strategy

For initial setup, create issues in this order:

#### Phase 1: Critical (Week 1)
1. [ROADMAP] Fix TypeScript Compilation Errors
2. [ROADMAP] Backend API Implementation
3. [ROADMAP] Address Accessibility Warnings

#### Phase 2: Infrastructure (Week 1-2)
4. [ROADMAP] Fix Build Issues
5. [ROADMAP] Code Quality Improvements
6. [ROADMAP] Testing Infrastructure

#### Phase 3: Backend (Week 2-4)
7. [ROADMAP] API Server Setup
8. [ROADMAP] Core Backend Endpoints
9. [ROADMAP] Data Layer Implementation

#### Phase 4: Integration (Week 4-6)
10. [ROADMAP] Frontend-Backend Integration
11. [ROADMAP] Error Handling

...and so on, following ISSUES.md

---

## Using GitHub CLI (Optional)

If you have `gh` CLI installed:

```bash
# Create from template
gh issue create \
  --template roadmap-task.md \
  --title "[ROADMAP] Fix TypeScript Compilation Errors" \
  --label "roadmap,critical,typescript,frontend" \
  --milestone "v0.1.0 - Stabilization" \
  --body-file /path/to/filled-template.md

# Or create interactively
gh issue create --web
```

---

## Best Practices

### 1. Use Clear Titles
- ✅ `[ROADMAP] Fix TypeScript Compilation Errors`
- ✅ `[BUG] Agent form validation not working`
- ❌ `Fix bugs`
- ❌ `TypeScript errors`

### 2. Fill All Sections
- Don't leave template sections empty
- Use "N/A" if a section doesn't apply
- Link to documentation when possible

### 3. Set Appropriate Labels
- Always use the primary label (roadmap, bug, enhancement)
- Add area labels (frontend, backend, testing)
- Add priority if applicable

### 4. Link Related Issues
- Use "Depends on #123" for dependencies
- Use "Related to #456" for related work
- Use "Closes #789" in PR descriptions

### 5. Keep Updated
- Update checkboxes as work progresses
- Add comments for significant changes
- Close when complete, not when started

---

## Resources

- [ISSUES.md](../ISSUES.md) - Full list of recommended issues
- [ROADMAP.md](../ROADMAP.md) - Development roadmap
- [.github/README.md](./README.md) - GitHub configuration guide
- [GitHub Issues Documentation](https://docs.github.com/en/issues)
