<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Sidebar from './lib/components/layout/Sidebar.svelte';
  import Topbar from './lib/components/layout/Topbar.svelte';
  import LocationManager from './lib/components/playwright/LocationManager.svelte';
  import CastingCall from './lib/components/playwright/CastingCall.svelte';
  import RelationshipNetwork from './lib/components/playwright/RelationshipNetwork.svelte';
  import MindPalace from './lib/components/playwright/MindPalace.svelte';
  import GrandStage from './lib/components/grand-stage/GrandStage.svelte';
  import CriticsCorner from './lib/components/critics-corner/CriticsCorner.svelte';
  import Settings from './lib/components/settings/Settings.svelte';
  import ToastContainer from './lib/components/common/ToastContainer.svelte';
  import GlobalAutofillBar from './lib/components/common/GlobalAutofillBar.svelte';
  import ThemeToggle from './lib/components/common/ThemeToggle.svelte';
  import { runGlobalAutofill } from './lib/stores/autofill';
  import { api } from './lib/api';
  import { wsService } from './lib/services/websocket';
  import SimulationWizard from './lib/components/wizard/SimulationWizard.svelte';
  import { openWizard, maybeLaunchWizard } from './lib/stores/setupWizard';

  let activeSection = 'playwright-desk';
  let activeTab = 'location-manager';
  let apiInitialized = false;
  let error = '';

  onMount(async () => {
    try {
      // Initialize the API client (if needed)
      apiInitialized = true;
      
      // Connect WebSocket for real-time updates
      wsService.connect();

      // Auto-launch the setup wizard when the world is empty
      maybeLaunchWizard();
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

<div role="main" id="app-shell" class="h-screen w-screen flex bg-[var(--color-bg-app)] m-0 p-0 max-w-none gap-0">
  <Sidebar bind:activeSection />
  
  <div class="flex-1 min-w-0 flex flex-col overflow-hidden bg-[var(--color-bg-primary)]">
    {#if !apiInitialized}
      <div class="flex items-center justify-center h-full">
        <p>Initializing API...</p>
      </div>
    {:else if error}
      <div class="flex items-center justify-center h-full">
        <p class="text-danger">{error}</p>
      </div>
    {:else if activeSection === 'playwright-desk'}
  <Topbar title="Playwright's Desk" subtitle="Build your world, assemble your cast, connect their minds" onPrimary={() => {}}>
        <div slot="actions" class="flex items-center gap-2">
          <ThemeToggle />
          <button class="btn btn-accent btn-sm" type="button" on:click={openWizard}>
            Start new simulation
          </button>
        </div>
      </Topbar>
      <div class="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-subtle)]">
        <div class="flex items-center justify-between gap-2 px-4 py-2">
          <div class="flex flex-wrap gap-2">
          <button
            class="btn-secondary {activeTab === 'location-manager' ? 'btn-primary' : ''} btn-sm"
            on:click={() => handleTabChange('location-manager')}
          >Locations</button>
          <button
            class="btn-secondary {activeTab === 'casting-call' ? 'btn-primary' : ''} btn-sm"
            on:click={() => handleTabChange('casting-call')}
          >Casting Call</button>
          <button
            class="btn-secondary {activeTab === 'relationship-network' ? 'btn-primary' : ''} btn-sm"
            on:click={() => handleTabChange('relationship-network')}
          >Relationship Network</button>
          <button
            class="btn-secondary {activeTab === 'mind-palace' ? 'btn-primary' : ''} btn-sm"
            on:click={() => handleTabChange('mind-palace')}
          >Mind Palace</button>
          </div>
        </div>
      </div>

      <div class="px-4 py-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]">
        <GlobalAutofillBar onApply={handleGlobalApply} />
      </div>

  <div class="flex-1 overflow-auto bg-[var(--color-bg-primary)]">
    {#if activeTab === 'location-manager'}
      <LocationManager on:tab-change={(e) => handleTabChange(e.detail)} />
    {:else if activeTab === 'casting-call'}
      <CastingCall />
    {:else if activeTab === 'relationship-network'}
      <RelationshipNetwork />
    {:else if activeTab === 'mind-palace'}
      <MindPalace />
    {/if}
  </div>
    {:else if activeSection === 'grand-stage'}
  <Topbar title="Grand Stage" subtitle="Simulate scenes across your TinyVerse" onPrimary={() => {}} />
      <GrandStage />
    {:else if activeSection === 'critics-corner'}
  <Topbar title="Critic's Corner" subtitle="Inspect logs, reflect on behavior, tune parameters" onPrimary={() => {}} />
      <CriticsCorner />
    {:else if activeSection === 'settings'}
  <Topbar title="Settings" subtitle="Configure services and preferences" onPrimary={() => {}} />
      <Settings />
    {/if}
  </div>
  
  <!-- Global toast notifications -->
  <ToastContainer />
  <SimulationWizard />
</div>
