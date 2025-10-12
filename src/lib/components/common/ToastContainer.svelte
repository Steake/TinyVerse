<script lang="ts">
  import { toastStore } from '../../stores/toast';
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  const typeMap = {
    success: 'toast-success',
    error: 'toast-danger',
    info: 'toast-info',
    warning: 'toast-warning'
  };
</script>

<div class="toast-container">
  {#each $toastStore as toast (toast.id)}
    <div
      class="toast {typeMap[toast.type]}"
      transition:fly={{ y: -20, duration: 300 }}
      animate:flip={{ duration: 300 }}
    >
      <span class="text-xl font-bold">{iconMap[toast.type]}</span>
      <span class="flex-1">{toast.message}</span>
      <button
        class="btn-ghost btn-sm"
        on:click={() => toastStore.dismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: var(--space-lg);
    /* Center in the main content area (accounting for 16rem sidebar) */
    left: calc(16rem + (100vw - 16rem) / 2);
    transform: translateX(-50%);
    z-index: var(--z-toast);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    /* Width relative to content area, not full viewport */
    width: calc(100vw - 16rem - 2 * var(--space-lg));
    max-width: 640px;
    padding: 0 var(--space-sm);
  }
</style>