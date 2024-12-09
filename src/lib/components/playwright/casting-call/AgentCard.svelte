<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Agent } from '../../../stores/types';
  import { groupStore } from '../../../stores/groups';
  import Tooltip from '../../common/Tooltip.svelte';

  export let agent: Agent;
  
  const dispatch = createEventDispatcher<{
    edit: Agent;
    dragStart: { agent: Agent };
    dragEnd: void;
  }>();

  $: group = $groupStore.find(g => g.id === agent.group);

  function getTooltipText(): string {
    return `${agent.occupation}\n${agent.personalityTraits.join(', ')}`;
  }

  function handleDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify({
        agentId: agent.id,
        sourceGroupId: agent.group
      }));
      event.dataTransfer.effectAllowed = 'move';
      dispatch('dragStart', { agent });
    }
  }

  function handleDragEnd() {
    dispatch('dragEnd');
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dispatch('edit', agent);
    }
  }
</script>

<div 
  role="button"
  tabindex="0"
  class="w-[120px] bg-accent/10 rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col group relative cursor-move border-3 border-accent/20"
  draggable="true"
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:click={() => dispatch('edit', agent)}
  on:keydown={handleKeyDown}
  aria-label="Edit {agent.name}"
>
  <div class="flex-1 flex flex-col items-center justify-center">
    <Tooltip text={getTooltipText()} position="top">
      <div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-2xl mb-2">
        {agent.emoji || '👤'}
      </div>
    </Tooltip>

    <h3 class="text-sm font-medium text-center line-clamp-2 mb-1 min-h-[2.5rem]">
      {agent.name}
    </h3>

    <span class="text-sm text-base-content/70 truncate block text-center w-full font-medium">
      {agent.occupation}
    </span>
  </div>

  <button 
    class="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
    on:click|stopPropagation={() => dispatch('edit', agent)}
    aria-label="Edit {agent.name}"
  >
    ✏️
  </button>
</div>

<style lang="postcss">
  div[role="button"] {
    cursor: grab;
  }

  div[role="button"]:active {
    cursor: grabbing;
  }

  .border-3 {
    border-width: 3px;
  }
</style>