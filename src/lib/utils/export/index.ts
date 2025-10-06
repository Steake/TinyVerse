import { get } from 'svelte/store';
import { worldStore } from '../../stores/world';
import { agentStore } from '../../stores/agents';
import { simulationStore } from '../../stores/simulation';
import type { ExportFormat, ExportOptions } from './types';

export async function exportProject(format: ExportFormat, options: ExportOptions = {}) {
  const data = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    world: await exportWorld(),
    agents: await exportAgents(),
    simulation: await exportSimulation(),
    ...options
  };

  const content = format === 'json' 
    ? JSON.stringify(data, null, 2)
    : convertToYAML(data);

  const blob = new Blob([content], { 
    type: format === 'json' ? 'application/json' : 'text/yaml' 
  });

  downloadFile(blob, `tinyverse-export.${format}`);
}

async function exportWorld() {
  const world = get(worldStore);
  return {
    locations: world.locations,
    connections: world.connections
  };
}

async function exportAgents() {
  return get(agentStore);
}

async function exportSimulation() {
  const state = get(simulationStore);
  return {
    logs: state.logs,
    currentState: {
      isRunning: state.isRunning,
      currentTime: state.currentTime,
      speed: state.speed
    }
  };
}

function convertToYAML(data: any): string {
  // Simple YAML conversion for demonstration
  return Object.entries(data)
    .map(([key, value]) => `${key}: ${JSON.stringify(value, null, 2)}`)
    .join('\n');
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}