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

function createWorldStore() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    set,
    update,
    
    addLocation: (location: Location) => {
      update(state => ({
        ...state,
        locations: [...state.locations, location]
      }));
    },
    
    removeLocation: (id: UUID) => {
      update(state => ({
        ...state,
        locations: state.locations.filter(loc => loc.id !== id)
      }));
    },
    
    addConnection: (connection: Connection) => {
      update(state => ({
        ...state,
        connections: [...state.connections, connection]
      }));
    },
    
    removeConnection: (id: UUID) => {
      update(state => ({
        ...state,
        connections: state.connections.filter(conn => conn.id !== id)
      }));
    },
    
    fetchSimulationState: async () => {
      try {
        // TODO: Implement when backend API is ready
        // const simulationState = await api.getSimulationState();
        // update(state => ({ ...state, simulationState }));
        console.warn('getSimulationState not yet implemented in backend');
      } catch (error) {
        console.error('Failed to fetch simulation state:', error);
      }
    }
  };
}

export const worldStore = createWorldStore();
