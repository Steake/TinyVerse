<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { AgentGroup } from '../../../stores/groups';
  import { groupStore } from '../../../stores/groups';

  export let group: AgentGroup | null;
  
  const dispatch = createEventDispatcher<{
    save: string;
  }>();

  let isEditing = false;
  let editedName = '';

  function startEditing() {
    if (group) {
      editedName = group.name;
      isEditing = true;
    }
  }

  function handleSave() {
    if (group && editedName.trim()) {
      groupStore.updateGroup(group.id, editedName.trim());
      dispatch('save', editedName.trim());
      isEditing = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      isEditing = false;
    }
  }
</script>

<div class="flex items-center justify-between mb-4">
  {#if isEditing}
    <div class="join w-full max-w-xs">
      <input
        type="text"
        class="input input-bordered input-sm join-item w-full"
        bind:value={editedName}
        on:keydown={handleKeyDown}
      />
      <button
        class="btn btn-primary btn-sm join-item"
        on:click={handleSave}
      >
        Save
      </button>
    </div>
  {:else}
    <button 
      class="text-lg font-semibold hover:text-primary transition-colors"
      on:click={startEditing}
    >
      {group ? group.name : 'Ungrouped Agents'}
    </button>
  {/if}
</div>