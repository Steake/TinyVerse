<script lang="ts">
  import { worldStore } from '../../stores/world';
  import { agentStore } from '../../stores/agents';
  import { toastStore } from '../../stores/toast';
  import type { Location } from '../../stores/world';
  import LocationEditModal from './world-builder/LocationEditModal.svelte';
  import { autofill } from '../../actions/autofill';
  import { openWizard } from '../../stores/setupWizard';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  $: locations = $worldStore?.locations ?? [];
  $: agents = $agentStore ?? [];
  $: locationCount = locations.length;
  $: agentCount = agents.length;

  let showAddModal = false;
  let editingLocation: Location | null = null;
  
  function handleAddLocation() {
    showAddModal = true;
  }

  function handleEditLocation(location: Location) {
    editingLocation = location;
  }

  async function handleDeleteLocation(locationId: string) {
    if (!confirm('Delete this location? This action cannot be undone.')) return;
    
    try {
      await worldStore.removeLocation(locationId);
      toastStore.success('Location deleted');
    } catch (error) {
      console.error('Failed to delete location', error);
      toastStore.error('Failed to delete location');
    }
  }

  async function handleSaveLocation(event: CustomEvent) {
    const locationData = event.detail;
    
    try {
      if (editingLocation) {
        await worldStore.updateLocation(editingLocation.id, locationData);
        toastStore.success('Location updated');
      } else {
        await worldStore.addLocation(locationData);
        toastStore.success('Location created');
      }
      showAddModal = false;
      editingLocation = null;
    } catch (error) {
      console.error('Failed to save location', error);
      toastStore.error('Failed to save location');
    }
  }

  function handleCancelModal() {
    showAddModal = false;
    editingLocation = null;
  }

  async function handleClearWorld() {
    if (!confirm('Clear all locations and agents? This action cannot be undone.')) return;
    
    try {
      // Clear agents first (they depend on locations)
      const agentIds = agents.map(a => a.id);
      await Promise.all(agentIds.map(id => agentStore.removeAgent(id)));
      
      // Then clear locations
      const locationIds = locations.map(l => l.id);
      await Promise.all(locationIds.map(id => worldStore.removeLocation(id)));
      
      toastStore.success('World cleared');
    } catch (error) {
      console.error('Failed to clear world', error);
      toastStore.error('Failed to clear world');
    }
  }

  function handleNavigateToCastingCall() {
    dispatch('tab-change', 'casting-call');
  }
</script>

<main data-testid="location-manager">
  <header class="mb-6">
    <h2 class="text-2xl font-bold mb-2">Location Manager</h2>
    <p class="text-base-content/70">
      Manage simulation locations. Use the <strong>Setup Wizard</strong> to generate a complete world, or add locations manually here.
    </p>
  </header>

  <section class="card mb-6">
    <div class="card-header">
      <div>
        <h3 class="card-title">World Overview</h3>
        <p class="text-sm text-base-content/70">
          Current state of your simulation world
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="btn btn-sm btn-outline btn-error"
          on:click={handleClearWorld}
          disabled={locationCount === 0 && agentCount === 0}
        >
          Clear All
        </button>
        <button
          class="btn btn-sm btn-primary"
          on:click={handleAddLocation}
        >
          + Add Location
        </button>
      </div>
    </div>

    <div class="card-body">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card bg-base-200 p-4">
          <h4 class="font-semibold mb-2">Locations ({locationCount})</h4>
          <ul class="space-y-2 max-h-64 overflow-y-auto">
            {#if locationCount === 0}
              <li class="text-sm text-base-content/50">No locations configured yet.</li>
            {:else}
              {#each locations as location (location.id)}
                <li class="flex items-center justify-between gap-2 p-2 rounded bg-base-100">
                  <div class="flex-1 min-w-0">
                    <span class="font-medium">{location.name}</span>
                    <span class="text-base-content/50"> — {location.type}</span>
                  </div>
                  <div class="flex gap-1">
                    <button
                      class="btn btn-xs btn-outline"
                      on:click={() => handleEditLocation(location)}
                      title="Edit location"
                    >
                      ✏️
                    </button>
                    <button
                      class="btn btn-xs btn-error"
                      on:click={() => handleDeleteLocation(location.id)}
                      title="Delete location"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              {/each}
            {/if}
          </ul>
        </div>

        <div class="card bg-base-200 p-4">
          <h4 class="font-semibold mb-2">Agents ({agentCount})</h4>
          <ul class="space-y-2 max-h-64 overflow-y-auto">
            {#if agentCount === 0}
              <li class="text-sm text-base-content/50">No agents available yet.</li>
            {:else}
              {#each agents as agent (agent.id)}
                <li class="flex items-center gap-2 p-2 rounded bg-base-100">
                  <span class="text-2xl">{agent.emoji ?? '👤'}</span>
                  <div class="flex-1 min-w-0">
                    <span class="font-medium">{agent.name}</span>
                    <span class="text-base-content/50 text-sm"> — {agent.occupation}</span>
                  </div>
                </li>
              {/each}
            {/if}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-header">
      <h3 class="card-title">Quick Actions</h3>
    </div>
    <div class="card-body">
      <div class="flex flex-wrap gap-4">
        <div class="card bg-base-200 p-4 flex-1 min-w-[200px]">
          <h4 class="font-semibold mb-2 text-sm">🎭 Start Fresh</h4>
          <p class="text-xs text-base-content/70 mb-3">
            Use the Setup Wizard to generate a complete scenario with agents, locations, and narrative beats.
          </p>
          <button
            class="btn btn-sm btn-primary w-full"
            on:click={openWizard}
          >
            Open Wizard
          </button>
        </div>

        <div class="card bg-base-200 p-4 flex-1 min-w-[200px]">
          <h4 class="font-semibold mb-2 text-sm">📍 Add Manually</h4>
          <p class="text-xs text-base-content/70 mb-3">
            Create individual locations one at a time with optional AI assistance for descriptions.
          </p>
          <button
            class="btn btn-sm btn-secondary w-full"
            on:click={handleAddLocation}
          >
            Add Location
          </button>
        </div>

        <div class="card bg-base-200 p-4 flex-1 min-w-[200px]">
          <h4 class="font-semibold mb-2 text-sm">👥 Manage Cast</h4>
          <p class="text-xs text-base-content/70 mb-3">
            Switch to the Casting Call tab to create and edit agents for your simulation.
          </p>
          <button
            class="btn btn-sm btn-secondary w-full"
            on:click={handleNavigateToCastingCall}
          >
            Go to Casting Call
          </button>
        </div>
      </div>
    </div>
  </section>
</main>

{#if showAddModal || editingLocation}
  <LocationEditModal
    show={true}
    location={editingLocation}
    on:save={handleSaveLocation}
    on:close={handleCancelModal}
  />
{/if}

<style>
  main {
    padding: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--color-border-subtle);
    background: var(--color-bg-tertiary);
  }

  .card-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }

  .card-body {
    padding: 1.5rem;
  }
</style>
