<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let value: 'name' | 'occupation' | 'group' = 'group';
  
  const dispatch = createEventDispatcher<{
    change: 'name' | 'occupation' | 'group';
  }>();
</script>

<select 
  class="select select-bordered select-sm"
  bind:value
  on:change={() => dispatch('change', value)}
>
  <option value="group">Group View</option>
  <option value="name">Sort by Name</option>
  <option value="occupation">Sort by Occupation</option>
</select>