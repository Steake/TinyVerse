import { writable } from 'svelte/store';
import { api } from '../api';
import type { Agent, Skill, Routine, Relationship } from './types';
import { toastStore } from './toast';
import { loadingStore } from './loading';

export type { Agent, Skill, Routine, Relationship };

const createAgentStore = () => {
  const { subscribe, set, update } = writable<Agent[]>([]);

  return {
    subscribe,
    
    // Load agents from backend
    fetchAgents: async () => {
      try {
        loadingStore.start('agents:fetch');
        const response = await api.getAgents();
        if (response.data) {
          set(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        toastStore.error('Failed to load agents');
      } finally {
        loadingStore.stop('agents:fetch');
      }
    },
    
    // Add agent (calls backend)
    addAgent: async (agent: Omit<Agent, 'id' | 'created_at'>) => {
      try {
        loadingStore.start('agents:create');
        const response = await api.createAgent(agent);
        if (response.data) {
          update(agents => [...agents, response.data!]);
          toastStore.success(`Agent "${agent.name}" created successfully`);
          return response.data;
        }
      } catch (error) {
        console.error('Failed to create agent:', error);
        toastStore.error(`Failed to create agent "${agent.name}"`);
        throw error;
      } finally {
        loadingStore.stop('agents:create');
      }
    },
    
    // Update agent (calls backend)
    updateAgent: async (agent: Agent) => {
      try {
        loadingStore.start(`agents:update:${agent.id}`);
        const response = await api.updateAgent(agent.id, agent);
        if (response.data) {
          update(agents => 
            agents.map(a => a.id === agent.id ? response.data! : a)
          );
          toastStore.success(`Agent "${agent.name}" updated successfully`);
          return response.data;
        }
      } catch (error) {
        console.error('Failed to update agent:', error);
        toastStore.error(`Failed to update agent "${agent.name}"`);
        throw error;
      } finally {
        loadingStore.stop(`agents:update:${agent.id}`);
      }
    },
    
    // Remove agent (calls backend)
    removeAgent: async (id: string) => {
      try {
        loadingStore.start(`agents:delete:${id}`);
        await api.deleteAgent(id);
        update(agents => agents.filter(a => a.id !== id));
        toastStore.success('Agent deleted successfully');
      } catch (error) {
        console.error('Failed to delete agent:', error);
        toastStore.error('Failed to delete agent');
        throw error;
      } finally {
        loadingStore.stop(`agents:delete:${id}`);
      }
    },
    
    getAgent: (id: string) => {
      let foundAgent: Agent | undefined;
      update(agents => {
        foundAgent = agents.find(a => a.id === id);
        return agents;
      });
      return foundAgent;
    },
    
    addRelationship: (agentId: string, relationship: Relationship) => update(agents =>
      agents.map(a => a.id === agentId ? {
        ...a,
        relationships: [...(a.relationships || []), relationship]
      } : a)
    ),
    
    // Bulk import agents
    importAgents: async (file: File) => {
      try {
        loadingStore.start('agents:import');
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${api.getConfig().baseUrl}/agents/import`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error('Import failed');
        
        const result = await response.json();
        if (result.data) {
          update(agents => [...agents, ...result.data]);
          toastStore.success(`Imported ${result.data.length} agents successfully`);
        }
      } catch (error) {
        console.error('Failed to import agents:', error);
        toastStore.error('Failed to import agents');
        throw error;
      } finally {
        loadingStore.stop('agents:import');
      }
    },
    
    // Bulk export agents
    exportAgents: async () => {
      try {
        loadingStore.start('agents:export');
        const response = await fetch(`${api.getConfig().baseUrl}/agents/export`);
        
        if (!response.ok) throw new Error('Export failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'agents_export.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toastStore.success('Agents exported successfully');
      } catch (error) {
        console.error('Failed to export agents:', error);
        toastStore.error('Failed to export agents');
        throw error;
      } finally {
        loadingStore.stop('agents:export');
      }
    }
  };
};

export const agentStore = createAgentStore();