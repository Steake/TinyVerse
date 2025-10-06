# TinyVerse Stage - Quick Start Guide

## What is TinyVerse Stage?

TinyVerse Stage is a web-based platform for creating and simulating AI agents in virtual environments. Think of it as a "SimCity for AI agents" where you can:
- Design agents with unique personalities, skills, and relationships
- Build virtual worlds with locations and connections
- Run simulations and watch agents interact
- Generate stories from simulation events
- Analyze agent behavior and relationships

## Project Status

✅ **Completed**:
- UI components for all major features
- API specification document
- Component architecture

⚠️ **In Progress**:
- TypeScript compilation (62 errors to fix)
- Backend API implementation (not started)
- Frontend-backend integration

❌ **Not Started**:
- Simulation engine logic
- Story generation (LLM integration)
- Testing infrastructure
- Deployment

## Quick Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Check for errors (currently fails)
npm run check

# Build for production (currently fails)
npm run build
```

## Project Structure

```
TinyVerse/
├── src/
│   ├── App.svelte                 # Main application
│   ├── lib/
│   │   ├── api/                   # API client (needs backend)
│   │   ├── components/
│   │   │   ├── playwright/        # Design workspace
│   │   │   ├── grand-stage/       # Simulation viewer
│   │   │   ├── critics-corner/    # Analysis tools
│   │   │   ├── common/            # Shared components
│   │   │   └── layout/            # Layout components
│   │   ├── stores/                # State management
│   │   └── utils/                 # Utilities
├── API_spec.md                    # API documentation
├── ROADMAP.md                     # Development roadmap
└── package.json                   # Dependencies
```

## Core Features

### 1. Playwright's Desk (Design)
- **World Builder**: Create locations and paths
- **Casting Call**: Design agents with personalities
- **Relationship Network**: Visualize connections
- **Mind Palace**: Organize agent cognition

### 2. Grand Stage (Simulation)
- Real-time agent visualization
- Time controls (play, pause, speed)
- Agent animations and interactions

### 3. Critic's Corner (Analysis)
- Data visualization with charts
- Event log extraction
- Story generation from events

## Immediate Priorities

### Week 1: Fix Build
- [ ] Fix 62 TypeScript errors
- [ ] Address 54 accessibility warnings
- [ ] Get clean build working

### Week 2-4: Backend
- [ ] Set up Express/Fastify server
- [ ] Implement API endpoints
- [ ] Add database for persistence
- [ ] Connect frontend to backend

### Week 5-6: Testing
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Set up CI/CD

## Tech Stack

- **Frontend**: Svelte 4 + TypeScript + Vite
- **Styling**: Tailwind CSS + DaisyUI
- **Visualization**: D3.js, Chart.js, GSAP
- **Backend**: TBD (Express/Fastify recommended)
- **Database**: TBD (PostgreSQL/SQLite recommended)

## Key Files to Understand

1. `src/App.svelte` - Main app entry point
2. `src/lib/api/client/API.ts` - API client interface
3. `API_spec.md` - Complete API specification
4. `src/lib/stores/` - Application state
5. `ROADMAP.md` - Detailed development plan

## Common Issues

**Build Failing?**
- TypeScript errors are expected (work in progress)
- Use `npm run dev` to run anyway (with warnings)

**No Data Showing?**
- Backend API not implemented yet
- Currently uses mock data in stores

**API Calls Failing?**
- Expected - backend server doesn't exist yet
- Check console for mock responses

## Contributing

See [ROADMAP.md](./ROADMAP.md) for detailed tasks. Priority areas:
1. Fix TypeScript errors
2. Implement backend API
3. Add tests
4. Improve accessibility

## Getting Help

- Check ROADMAP.md for detailed documentation
- Review API_spec.md for API details
- Look at existing components for patterns
- Check GitHub issues for known problems

## License

[Add license information]

---

**Ready to contribute?** Start with fixing TypeScript errors in `src/lib/api/client.ts` and `src/lib/stores/`.
