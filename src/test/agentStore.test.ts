import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { agentStore } from '../lib/stores/agents';
import type { Agent } from '../lib/stores/types';

describe('agentStore', () => {
  it('adds an agent', () => {
    const testAgent: Agent = {
      id: 'test-1',
      name: 'Test Agent',
      age: 30,
      occupation: 'Tester',
      occupationDescription: 'Testing software',
      nationality: 'Test',
      countryOfResidence: 'Testland',
      routines: [],
      personalityTraits: ['curious'],
      professionalInterests: ['testing'],
      personalInterests: ['reading'],
      skills: [],
      relationships: [],
      backstory: 'A test agent',
      emoji: '🧪'
    };

    agentStore.addAgent(testAgent);
    const agents = get(agentStore);
    
    expect(agents).toContainEqual(testAgent);
  });

  it('updates an agent', () => {
    const agents = get(agentStore);
    if (agents.length > 0) {
      const agent = agents[0];
      const updatedAgent = { ...agent, name: 'Updated Name' };
      
      agentStore.updateAgent(updatedAgent);
      const newAgents = get(agentStore);
      
      expect(newAgents.find(a => a.id === agent.id)?.name).toBe('Updated Name');
    }
  });

  it('removes an agent', () => {
    const agents = get(agentStore);
    if (agents.length > 0) {
      const agentId = agents[0].id;
      
      agentStore.removeAgent(agentId);
      const newAgents = get(agentStore);
      
      expect(newAgents.find(a => a.id === agentId)).toBeUndefined();
    }
  });
});
