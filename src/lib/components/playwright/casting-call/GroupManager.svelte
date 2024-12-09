<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { groupStore } from '../../../stores/groups';
  import type { AgentGroup } from '../../../stores/types';

  export let selectedGroup: string | null = null;
  let isEditing = false;
  let editingGroup: AgentGroup | null = null;
  let newGroupName = '';

  const dispatch = createEventDispatcher<{
    select: string | null;
  }>();

  function startEdit(group: AgentGroup) {
    editingGroup = group;
    newGroupName = group.name;
    isEditing = true;
  }

  function handleSave() {
    if (editingGroup && newGroupName.trim()) {
      groupStore.updateGroup(editingGroup.id, newGroupName.trim());
    } else if (newGroupName.trim()) {
      const group = { id: crypto.randomUUID(), name: newGroupName.trim() };
      groupStore.addGroup(group);
    }
    resetForm();
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this group?')) {
      groupStore.removeGroup(id);
      if (selectedGroup === id) {
        dispatch('select', null);
      }
    }
  }

  function resetForm() {
    isEditing = false;
    editingGroup = null;
    newGroupName = '';
  }
</script>

<div class="bg-base-200 p-4 rounded-lg">
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-lg font-semibold">Groups</h3>
    {#if !isEditing}
      <button 
        class="btn btn-sm btn-primary"
        on:click={() => isEditing = true}
      >
        Add Group
      </button>
    {/if}
  </div>

  {#if isEditing}
    <form 
      class="flex gap-2 mb-4"
      on:submit|preventDefault={handleSave}
    >
      <input
        type="text"
        class="input input-bordered input-sm flex-1"
        placeholder="Group name"
        bind:value={newGroupName}
        autofocus
      />
      <button 
        type="submit" 
        class="btn btn-sm btn-primary"
      >
        {editingGroup ? 'Save' : 'Add'}
      </button>
      <button 
        type="button"
        class="btn btn-sm"
        on:click={resetForm}
      >
        Cancel
      </button>
    </form>
  {/if}

  <div class="space-y-2">
    <button
      class="w-full btn btn-sm justify-start {!selectedGroup ? 'btn-primary' : 'btn-ghost'}"
      on:click={() => dispatch('select', null)}
    >
      All Groups
    </button>
    
    {#each $groupStore as group}
      <div class="flex items-center gap-2">
        <button
          class="flex-1 btn btn-sm justify-start {selectedGroup === group.id ? 'btn-primary' : 'btn-ghost'}"
          on:click={() => dispatch('select', group.id)}
        >
          {group.name}
        </button>
        <button
          class="btn btn-ghost btn-sm btn-square"
          on:click={() => startEdit(group)}
        >
          ✏️
        </button>
        <button
          class="btn btn-ghost btn-sm btn-square text-error"
          on:click={() => handleDelete(group.id)}
        >
          ❌
        </button>
      </div>
    {/each}
  </div>
</div>