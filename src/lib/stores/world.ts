import { writable } from 'svelte/store';
import type { Location, Connection } from './types';
import type { FloorplanDefinition } from '../utils/world/floorplan';
import { api } from '../api';
import { toastStore } from './toast';
import { loadingStore } from './loading';

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
        loadingStore.start('world:locations:fetch');
        const response = await api.getLocations();
        if (response.data) {
          update(state => ({ ...state, locations: response.data! }));
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error);
        toastStore.error('Failed to load locations');
      } finally {
        loadingStore.stop('world:locations:fetch');
      }
    },
    
    // Add location (calls backend)
    addLocation: async (location: Omit<Location, 'id'>) => {
      try {
        loadingStore.start('world:locations:create');
        const response = await api.createLocation(location);
        if (response.data) {
          update(state => ({
            ...state,
            locations: [...state.locations, response.data!]
          }));
          toastStore.success(`Location "${location.name}" created successfully`);
          return response.data;
        }
      } catch (error) {
        console.error('Failed to create location:', error);
        toastStore.error(`Failed to create location "${location.name}"`);
        throw error;
      } finally {
        loadingStore.stop('world:locations:create');
      }
    },
    
    // Update location (calls backend)
    updateLocation: async (id: string, location: Partial<Location>) => {
      try {
        loadingStore.start(`world:locations:update:${id}`);
        const response = await api.updateLocation(id, location);
        if (response.data) {
          update(state => ({
            ...state,
            locations: state.locations.map(l => l.id === id ? response.data! : l)
          }));
          toastStore.success('Location updated successfully');
          return response.data;
        }
      } catch (error) {
        console.error('Failed to update location:', error);
        toastStore.error('Failed to update location');
        throw error;
      } finally {
        loadingStore.stop(`world:locations:update:${id}`);
      }
    },
    
    // Remove location (calls backend)
    removeLocation: async (id: string) => {
      try {
        loadingStore.start(`world:locations:delete:${id}`);
        const response = await fetch(`${api.getConfig().baseUrl}/locations/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete location');
        update(state => ({
          ...state,
          locations: state.locations.filter(loc => loc.id !== id)
        }));
        toastStore.success('Location deleted successfully');
      } catch (error) {
        console.error('Failed to delete location:', error);
        toastStore.error('Failed to delete location');
        throw error;
      } finally {
        loadingStore.stop(`world:locations:delete:${id}`);
      }
    },
    
    // Fetch connections from backend
    fetchConnections: async () => {
      try {
        loadingStore.start('world:connections:fetch');
        const response = await fetch(`${api.getConfig().baseUrl}/world/connections`);
        if (!response.ok) throw new Error('Failed to fetch connections');
        const data = await response.json();
        update(state => ({ ...state, connections: data }));
      } catch (error) {
        console.error('Failed to fetch connections:', error);
        toastStore.error('Failed to load connections');
      } finally {
        loadingStore.stop('world:connections:fetch');
      }
    },
    
    addConnection: async (connection: Omit<Connection, 'id' | 'created_at'>) => {
      try {
        loadingStore.start('world:connections:create');
        const response = await fetch(`${api.getConfig().baseUrl}/world/connections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(connection)
        });
        if (!response.ok) throw new Error('Failed to create connection');
        const data = await response.json();
        update(state => ({
          ...state,
          connections: [...state.connections, data]
        }));
        toastStore.success('Connection created successfully');
        return data;
      } catch (error) {
        console.error('Failed to create connection:', error);
        toastStore.error('Failed to create connection');
        throw error;
      } finally {
        loadingStore.stop('world:connections:create');
      }
    },
    
    removeConnection: async (id: string) => {
      try {
        loadingStore.start(`world:connections:delete:${id}`);
        const response = await fetch(`${api.getConfig().baseUrl}/world/connections/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete connection');
        update(state => ({
          ...state,
          connections: state.connections.filter(conn => conn.id !== id)
        }));
        toastStore.success('Connection deleted successfully');
      } catch (error) {
        console.error('Failed to delete connection:', error);
        toastStore.error('Failed to delete connection');
        throw error;
      } finally {
        loadingStore.stop(`world:connections:delete:${id}`);
      }
    },
    
    // Fetch simulation state from backend
    fetchSimulationState: async () => {
      try {
        loadingStore.start('world:simulation:fetch');
        const response = await api.getSimulationState();
        if (response.data) {
          update(state => ({ ...state, simulationState: response.data }));
        }
      } catch (error) {
        console.error('Failed to fetch simulation state:', error);
        toastStore.error('Failed to load simulation state');
      } finally {
        loadingStore.stop('world:simulation:fetch');
      }
    },

    seedWorld: (locations: Location[], connections: Connection[]) => {
      update(state => ({
        ...state,
        locations,
        connections
      }));
    },

    applyFloorplan: (floorplan: FloorplanDefinition) => {
      update(state => ({
        ...state,
        locations: floorplan.locations,
        connections: floorplan.connections,
        simulationState: {
          ...(state.simulationState ?? {}),
          floorplanName: floorplan.name
        }
      }));
      return floorplan;
    }
  };
}

export const worldStore = createWorldStore();
