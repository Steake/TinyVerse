<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let show = false;
  export let title: string;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();
</script>

<div class="modal" class:modal-open={show}>
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">{title}</h3>
    <slot />
  </div>
  <div class="modal-backdrop" on:click={() => dispatch('close')} />
</div>