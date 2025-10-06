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
</script>

<main class="flex h-screen bg-base-100 text-base-content">
  <Sidebar bind:activeSection />
  
  <div class="flex-1 overflow-hidden flex flex-col">
    {#if !apiInitialized}
      <div class="flex items-center justify-center h-full">
        <p>Initializing API...</p>
      </div>
    {:else if error}
      <div class="flex items-center justify-center h-full">
        <p>{error}</p>
      </div>
    {:else if activeSection === 'playwright-desk'}
      <div class="bg-base-200 p-4 shadow-xl">
        <div class="tabs tabs-boxed">
          <button
            class="tab {activeTab === 'world-builder' ? 'tab-active' : ''}"
            on:click={() => handleTabChange('world-builder')}
          >World Builder</button>
          <button
            class="tab {activeTab === 'casting-call' ? 'tab-active' : ''}"
            on:click={() => handleTabChange('casting-call')}
          >Casting Call</button>
          <button
            class="tab {activeTab === 'relationship-network' ? 'tab-active' : ''}"
            on:click={() => handleTabChange('relationship-network')}
          >Relationship Network</button>
          <button
            class="tab {activeTab === 'mind-palace' ? 'tab-active' : ''}"
            on:click={() => handleTabChange('mind-palace')}
          >Mind Palace</button>
        </div>
      </div>

  <div class="flex-1 overflow-auto">
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
