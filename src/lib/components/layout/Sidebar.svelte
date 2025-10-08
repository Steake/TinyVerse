<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ExportDialog from '../common/ExportDialog.svelte';

  export let activeSection: string;
  
  const dispatch = createEventDispatcher<{
    export: void;
  }>();
  
  const sections = [
    { id: 'playwright-desk', name: "Playwright's Desk", icon: '🎭' },
    { id: 'grand-stage', name: 'Grand Stage', icon: '🎬' },
    { id: 'critics-corner', name: "Critic's Corner", icon: '📊' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  let isCollapsed = false;
  let showExportDialog = false;

  function toggleSidebar() {
    isCollapsed = !isCollapsed;
  }
</script>

<nav 
  class="transition shadow-lg" 
  style="height: 100%; background-color: var(--color-bg-secondary); border-right: 1px solid var(--color-border-subtle); display: flex; flex-direction: column; width: {isCollapsed ? '4rem' : '16rem'};"
>
  <header style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); border-bottom: 1px solid var(--color-border-subtle);">
    {#if !isCollapsed}
      <h1 class="text-xl font-bold">TinyVerse Stage</h1>
    {/if}
    <button
      class="btn-ghost btn-sm"
      on:click={toggleSidebar}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? '→' : '←'}
    </button>
  </header>
  
  <ul style="flex: 1; padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm);">
    {#each sections as section}
      <li>
        <button
          class="nav-item {activeSection === section.id ? 'active' : ''}"
          on:click={() => activeSection = section.id}
          title={isCollapsed ? section.name : undefined}
        >
          <span class="text-3xl">{section.icon}</span>
          {#if !isCollapsed}
            <span>{section.name}</span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>

  <footer style="padding: var(--space-md); border-top: 1px solid var(--color-border-subtle);">
    <button
      class="btn-primary btn-sm w-full"
      on:click={() => showExportDialog = true}
      style="width: 100%;"
    >
      {#if isCollapsed}
        📤
      {:else}
        Export Project
      {/if}
    </button>
  </footer>
</nav>

<ExportDialog
  show={showExportDialog}
  on:close={() => showExportDialog = false}
/>

<style>
  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    transition: all var(--duration-fast) ease;
    background: transparent;
    border: none;
    color: var(--color-text-primary);
    font-size: var(--text-base);
    cursor: pointer;
    min-height: 2.5rem;
  }

  .nav-item:hover:not(.active) {
    background-color: var(--color-bg-tertiary);
  }

  .nav-item.active {
    background-color: var(--color-accent-primary);
    color: var(--color-text-inverted);
  }
</style>