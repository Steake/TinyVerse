# TinyVerse 🎭

TinyVerse is a powerful simulation platform for creating and managing AI agent scenarios. Design virtual worlds, craft detailed agent personalities, establish complex relationships, and watch your simulations come to life.

## ✨ Features

### 🎭 Playwright's Desk
The creative workspace where you build your simulation world:

- **World Builder**: Design locations, create connections, and build immersive environments
- **Casting Call**: Create and manage AI agents with detailed profiles including:
  - Demographics (age, occupation, nationality)
  - Personality traits and interests
  - Skills and expertise levels
  - Daily routines and schedules
  - Group assignments
- **Relationship Network**: Visualize and edit agent relationships with an interactive network graph
- **Mind Palace**: Configure mental faculties and cognitive parameters for agents

### 🎬 Grand Stage
Watch your simulation unfold in real-time:

- **Live Simulation**: Observe agents as they move, interact, and communicate
- **Simulation Controls**: Start, pause, and control simulation speed
- **Agent Tracking**: Follow individual agents through their daily activities
- **Visual Environment**: See your designed world with agents positioned in real-time
- **Speech Bubbles**: View agent conversations and thoughts

### 📊 Critic's Corner
Analyze and extract insights from your simulations:

- **Data Visualizer**: Generate charts and graphs from simulation data
- **Story Generator**: Create narrative stories from simulation logs with customizable styles:
  - Descriptive narratives
  - Dramatic storytelling
  - Humorous tales
- **Results Extractor**: Export simulation data in various formats (CSV, JSON)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Steake/TinyVerse.git
cd TinyVerse
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🛠️ Tech Stack

- **Frontend Framework**: [Svelte](https://svelte.dev/) 4.x
- **Language**: TypeScript
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Visualization**: [D3.js](https://d3js.org/), [Chart.js](https://www.chartjs.org/)
- **Animation**: [GSAP](https://greensock.com/gsap/)
- **Rich Text**: [Tiptap](https://tiptap.dev/)

## 📁 Project Structure

```
TinyVerse/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── playwright/      # World & agent creation
│   │   │   ├── grand-stage/     # Simulation runtime
│   │   │   ├── critics-corner/  # Analysis & export
│   │   │   ├── layout/          # App layout
│   │   │   └── common/          # Shared components
│   │   ├── stores/              # Svelte stores for state
│   │   ├── api/                 # API client
│   │   └── utils/               # Utilities & mock data
│   ├── App.svelte               # Main application
│   └── main.ts                  # Entry point
├── public/                      # Static assets
├── API_spec.md                  # API specification
└── package.json
```

## 📖 Usage

### Creating Your First Simulation

1. **Design Your World** (Playwright's Desk → World Builder)
   - Add locations (rooms, outdoor spaces, special areas)
   - Connect locations with paths, doors, or portals
   - Position elements on the canvas

2. **Create Agents** (Playwright's Desk → Casting Call)
   - Define agent profiles with detailed characteristics
   - Set personality traits and interests
   - Assign skills and expertise
   - Create daily routines

3. **Establish Relationships** (Playwright's Desk → Relationship Network)
   - Connect agents as friends, colleagues, family, or rivals
   - Set relationship strength and descriptions
   - Visualize the social network

4. **Run Simulation** (Grand Stage)
   - Start the simulation
   - Observe agent behaviors and interactions
   - Monitor conversations and movements

5. **Analyze Results** (Critic's Corner)
   - Generate visualizations
   - Create narrative stories
   - Export data for further analysis

## 🔧 Development

### Type Checking

```bash
npm run check
```

### Code Style

This project uses TypeScript strict mode and follows Svelte best practices.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 API Documentation

See [API_spec.md](./API_spec.md) for detailed API documentation including:
- Agent management endpoints
- World building endpoints
- Simulation control endpoints
- Data models and schemas

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built with Svelte, powered by Vite, and styled with TailwindCSS and DaisyUI.

---

**Note**: This is an experimental platform for AI agent simulation research and creative storytelling.
