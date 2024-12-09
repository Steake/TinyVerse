<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { AgentGroup } from '../../../stores/types';
  import { groupStore } from '../../../stores/groups';

  export let selectedGroup: string | null = null;
  
  const dispatch = createEventDispatcher<{
    select: string | null;
    add: string;
    remove: string;
  }>();

  let newGroupName = '';

  function handleAddGroup() {
    if (newGroupName.trim()) {
      dispatch('add', newGroupName.trim());
      newGroupName = '';
    }
  }
</script>

<div class="dropdown">
  <label tabindex="0" class="btn btn-sm">
    {selectedGroup || 'All Groups'} 
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </label>
  <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52">
    <li>
      <button 
        class="btn btn-ghost btn-sm justify-start" 
        class:active={!selectedGroup}
        on:click={() => dispatch('select', null)}
      >
        All Groups
      </button>
    </li>
    {#each $groupStore as group}
      <li>
        <button 
          class="btn btn-ghost btn-sm justify-start" 
          class:active={selectedGroup === group.id}
          on:click={() => dispatch('select', group.id)}
        >
          {group.name}
        </button>
      </li>
    {/each}
    <div class="divider my-1"></div>
    <li>
      <div class="join w-full">
        <input 
          type="text" 
          placeholder="New group name" 
          class="input input-bordered input-sm join-item w-full"
          bind:value={newGroupName}
          on:keydown={e => e.key === 'Enter' && handleAddGroup()}
        />
        <button 
          class="btn btn-primary btn-sm join-item"
          on:click={handleAddGroup}
          disabled={!newGroupName.trim()}
        >
          Add
        </button>
      </div>
    </li>
  </ul>
</div>