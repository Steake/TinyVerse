import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { agentStore } from '../lib/stores/agents';
import type { Agent } from '../lib/stores/types';

vi.mock('../lib/api', () => {
  return {
    api: {
      createAgent: vi.fn(async (payload: any) => ({ data: { id: 'test-1', ...payload } })),
      updateAgent: vi.fn(async (id: string, payload: any) => ({ data: { id, ...payload } })),
      deleteAgent: vi.fn(async (_id: string) => ({ data: undefined }))
    }
  };
});

vi.mock('../lib/stores/toast', () => ({
  toastStore: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../lib/stores/loading', () => ({
  loadingStore: {
    start: vi.fn(),
    stop: vi.fn()
  }
}));

describe('agentStore', () => {
  beforeEach(() => {
    // Reset store to empty before each test
    (agentStore as any).seed([]);
  });

  it('adds an agent', async () => {
    const testAgent: Omit<Agent, 'id' | 'created_at'> = {
      name: 'Test Agent',
      age: 30,
      occupation: 'Tester',
      occupation_description: 'Testing software',
      nationality: 'Test',
      country_of_residence: 'Testland',
      routines: [],
      personality_traits: ['curious'],
      professional_interests: ['testing'],
      personal_interests: ['reading'],
      skills: [],
      relationships: [],
      backstory: 'A test agent',
      emoji: '🧪'
    };

    await agentStore.addAgent(testAgent);
    const agents = get(agentStore);
    
    expect(agents.find(a => a.id === 'test-1')?.name).toBe('Test Agent');
  });

  it('updates an agent', async () => {
    await agentStore.addAgent({
      name: 'Original',
      age: 1,
      occupation: '',
      occupation_description: '',
      nationality: '',
      country_of_residence: '',
      routines: [],
      personality_traits: [],
      professional_interests: [],
      personal_interests: [],
      skills: [],
      relationships: [],
      backstory: '',
      emoji: '😀'
    });
    const agents = get(agentStore);
    const agent = agents[0];
    const updatedAgent = { ...agent, name: 'Updated Name' } as Agent;
    
    await agentStore.updateAgent(updatedAgent);
    const newAgents = get(agentStore);
    
    expect(newAgents.find(a => a.id === agent.id)?.name).toBe('Updated Name');
  });

  it('removes an agent', async () => {
    await agentStore.addAgent({
      name: 'To Remove',
      age: 1,
      occupation: '',
      occupation_description: '',
      nationality: '',
      country_of_residence: '',
      routines: [],
      personality_traits: [],
      professional_interests: [],
      personal_interests: [],
      skills: [],
      relationships: [],
      backstory: '',
      emoji: '😀'
    });
    const agents = get(agentStore);
    const agentId = agents[0].id;
    
    await agentStore.removeAgent(agentId);
    const newAgents = get(agentStore);
    
    expect(newAgents.find(a => a.id === agentId)).toBeUndefined();
  });
});
