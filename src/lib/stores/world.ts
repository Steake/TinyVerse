import { writable } from 'svelte/store';
import type { Location, Connection } from './types';
import { api } from '../api';

export type { Location, Connection };

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
    
    // Fetch locations from backend
    fetchLocations: async () => {
      try {
        const response = await api.getLocations();
        if (response.data) {
          update(state => ({ ...state, locations: response.data! }));
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    },
    
    // Add location (calls backend)
    addLocation: async (location: Omit<Location, 'id'>) => {
      try {
        const response = await api.createLocation(location);
        if (response.data) {
          update(state => ({
            ...state,
            locations: [...state.locations, response.data!]
          }));
          return response.data;
        }
      } catch (error) {
        console.error('Failed to create location:', error);
        throw error;
      }
    },
    
    // Remove location (calls backend)
    removeLocation: async (id: string) => {
      try {
        await api.updateLocation(id, {}); // Backend doesn't have delete endpoint, using update for now
        update(state => ({
          ...state,
          locations: state.locations.filter(loc => loc.id !== id)
        }));
      } catch (error) {
        console.error('Failed to delete location:', error);
        throw error;
      }
    },
    
    addConnection: (connection: Connection) => {
      update(state => ({
        ...state,
        connections: [...state.connections, connection]
      }));
    },
    
    removeConnection: (id: string) => {
      update(state => ({
        ...state,
        connections: state.connections.filter(conn => conn.id !== id)
      }));
    },
    
    // Fetch simulation state from backend
    fetchSimulationState: async () => {
      try {
        const response = await api.getSimulationState();
        if (response.data) {
          update(state => ({ ...state, simulationState: response.data }));
        }
      } catch (error) {
        console.error('Failed to fetch simulation state:', error);
      }
    }
  };
}

export const worldStore = createWorldStore();
