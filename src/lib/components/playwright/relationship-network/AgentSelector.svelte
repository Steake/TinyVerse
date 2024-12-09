<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Agent } from '../../../stores/agents';

  export let agents: Agent[];
  export let selectedAgent: Agent | null = null;

  const dispatch = createEventDispatcher<{
    select: Agent;
  }>();
</script>

<div class="flex items-center gap-4">
  <label for="sourceAgent" class="font-medium">Source Agent:</label>
  <select
    id="sourceAgent"
    class="select select-bordered w-full max-w-xs"
    value={selectedAgent?.id || ''}
    on:change={(e) => {
      const agent = agents.find(a => a.id === e.currentTarget.value);
      if (agent) dispatch('select', agent);
    }}
  >
    <option value="">Select an agent...</option>
    {#each agents as agent}
      <option value={agent.id}>{agent.name}</option>
    {/each}
  </select>
</div>