<script lang="ts">
  import { groupStore } from '../../stores/groups';
  import { createEventDispatcher } from 'svelte';

  export let selectedGroup: string | null = null;
  export let showGrouping = true;
  export let showSort = true;
  export let sortBy: string = 'name';

  const dispatch = createEventDispatcher<{
    groupSelect: string | null;
    sortChange: string;
  }>();
</script>

<div class="bg-base-200 p-4 border-b border-base-300">
  <div class="flex items-center gap-4">
    {#if showGrouping}
      <div class="form-control">
        <select
          class="select select-bordered select-sm"
          bind:value={selectedGroup}
          on:change={() => dispatch('groupSelect', selectedGroup)}
        >
          <option value={null}>All Groups</option>
          {#each $groupStore as group}
            <option value={group.id}>{group.name}</option>
          {/each}
        </select>
      </div>
    {/if}

    {#if showSort}
      <div class="form-control">
        <select
          class="select select-bordered select-sm"
          bind:value={sortBy}
          on:change={() => dispatch('sortChange', sortBy)}
        >
          <option value="name">Sort by Name</option>
          <option value="occupation">Sort by Occupation</option>
          <option value="group">Sort by Group</option>
        </select>
      </div>
    {/if}

    <slot />
  </div>
</div>