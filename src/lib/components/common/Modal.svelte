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

{#if show}
  <div class="overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal">
      <div class="modal-header">
        <h3 id="modal-title" class="modal-title">{title}</h3>
        <button
          class="btn-ghost btn-icon"
          on:click={() => dispatch('close')}
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
    </div>
    <div 
      class="modal-backdrop" 
      on:click={handleBackdropClick}
      on:keydown={handleBackdropKeydown}
      role="button"
      tabindex="0"
      aria-label="Close modal"
      style="position: absolute; inset: 0; z-index: -1;"
    />
  </div>
{/if}