<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  export let show = false;
  export let title: string;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  let modalElement: HTMLDivElement;
  let modalContent: HTMLDivElement;
  let previousActiveElement: Element | null = null;

  onMount(() => {
    return () => {
      if (previousActiveElement && previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  });

  $: if (show) {
    previousActiveElement = document.activeElement;
    setTimeout(() => {
      const firstFocusable = modalContent?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 0);
  }

  function handleClose() {
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!show) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      handleClose();
    }

    if (event.key === 'Tab') {
      const focusableElements = modalContent?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div 
    class="modal modal-open"
    role="dialog"
    aria-labelledby="modal-title"
    aria-modal="true"
    bind:this={modalElement}
  >
    <div 
      class="modal-box relative"
      bind:this={modalContent}
      on:click|stopPropagation
    >
      <div class="flex justify-between items-center mb-4">
        <h2 id="modal-title" class="font-bold text-lg">{title}</h2>
        <button
          type="button"
          class="btn btn-sm btn-ghost"
          on:click={handleClose}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
    </div>

    <div 
      class="modal-backdrop"
      on:click={handleClose}
      on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClose();
        }
      }}
      role="button"
      tabindex="0"
      aria-label="Close modal"
    />
  </div>
{/if}

<style>
  .modal {
    @apply fixed inset-0 z-50 flex items-center justify-center;
  }

  .modal-backdrop {
    @apply fixed inset-0 bg-black bg-opacity-50;
  }

  .modal-box {
    @apply bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full mx-4 z-10;
  }

  .modal-body {
    @apply space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto;
  }

  .modal-body > :global(*) {
    @apply w-full;
  }

  /* Form Controls */
  :global(.form-control) {
    @apply space-y-2;
  }

  :global(.form-control label) {
    @apply block text-sm font-medium;
  }

  :global(.form-control input),
  :global(.form-control select),
  :global(.form-control textarea) {
    @apply w-full bg-base-200 border border-base-300 rounded-lg px-4 py-2;
    @apply focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
  }

  /* Buttons */
  :global(.modal-action) {
    @apply flex justify-end gap-2 mt-6;
  }

  :global(.modal-action button) {
    @apply transition-colors duration-200;
  }
</style>