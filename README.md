# TinyVerse Stage

> An interactive platform for creating and simulating AI agents in virtual environments

[![Build Status](https://img.shields.io/badge/build-in%20progress-yellow)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)]()
[![Svelte](https://img.shields.io/badge/Svelte-4.2-orange)]()

## 📚 Documentation

- **[Repository Evaluation](./EVALUATION.md)** - Comprehensive project assessment
- **[Quick Start Guide](./QUICK_START.md)** - Get started in 5 minutes
- **[Development Roadmap](./ROADMAP.md)** - Detailed development plan
- **[Architecture Guide](./ARCHITECTURE.md)** - System architecture and design
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute
- **[API Specification](./API_spec.md)** - Complete API documentation

## 🎭 What is TinyVerse Stage?

TinyVerse Stage is a web-based simulation platform where you can:

- 🎨 **Design Agents**: Create AI agents with unique personalities, skills, and backstories
- 🗺️ **Build Worlds**: Construct virtual environments with locations and connections
- 🎬 **Run Simulations**: Watch agents interact in real-time with intelligent behaviors
- 📊 **Analyze Results**: Visualize data and extract insights from simulations
- 📖 **Generate Stories**: Transform simulation events into engaging narratives

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:5173
```

⚠️ **Note**: The project is currently under active development. Build errors are expected as the backend API is being implemented.

## 🏗️ Project Structure

```
TinyVerse/
├── src/
│   ├── App.svelte              # Main application entry
│   └── lib/
│       ├── api/                # API client and types
│       ├── components/         # UI components
│       │   ├── playwright/     # Design tools
│       │   ├── grand-stage/    # Simulation viewer
│       │   ├── critics-corner/ # Analysis tools
│       │   ├── common/         # Shared components
│       │   └── layout/         # Layout components
│       ├── stores/             # State management
│       └── utils/              # Utility functions
├── API_spec.md                 # API documentation
├── ROADMAP.md                  # Development roadmap
└── QUICK_START.md              # Quick start guide
```

## ✨ Features

### Playwright's Desk (Design Phase)
- **World Builder**: Create and manage locations, paths, and environments
- **Casting Call**: Design agents with rich personalities and relationships
- **Relationship Network**: Visualize and manage agent interactions with D3.js
- **Mind Palace**: Organize agent cognitive faculties and memories

### Grand Stage (Simulation Phase)
- Real-time agent visualization with smooth animations (GSAP)
- Time controls (play, pause, speed adjustment)
- Interactive agent tracking and inspection
- Dynamic environment rendering

### Critic's Corner (Analysis Phase)
- Data visualization with Chart.js
- Event log extraction and filtering
- Story generation from simulation events (AI-powered)
- Export results in multiple formats

## 🛠️ Technology Stack

- **Frontend**: Svelte 4 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + DaisyUI
- **Visualization**: D3.js, Chart.js, GSAP
- **Rich Text**: TiptapEditor
- **Data Processing**: PapaParse, JSZip

## 📋 Current Status

- ✅ UI components completed (~7,500 lines of code)
- ✅ API specification defined
- ⚠️ TypeScript compilation issues (62 errors to fix)
- ⏳ Backend API implementation (in progress)
- ⏳ Frontend-backend integration (pending)
- ❌ Simulation engine (not started)
- ❌ Testing infrastructure (not started)

See [ROADMAP.md](./ROADMAP.md) for detailed status and plans.

## 🎯 Immediate Priorities

1. **Fix Build Issues** - Resolve TypeScript compilation errors
2. **Implement Backend** - Create REST API server
3. **Integration** - Connect frontend to backend
4. **Testing** - Add unit and integration tests

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Read the [ROADMAP.md](./ROADMAP.md) to understand project goals
2. Check existing issues or create a new one
3. Fork the repository and create a feature branch
4. Make your changes and test thoroughly
5. Submit a pull request with a clear description

Priority areas for contribution:
- Fixing TypeScript errors
- Implementing backend API
- Adding tests
- Improving accessibility

## 📖 Learning Resources

- [Svelte Tutorial](https://svelte.dev/tutorial)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [D3.js Documentation](https://d3js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [DaisyUI Components](https://daisyui.com/components/)

## 🐛 Known Issues

- TypeScript compilation fails (62 errors) - being addressed
- Backend API not implemented - in progress
- No tests currently - testing infrastructure planned
- Some accessibility warnings - improvements planned

See [GitHub Issues](../../issues) for complete list.

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

Built with Svelte, TypeScript, and Vite.

---

**Status**: 🚧 Active Development  
**Version**: 0.0.0 (Pre-Alpha)  
**Last Updated**: 2025

For more details, see:
- [Repository Evaluation](./EVALUATION.md)
- [Quick Start Guide](./QUICK_START.md)
- [Development Roadmap](./ROADMAP.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [API Documentation](./API_spec.md)
