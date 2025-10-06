# TinyVerse GitHub Project Board Setup

This document describes how to set up a GitHub Project board for tracking TinyVerse development.

## Board Structure

Create a new GitHub Project (Projects tab) with the following configuration:

### Board Type
- **Type**: Board
- **Name**: TinyVerse Development Roadmap
- **Description**: Tracks all roadmap items, features, and bugs for TinyVerse

### Columns/Views

#### 1. Kanban View (Default)

**Columns**:
1. **📋 Backlog** - Issues not yet started
2. **🎯 Ready** - Issues ready to be worked on (dependencies met)
3. **🚧 In Progress** - Currently being worked on
4. **👀 Review** - Awaiting review/testing
5. **✅ Done** - Completed
6. **🚫 Blocked** - Blocked by dependencies or external factors

#### 2. Priority View

**Group by**: Priority (Label)
- Critical
- High Priority
- Medium Priority
- Low Priority

**Sort by**: Created date (newest first)

#### 3. Roadmap View

**Layout**: Roadmap (timeline)
**Group by**: Milestone
- v0.1.0 - Stabilization
- v0.2.0 - Backend Foundation
- v0.3.0 - Integration
- v0.4.0 - Simulation Engine
- v1.0.0 - First Release
- v2.0.0 - Advanced Features

#### 4. Component View

**Group by**: Component (Label)
- Frontend
- Backend
- Testing
- Documentation
- TypeScript
- Accessibility

#### 5. Sprint View (Optional)

For agile development:
**Group by**: Iteration/Sprint
**Filter by**: Current sprint issues

## Custom Fields

Add these custom fields to the project:

1. **Effort** (Single select)
   - Low (< 1 day)
   - Medium (1-3 days)
   - High (1-2 weeks)
   - Very High (> 2 weeks)

2. **Status** (Single select)
   - Backlog
   - Ready
   - In Progress
   - Review
   - Done
   - Blocked

3. **Component** (Multi select)
   - Frontend
   - Backend
   - Database
   - API
   - UI/UX
   - Documentation
   - Testing

4. **Sprint** (Iteration field)
   - 2-week iterations

5. **Story Points** (Number)
   - Fibonacci scale: 1, 2, 3, 5, 8, 13

## Automation

Set up these automations:

### Auto-move issues

1. **Issue opened** → Move to "Backlog"
2. **Issue assigned** → Move to "Ready"
3. **PR opened** → Move to "In Progress"
4. **PR merged** → Move to "Review"
5. **Issue closed** → Move to "Done"

### Auto-labels

1. **Contains "[ROADMAP]"** → Add `roadmap` label
2. **Contains "[BUG]"** → Add `bug` label
3. **Contains "[FEATURE]"** → Add `enhancement` label
4. **Has milestone v0.1.0** → Add `critical` label

## Initial Setup Steps

1. **Create the project**
   - Go to repository → Projects → New Project
   - Choose "Board" template
   - Name it "TinyVerse Development Roadmap"

2. **Create views**
   - Add each view described above
   - Configure grouping and filtering

3. **Add custom fields**
   - Project Settings → Custom fields
   - Add each field from the list

4. **Set up automation**
   - Project Settings → Workflows
   - Enable built-in workflows
   - Customize as needed

5. **Populate with issues**
   - Create issues from [ISSUES.md](../ISSUES.md)
   - Use issue templates
   - Add to project automatically

6. **Configure milestones**
   - Repository Settings → Milestones
   - Create each milestone with dates
   - Assign issues to milestones

## Usage Guidelines

### For Contributors

1. **Starting work**:
   - Assign yourself to the issue
   - Move to "In Progress"
   - Update status regularly

2. **Getting blocked**:
   - Move to "Blocked"
   - Comment on what's blocking
   - Tag relevant people

3. **Completing work**:
   - Create PR referencing issue
   - Move to "Review"
   - Request review from team

### For Maintainers

1. **Triage new issues**:
   - Add appropriate labels
   - Assign to milestone
   - Add to project board
   - Set priority

2. **Sprint planning** (if using sprints):
   - Review backlog
   - Prioritize issues
   - Assign to sprint
   - Estimate effort

3. **Weekly review**:
   - Check blocked items
   - Update milestones
   - Review progress
   - Adjust priorities

## Metrics to Track

Monitor these metrics in the Insights tab:

1. **Velocity**: Issues completed per week
2. **Burndown**: Progress toward milestone
3. **Cycle time**: Time from start to completion
4. **Lead time**: Time from creation to completion
5. **WIP**: Work in progress count

## Views for Stakeholders

### Executive View
- Filter: Milestones only
- Show: Progress bars for each milestone
- Update: Weekly

### Developer View
- Filter: Assigned to me + Current sprint
- Show: All details
- Update: Daily

### QA View
- Filter: Status = Review
- Show: Testing notes
- Update: Daily

## Example Project URLs

Once set up, you'll have URLs like:
- Board view: `/orgs/{org}/projects/{number}`
- Roadmap view: `/orgs/{org}/projects/{number}/views/2`
- My issues: `/orgs/{org}/projects/{number}?query=assignee%3A%40me`

## Resources

- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [ROADMAP.md](../ROADMAP.md)
- [ISSUES.md](../ISSUES.md)
- [.github/README.md](./README.md)
