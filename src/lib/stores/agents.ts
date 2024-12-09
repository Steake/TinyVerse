import { writable } from 'svelte/store';

export interface Agent {
  id: string;
  name: string;
  age: number;
  occupation: string;
  occupationDescription: string;
  nationality: string;
  countryOfResidence: string;
  routines: Routine[];
  personalityTraits: string[];
  professionalInterests: string[];
  personalInterests: string[];
  skills: Skill[];
  relationships: Relationship[];
  backstory: string;
  profilePicture?: string;
  emoji: string;
  group?: string;
}

export interface Routine {
  id: string;
  name: string;
  schedule: string;
  location: string;
  duration: number;
}

export interface Skill {
  name: string;
  level: number; // 1-5
}

export interface Relationship {
  targetId: string;
  type: 'friend' | 'colleague' | 'family' | 'rival';
  strength: number; // 1-5
  description: string;
}

const createAgentStore = () => {
  const { subscribe, set, update } = writable<Agent[]>([]);

  return {
    subscribe,
    addAgent: (agent: Agent) => update(agents => [...agents, agent]),
    updateAgent: (agent: Agent) => update(agents => 
      agents.map(a => a.id === agent.id ? agent : a)
    ),
    removeAgent: (id: string) => update(agents => 
      agents.filter(a => a.id !== id)
    ),
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
        relationships: [...a.relationships, relationship]
      } : a)
    )
  };
};

export const agentStore = createAgentStore();