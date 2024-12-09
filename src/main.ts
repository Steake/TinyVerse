import './app.css';
import App from './App.svelte';
import { agentStore } from './lib/stores/agents';
import { worldStore } from './lib/stores/world';
import { simulationStore } from './lib/stores/simulation';
import { facultyStore } from './lib/stores/faculties';
import { initializeMockData } from './lib/utils/mock-data';

// Initialize mock data
initializeMockData({
  agentStore,
  worldStore,
  simulationStore,
  facultyStore
});

const app = new App({
  target: document.getElementById('app')!,
});

export default app;