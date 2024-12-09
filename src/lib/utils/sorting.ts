import type { Agent } from '../stores/types';

export function sortAgents(agents: Agent[], sortBy: 'name' | 'occupation' | 'group'): Agent[] {
  return [...agents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'occupation':
        return a.occupation.localeCompare(b.occupation);
      case 'group':
        const aGroup = a.group || '';
        const bGroup = b.group || '';
        return aGroup.localeCompare(bGroup);
      default:
        return 0;
    }
  });
}