import { writable } from 'svelte/store';
import type { UUID } from '../api/types/index';
import { api } from '../api';

export type Location = {
  id: UUID;
  name: string;
  description?: string;
  type: 'room' | 'outdoor' | 'special';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Connection = {
  id: UUID;
  source: UUID;
  target: UUID;
  type: 'path' | 'door' | 'portal';
};

export type WorldState = {
  locations: Location[];
  connections: Connection[];
  simulationState: any;
};

const initialState: WorldState = {
  locations: [],
  connections: [],
  simulationState: null
};

export const worldStore = writable(initialState);

async function fetchSimulationState() {
  try {
    const simulationState = await api.getSimulationState();
    worldStore.update(state => ({ ...state, simulationState }));
  } catch (error) {
    console.error('Failed to fetch simulation state:', error);
  }
}

fetchSimulationState();
