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
    { id: 'critics-corner', name: "Critic's Corner", icon: '📊' }
  ];

  let isCollapsed = false;
  let showExportDialog = false;

  function toggleSidebar() {
    isCollapsed = !isCollapsed;
  }
</script>

<nav 
  class="h-full bg-base-200 transition-all duration-300 flex flex-col shadow-2xl z-10" 
  class:w-16={isCollapsed} 
  class:w-64={!isCollapsed}
>
  <div class="p-4 flex items-center justify-between border-b border-base-300">
    {#if !isCollapsed}
      <div class="text-xl font-bold">TinyVerse Stage</div>
    {/if}
    <button
      class="btn btn-ghost btn-sm"
      on:click={toggleSidebar}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? '→' : '←'}
    </button>
  </div>
  
  <ul class="menu menu-vertical flex-1">
    {#each sections as section}
      <li>
        <button
          class="flex items-center gap-2 {activeSection === section.id ? 'active' : ''}"
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

  <div class="p-4 border-t border-base-300">
    <button
      class="btn btn-primary btn-sm w-full"
      on:click={() => showExportDialog = true}
    >
      {#if isCollapsed}
        📤
      {:else}
        Export Project
      {/if}
    </button>
  </div>
</nav>

<ExportDialog
  show={showExportDialog}
  on:close={() => showExportDialog = false}
/>

<style>
  nav {
    border-right: 1px solid hsl(var(--b3));
  }

  .menu {
    padding: 1rem;
  }

  .menu button {
    @apply rounded-lg transition-colors;
    min-height: 2.5rem;
    height: 2.5rem;
  }

  .menu button.active {
    @apply bg-primary text-primary-content;
  }

  .menu button:hover:not(.active) {
    @apply bg-base-300;
  }
</style>