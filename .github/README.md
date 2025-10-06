# GitHub Configuration

This directory contains GitHub-specific configuration for the TinyVerse repository.

## Structure

```
.github/
├── ISSUE_TEMPLATE/          # Issue templates
│   ├── roadmap-task.md      # Template for roadmap items
│   ├── bug-report.md        # Template for bug reports
│   └── feature-request.md   # Template for feature requests
├── workflows/               # GitHub Actions workflows
│   ├── ci.yml               # Continuous integration
│   └── roadmap-tracker.yml  # Roadmap progress tracking
└── README.md               # This file
```

## Issue Templates

### Roadmap Task
Use for tracking major roadmap items from [ROADMAP.md](../ROADMAP.md).

Example: "[ROADMAP] Fix TypeScript Compilation Errors"

### Bug Report
Use for reporting bugs or issues in the application.

Example: "[BUG] Agent creation form validation not working"

### Feature Request
Use for proposing new features or enhancements.

Example: "[FEATURE] Add drag-and-drop for agent placement"

## Workflows

### CI (ci.yml)
Runs on every push and pull request to main branches:
- **Frontend**: Install deps, run TypeScript check, build
- **Backend**: Install deps, run tests

Note: Some steps use `continue-on-error: true` until critical issues are fixed.

### Roadmap Tracker (roadmap-tracker.yml)
Runs weekly (Mondays) and on issue updates:
- Tracks progress on roadmap issues
- Future: Auto-update ROADMAP.md with completion status

## Labels

Standard labels for issue organization:
- `roadmap` - Major roadmap items
- `critical` - Critical priority
- `high-priority` - High priority
- `medium-priority` - Medium priority
- `low-priority` - Low priority
- `bug` - Bug reports
- `enhancement` - New features
- `documentation` - Documentation
- `backend` - Backend work
- `frontend` - Frontend work
- `testing` - Testing infrastructure
- `typescript` - TypeScript issues
- `accessibility` - Accessibility improvements

## Milestones

Create these milestones in GitHub:
1. **v0.1.0 - Stabilization** (Weeks 1-2)
2. **v0.2.0 - Backend Foundation** (Weeks 3-4)
3. **v0.3.0 - Integration** (Weeks 5-6)
4. **v0.4.0 - Simulation Engine** (Months 3-4)
5. **v1.0.0 - First Release** (Month 6)
6. **v2.0.0 - Advanced Features** (Months 6-12)

## Getting Started

1. Review [ISSUES.md](../ISSUES.md) for recommended issues to create
2. Use the appropriate issue template
3. Add relevant labels and milestone
4. Link issues to related documentation sections
5. Set dependencies between issues where applicable

## Resources

- [ROADMAP.md](../ROADMAP.md) - Development roadmap
- [ISSUES.md](../ISSUES.md) - Issue tracking guide
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture
