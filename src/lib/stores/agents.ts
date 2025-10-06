import { writable } from 'svelte/store';
import { api } from '../api';
import type { Agent, Skill, Routine, Relationship } from './types';

export type { Agent, Skill, Routine, Relationship };

const createAgentStore = () => {
  const { subscribe, set, update } = writable<Agent[]>([]);

  return {
    subscribe,
    
    // Load agents from backend
    fetchAgents: async () => {
      try {
        const response = await api.getAgents();
        if (response.data) {
          set(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    },
    
    // Add agent (calls backend)
    addAgent: async (agent: Omit<Agent, 'id' | 'created_at'>) => {
      try {
        const response = await api.createAgent(agent);
        if (response.data) {
          update(agents => [...agents, response.data!]);
          return response.data;
        }
      } catch (error) {
        console.error('Failed to create agent:', error);
        throw error;
      }
    },
    
    // Update agent (calls backend)
    updateAgent: async (agent: Agent) => {
      try {
        const response = await api.updateAgent(agent.id, agent);
        if (response.data) {
          update(agents => 
            agents.map(a => a.id === agent.id ? response.data! : a)
          );
          return response.data;
        }
      } catch (error) {
        console.error('Failed to update agent:', error);
        throw error;
      }
    },
    
    // Remove agent (calls backend)
    removeAgent: async (id: string) => {
      try {
        await api.deleteAgent(id);
        update(agents => agents.filter(a => a.id !== id));
      } catch (error) {
        console.error('Failed to delete agent:', error);
        throw error;
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
    )
  };
};

export const agentStore = createAgentStore();