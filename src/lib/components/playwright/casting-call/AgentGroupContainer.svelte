<script lang="ts">
  import type { Agent } from '../../../stores/types';
  import type { AgentGroup } from '../../../stores/groups';
  import { agentStore } from '../../../stores/agents';
  import AgentCard from './AgentCard.svelte';
  import { createEventDispatcher } from 'svelte';

  export let group: AgentGroup | null;
  export let agents: Agent[];

  const dispatch = createEventDispatcher<{
    edit: Agent;
  }>();

  let isDragOver = false;

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    isDragOver = true;
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;

    const data = event.dataTransfer?.getData('application/json');
    if (!data) return;

    const { agentId, sourceGroupId } = JSON.parse(data);
    if (sourceGroupId !== (group?.id ?? null)) {
      const agent = agentStore.getAgent(agentId);
      if (agent) {
        agentStore.updateAgent({
          ...agent,
          group: group?.id ?? null
        });
      }
    }
  }
</script>

<div 
  class="bg-base-100 border-2 rounded-lg p-4 mb-6 transition-colors duration-200"
  class:border-primary={isDragOver}
  class:border-base-300={!isDragOver}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
>
  <h3 class="text-lg font-semibold mb-4">
    {group ? group.name : 'Ungrouped Agents'}
  </h3>
  
  <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
    {#each agents as agent (agent.id)}
      <AgentCard 
        {agent}
        on:edit={event => dispatch('edit', event.detail)}
      />
    {/each}
  </div>
</div>