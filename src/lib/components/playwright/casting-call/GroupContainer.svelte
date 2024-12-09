<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Agent } from '../../../stores/types';
  import type { AgentGroup } from '../../../stores/groups';
  import { agentStore } from '../../../stores/agents';
  import AgentCard from './AgentCard.svelte';
  import GroupHeader from './GroupHeader.svelte';

  export let group: AgentGroup | null;
  export let agents: Agent[];

  const dispatch = createEventDispatcher<{
    edit: Agent;
  }>();

  let isDragOver = false;
  let draggedAgent: Agent | null = null;
  let dragOverIndex = -1;

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    isDragOver = true;

    const container = event.currentTarget as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const mouseX = event.clientX - containerRect.left;
    
    // Find the nearest card position
    const cardWidth = 130; // card width + padding
    const cardsPerRow = Math.floor(containerRect.width / cardWidth);
    const row = Math.floor(mouseX / cardWidth);
    
    // Calculate the target index based on row position
    dragOverIndex = Math.min(row, agents.length);
  }

  function handleDragLeave(event: DragEvent) {
    // Only trigger if we're actually leaving the container
    const container = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!container.contains(relatedTarget)) {
      isDragOver = false;
      dragOverIndex = -1;
    }
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
        const updatedAgents = [...agents];
        if (dragOverIndex !== -1) {
          updatedAgents.splice(dragOverIndex, 0, {
            ...agent,
            group: group?.id ?? null
          });
        } else {
          updatedAgents.push({
            ...agent,
            group: group?.id ?? null
          });
        }

        // Update agent's group and position
        agentStore.updateAgent({
          ...agent,
          group: group?.id ?? null
        });
      }
    }
    dragOverIndex = -1;
  }

  function handleDragStart(event: CustomEvent<{ agent: Agent }>) {
    draggedAgent = event.detail.agent;
  }

  function handleDragEnd() {
    draggedAgent = null;
    dragOverIndex = -1;
  }

  $: getCardStyle = (index: number) => {
    if (dragOverIndex === -1 || draggedAgent?.id === agents[index]?.id) return '';
    
    if (index === dragOverIndex) {
      return 'transform: translateX(130px); opacity: 0.5;';
    } else if (index > dragOverIndex) {
      return 'transform: translateX(130px);';
    }
    
    return '';
  };
</script>

<div 
  role="region"
  aria-label={group ? `${group.name} group` : 'Ungrouped agents'}
  class="bg-base-100 border-2 rounded-lg p-4 mb-6 transition-all duration-200 min-h-[200px]"
  class:border-primary={isDragOver}
  class:border-base-300={!isDragOver}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
>
  <GroupHeader {group} />
  
  <div class="flex flex-wrap gap-[5px] justify-start">
    {#each agents as agent, index (agent.id)}
      <div 
        class="agent-card-wrapper"
        style={getCardStyle(index)}
      >
        <AgentCard 
          {agent}
          on:edit={event => dispatch('edit', event.detail)}
          on:dragStart={handleDragStart}
          on:dragEnd={handleDragEnd}
        />
      </div>
    {/each}

    {#if agents.length === 0}
      <div class="flex items-center justify-center w-full h-32 text-base-content/50">
        Drag agents here
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .agent-card-wrapper {
    transition: all 0.2s ease-out;
  }
</style>