<script lang="ts">
  import { agentStore, type Agent } from '../../../stores/agents';
  import { groupStore } from '../../../stores/groups';
  import { createEventDispatcher } from 'svelte';
  import AgentCard from './AgentCard.svelte';
  import GroupContainer from './GroupContainer.svelte';
  import SortSelector from './SortSelector.svelte';

  export let search: string = '';

  const dispatch = createEventDispatcher<{
    edit: Agent;
    viewDetails: Agent;
  }>();

  let agents: Agent[] = [];
  let sortBy: 'name' | 'occupation' | 'group' = 'group';

  agentStore.subscribe(value => {
    agents = value;
  });

  $: filtered = filterAgents(agents, search);
  $: groupedAgents = groupAgents(filtered, $groupStore);

  function filterAgents(list: Agent[], q: string) {
    const term = (q || '').toLowerCase().trim();
    if (!term) return list;
    return list.filter(a =>
      (a.name || '').toLowerCase().includes(term) ||
      (a.occupation || '').toLowerCase().includes(term) ||
      (a.personality_traits || []).join(' ').toLowerCase().includes(term)
    );
  }

  function groupAgents(agents: Agent[], groups: typeof $groupStore) {
    const grouped = new Map();
    
    // Initialize with all groups (including empty ones)
    groups.forEach(group => {
      grouped.set(group.id, {
        group,
        agents: []
      });
    });
    
    // Add ungrouped category
    grouped.set(null, {
      group: null,
      agents: []
    });
    
    // Sort agents into groups
    agents.forEach(agent => {
      const groupId = agent.group || null;
      const groupData = grouped.get(groupId);
      if (groupData) {
        groupData.agents.push(agent);
      }
    });
    
    // Sort agents within each group
    grouped.forEach(groupData => {
      groupData.agents.sort((a: Agent, b: Agent) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'occupation') return a.occupation.localeCompare(b.occupation);
        return 0;
      });
    });
    
    return Array.from(grouped.values()).reverse();
  }
</script>

<div class="p-6 space-y-4">
  <div class="flex justify-end">
    <SortSelector bind:value={sortBy} />
  </div>

  {#each groupedAgents as { group, agents } (group?.id ?? 'ungrouped')}
    <GroupContainer {group} {agents} on:edit on:viewDetails />
  {/each}

  {#if groupedAgents.every(g => g.agents.length === 0)}
    <div class="text-center text-base-content/60 py-12">
      <div class="text-lg font-semibold">No agents match your search</div>
      <div class="text-sm">Try a different term or clear the filter.</div>
    </div>
  {/if}
</div>