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

  const colorMap = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
    warning: 'alert-warning'
  };
</script>

<div class="toast toast-end toast-top z-50">
  {#each $toastStore as toast (toast.id)}
    <div
      class="alert {colorMap[toast.type]} shadow-lg"
      transition:fly={{ y: -20, duration: 300 }}
      animate:flip={{ duration: 300 }}
    >
      <div class="flex items-center gap-2">
        <span class="text-xl font-bold">{iconMap[toast.type]}</span>
        <span>{toast.message}</span>
      </div>
      <button
        class="btn btn-sm btn-ghost"
        on:click={() => toastStore.dismiss(toast.id)}
      >
        ✕
      </button>
    </div>
  {/each}
</div>

<style>
  .toast {
    max-width: 400px;
  }
</style>
