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
    try {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    } catch {}
  }

  // restore collapsed state
  try {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) isCollapsed = JSON.parse(saved);
  } catch {}
</script>

<nav 
  role="navigation"
  class="shadow-lg slide-down"
  data-collapsed={isCollapsed}
  style="height: 100%; min-height: 100vh; background: linear-gradient(180deg, rgba(26,35,48,1), rgba(26,35,48,0.85)); border-right: 1px solid var(--color-border-subtle); display: flex; flex-direction: column; width: {isCollapsed ? '4rem' : '16rem'}; transition: width var(--duration-fast) cubic-bezier(0.22, 0.61, 0.36, 1); overflow: hidden; position: relative; flex-shrink: 0; z-index: 100; box-sizing: border-box;"
>
  <header style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); border-bottom: 1px solid var(--color-border-subtle); position: sticky; top: 0; background: linear-gradient(180deg, rgba(26,35,48,0.98), rgba(26,35,48,0.9)); z-index: 120;">
    {#if !isCollapsed}
      <h1 class="text-xl font-bold">TinyVerse Stage</h1>
    {/if}
    <button
      class="btn-ghost btn-sm"
      on:click={toggleSidebar}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!isCollapsed}
    >
      {isCollapsed ? '→' : '←'}
    </button>
  </header>
  
  <ul style="flex: 1; padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); overflow: auto; overscroll-behavior: contain;">
    {#each sections as section}
      <li>
        <button
          class="nav-item {activeSection === section.id ? 'active' : ''}"
          on:click={() => activeSection = section.id}
          title={isCollapsed ? section.name : undefined}
          aria-label={section.name}
        >
          <span class="nav-icon text-3xl" aria-hidden="true">{section.icon}</span>
          <span class="nav-label">{section.name}</span>
        </button>
      </li>
    {/each}
  </ul>

  <footer style="padding: var(--space-md); border-top: 1px solid var(--color-border-subtle); margin-top: auto;">
    <button
      class="btn-primary btn-sm w-full flex items-center justify-center"
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

  {#if isCollapsed}
    <button
      class="collapse-handle"
      on:click={toggleSidebar}
      aria-label="Expand sidebar"
      title="Expand"
    >
      ⇤
    </button>
  {/if}
</nav>

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    width: 100%;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    transition: all var(--duration-normal) cubic-bezier(0.22, 0.61, 0.36, 1);
    background: transparent;
    border: none;
    color: var(--color-text-primary);
    font-size: var(--text-base);
    cursor: pointer;
    min-height: 2.5rem;
    text-align: left;
  }

  .nav-icon {
    flex-shrink: 0;
    width: 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .nav-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* when collapsed, center icon and hide inline labels */
  :global(nav[role="navigation"][data-collapsed="true"]) .nav-item { 
    justify-content: center; 
    padding: var(--space-sm);
  }
  
  :global(nav[role="navigation"][data-collapsed="true"]) .nav-icon { 
    display: inline-flex; 
    width: auto;
  }
  
  :global(nav[role="navigation"][data-collapsed="true"]) .nav-label { 
    position: absolute; 
    left: calc(100% + 8px); 
    top: 50%; 
    transform: translateY(-50%);
    white-space: nowrap; 
    background: rgba(17, 24, 39, 0.95);
    color: var(--color-text-inverted);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    padding: 0.25rem 0.5rem; 
    font-size: 0.85rem; 
    pointer-events: none;
    opacity: 0; 
    transition: opacity var(--duration-fast) cubic-bezier(0.22, 0.61, 0.36, 1);
    visibility: hidden;
    flex: none;
  }
  
  :global(nav[role="navigation"][data-collapsed="true"]) .nav-item:hover .nav-label { 
    opacity: 1; 
  }
  
  :global(nav[role="navigation"][data-collapsed="false"]) .nav-label { 
    position: static; 
    transform: none; 
    background: transparent; 
    color: inherit; 
    border: 0; 
    padding: 0; 
    opacity: 1;
    visibility: visible;
  }

  .nav-item:hover:not(.active) { background: linear-gradient(90deg, var(--color-bg-tertiary), transparent); transform: translateX(2px); }

  .nav-item.active { background: linear-gradient(90deg, var(--color-accent-primary), transparent); color: var(--color-text-inverted); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06); }

  .collapse-handle {
    position: absolute;
    top: 50%;
    right: -8px;
    transform: translateY(-50%);
    width: 28px;
    height: 56px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background: var(--color-accent-primary);
    color: var(--color-text-inverted);
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 6px 18px rgba(2,6,23,0.4);
    cursor: pointer;
    z-index: 130;
  }
  .collapse-handle:hover { filter: brightness(1.1); }
</style>