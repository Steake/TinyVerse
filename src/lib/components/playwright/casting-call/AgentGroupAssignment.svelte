<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { groupStore } from '../../../stores/groups';
  import type { Agent } from '../../../stores/types';

  export let agent: Agent;
  
  const dispatch = createEventDispatcher<{
    assign: { agentId: string; groupId: string | null };
  }>();

  function handleGroupChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const groupId = select.value || null;
    dispatch('assign', { agentId: agent.id, groupId });
  }
</script>

<select
  class="select select-bordered select-sm w-full"
  value={agent.group || ''}
  on:change={handleGroupChange}
>
  <option value="">No Group</option>
  {#each $groupStore as group}
    <option value={group.id}>{group.name}</option>
  {/each}
</select>