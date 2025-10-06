<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let show = false;
  export let title: string;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  function handleBackdropClick() {
    dispatch('close');
  }

  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dispatch('close');
    }
  }
</script>

<div class="modal" class:modal-open={show} role="dialog" aria-modal={show} aria-labelledby="modal-title">
  <div class="modal-box">
    <h3 id="modal-title" class="font-bold text-lg mb-4">{title}</h3>
    <slot />
  </div>
  <div 
    class="modal-backdrop" 
    on:click={handleBackdropClick}
    on:keydown={handleBackdropKeydown}
    role="button"
    tabindex="0"
    aria-label="Close modal"
  />
</div>