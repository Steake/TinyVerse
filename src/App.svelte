<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Sidebar from './lib/components/layout/Sidebar.svelte';
  import WorldBuilder from './lib/components/playwright/WorldBuilder.svelte';
  import CastingCall from './lib/components/playwright/CastingCall.svelte';
  import RelationshipNetwork from './lib/components/playwright/RelationshipNetwork.svelte';
  import MindPalace from './lib/components/playwright/MindPalace.svelte';
  import GrandStage from './lib/components/grand-stage/GrandStage.svelte';
  import CriticsCorner from './lib/components/critics-corner/CriticsCorner.svelte';
  import Settings from './lib/components/settings/Settings.svelte';
  import ToastContainer from './lib/components/common/ToastContainer.svelte';
  import GlobalAutofillBar from './lib/components/common/GlobalAutofillBar.svelte';
  import { runGlobalAutofill } from './lib/stores/autofill';
  import { api } from './lib/api';
  import { wsService } from './lib/services/websocket';

  let activeSection = 'playwright-desk';
  let activeTab = 'world-builder';
  let apiInitialized = false;
  let error = '';

  onMount(async () => {
    try {
      // Initialize the API client (if needed)
      apiInitialized = true;
      
      // Connect WebSocket for real-time updates
      wsService.connect();
    } catch (error) {
      console.error('Failed to initialize API:', error);
      error = 'Failed to initialize API';
    }
  });

  onDestroy(() => {
    // Clean up WebSocket connection
    wsService.disconnect();
  });

  function handleTabChange(newTab: string) {
    activeTab = newTab;
  }

  function handleError(error: any) {
    console.error('Error:', error);
    error = 'An error occurred';
  }

  // Default handler: runs generic scope; feature screens can pass their own onApply
  async function handleGlobalApply() {
    // Try a generic prompt; specific pages/components can run scoped fills
    await runGlobalAutofill('generic');
  }
</script>

<main style="display: flex; flex-direction: row; height: 100vh; background-color: var(--color-bg-app);">
  <Sidebar bind:activeSection />
  
  <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; background-color: var(--color-bg-primary);">
    {#if !apiInitialized}
      <div class="flex items-center justify-center" style="height: 100%;">
        <p>Initializing API...</p>
      </div>
    {:else if error}
      <div class="flex items-center justify-center" style="height: 100%;">
        <p class="text-danger">{error}</p>
      </div>
    {:else if activeSection === 'playwright-desk'}
      <header style="background-color: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border-subtle);">
        <div class="flex gap-xs p-md">
          <button
            class="btn-secondary {activeTab === 'world-builder' ? 'btn-primary' : ''}"
            on:click={() => handleTabChange('world-builder')}
          >World Builder</button>
          <button
            class="btn-secondary {activeTab === 'casting-call' ? 'btn-primary' : ''}"
            on:click={() => handleTabChange('casting-call')}
          >Casting Call</button>
          <button
            class="btn-secondary {activeTab === 'relationship-network' ? 'btn-primary' : ''}"
            on:click={() => handleTabChange('relationship-network')}
          >Relationship Network</button>
          <button
            class="btn-secondary {activeTab === 'mind-palace' ? 'btn-primary' : ''}"
            on:click={() => handleTabChange('mind-palace')}
          >Mind Palace</button>
        </div>
      </header>

      <div class="p-md" style="border-bottom:1px solid var(--color-border-subtle); background: var(--color-bg-primary);">
        <GlobalAutofillBar onApply={handleGlobalApply} />
      </div>

  <div style="flex: 1; overflow: auto; background-color: var(--color-bg-primary);">
    {#if activeTab === 'world-builder'}
      <WorldBuilder />
    {:else if activeTab === 'casting-call'}
      <CastingCall />
    {:else if activeTab === 'relationship-network'}
      <RelationshipNetwork />
    {:else if activeTab === 'mind-palace'}
      <MindPalace />
    {/if}
  </div>
    {:else if activeSection === 'grand-stage'}
      <GrandStage />
    {:else if activeSection === 'critics-corner'}
      <CriticsCorner />
    {:else if activeSection === 'settings'}
      <Settings />
    {/if}
  </div>
  
  <!-- Global toast notifications -->
  <ToastContainer />
</main>
