<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { groupStore } from '../../../stores/groups';

  let newGroupName = '';
  const dispatch = createEventDispatcher<{
    create: void;
  }>();

  function handleCreateGroup() {
    if (newGroupName.trim()) {
      groupStore.addGroup({
        id: crypto.randomUUID(),
        name: newGroupName.trim()
      });
      newGroupName = '';
      dispatch('create');
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleCreateGroup();
    }
  }
</script>

<div class="join">
  <input
    type="text"
    placeholder="Group name"
    class="input input-bordered input-sm join-item w-64"
    bind:value={newGroupName}
    on:keydown={handleKeyDown}
  />
  <button
    class="btn btn-primary btn-sm join-item"
    on:click={handleCreateGroup}
    disabled={!newGroupName.trim()}
  >
    New Group
  </button>
</div>