import { writable } from 'svelte/store';
import type { AgentGroup } from './types';

export type { AgentGroup } from './types';

function createGroupStore() {
  const { subscribe, set, update } = writable<AgentGroup[]>([
    { id: 'main', name: 'Main Cast' },
    { id: 'supporting', name: 'Supporting Cast' },
    { id: 'extras', name: 'Extras' }
  ]);

  return {
    subscribe,
    addGroup: (group: AgentGroup) => update(groups => [...groups, group]),
    removeGroup: (id: string) => update(groups => groups.filter(g => g.id !== id)),
    updateGroup: (id: string, name: string) => update(groups =>
      groups.map(g => g.id === id ? { ...g, name } : g)
    )
  };
}

export const groupStore = createGroupStore();