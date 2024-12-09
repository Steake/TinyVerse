<script lang="ts">
  import type { Agent } from '../../../stores/agents';

  export let agent: Agent;
  export let show: boolean = false;
</script>

{#if show}
  <div
    class="tooltip bg-base-200 p-3 rounded-lg shadow-lg text-sm min-w-[200px] pointer-events-none absolute top-4 left-4"
  >
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl">{agent.emoji}</span>
      <h3 class="font-semibold">{agent.name}</h3>
    </div>
    <div class="space-y-1 text-sm opacity-80">
      <p>{agent.occupation}</p>
      <p>{agent.nationality}</p>
      <p class="text-xs mt-2">
        {agent.personalityTraits.join(', ')}
      </p>
    </div>
  </div>
{/if}

<style>
  .tooltip {
    z-index: 1000;
  }
</style>