<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { API_ENDPOINTS } from '../../api/endpoints';
  import { API_BASE_URL } from '../../api';
  import BaseModal from '../common/BaseModal.svelte';
  import { toastStore } from '../../stores/toast';
  
  interface Config {
    openai_api_key: string;
    openai_api_base_url: string;
    azure_openai_key: string;
    azure_openai_endpoint: string;
    tinytroupe_model: string;
    tinytroupe_temperature: number;
    api_base_configured: boolean;
  }
  
  let config: Config = {
    openai_api_key: '',
    openai_api_base_url: '',
    azure_openai_key: '',
    azure_openai_endpoint: '',
    tinytroupe_model: 'gpt-4o-mini',
    tinytroupe_temperature: 0.7,
    api_base_configured: false
  };
  
  let formData = {
    openai_api_key: '',
    openai_api_base_url: '',
    azure_openai_key: '',
    azure_openai_endpoint: '',
    tinytroupe_model: 'gpt-4o-mini',
    tinytroupe_temperature: 0.7
  };
  
  let loading = false;
  let saving = false;
  let error = '';
  let activeTab: 'openai' | 'azure' = 'openai';

  // Reset modal state
  let showResetModal = false;
  let resetBusy = false;

  // Backend state readout
  type SimState = {
    is_running: boolean;
    current_step: number;
    agents_count: number;
    world_name: string;
  };
  let simState: SimState | null = null;
  
  let simPoll: number | null = null;
  onMount(async () => {
    await Promise.all([loadConfig(), loadSimState()]);
    // Start lightweight polling to keep state accurate during runs
    simPoll = window.setInterval(loadSimState, 3000);
  });
  // Best-effort cleanup when component is destroyed
  // (Svelte will ignore if not in DOM lifecycle)
  // @ts-ignore
  onDestroy?.(() => {
    if (simPoll) {
      clearInterval(simPoll);
      simPoll = null;
    }
  });
  
  async function loadConfig() {
    loading = true;
    error = '';
    
    try {
      // Remove /api prefix since API_BASE_URL already includes it
      const url = `${API_BASE_URL.replace(/\/api$/, '')}${API_ENDPOINTS.CONFIG}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const text = await response.text();
        // Check if response is HTML (error page) instead of JSON
        if (text.trim().startsWith('<!')) {
          throw new Error(`Backend returned error page (${response.status}). Is the backend running?`);
        }
        throw new Error(`Failed to load configuration: ${response.statusText}`);
      }
      
      config = await response.json();
      
      // Update form data (don't overwrite API keys that are masked)
      formData.openai_api_base_url = config.openai_api_base_url;
      formData.azure_openai_endpoint = config.azure_openai_endpoint;
      formData.tinytroupe_model = config.tinytroupe_model;
      formData.tinytroupe_temperature = config.tinytroupe_temperature;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load configuration';
      console.error('Config load error:', e);
      toastStore.error(error);
    } finally {
      loading = false;
    }
  }

  async function loadSimState() {
    try {
      // SIMULATION_STATE doesn't have /api prefix, so use full backend URL without /api
      const baseUrl = API_BASE_URL.replace(/\/api$/, '');
      const url = `${baseUrl}${API_ENDPOINTS.SIMULATION_STATE}`;
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        // Check if response is HTML instead of JSON
        if (text.trim().startsWith('<!')) {
          console.warn('Backend returned HTML instead of JSON. Backend may not be running.');
          return;
        }
        simState = JSON.parse(text);
      }
    } catch (e) {
      console.warn('Failed to fetch simulation state', e);
    }
  }
  
  async function saveConfig() {
    saving = true;
    error = '';
    
    try {
      // Only include fields that have been modified
      const updates: any = {};
      
      if (formData.openai_api_key) {
        updates.openai_api_key = formData.openai_api_key;
      }
      if (formData.openai_api_base_url !== config.openai_api_base_url) {
        updates.openai_api_base_url = formData.openai_api_base_url;
      }
      if (formData.azure_openai_key) {
        updates.azure_openai_key = formData.azure_openai_key;
      }
      if (formData.azure_openai_endpoint !== config.azure_openai_endpoint) {
        updates.azure_openai_endpoint = formData.azure_openai_endpoint;
      }
      if (formData.tinytroupe_model !== config.tinytroupe_model) {
        updates.tinytroupe_model = formData.tinytroupe_model;
      }
      if (formData.tinytroupe_temperature !== config.tinytroupe_temperature) {
        updates.tinytroupe_temperature = formData.tinytroupe_temperature;
      }
      
      const url = `${API_BASE_URL.replace(/\/api$/, '')}${API_ENDPOINTS.CONFIG}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to save configuration: ${response.statusText}`);
      }
      
      config = await response.json();
      toastStore.success('Configuration saved successfully');
      
      // Clear sensitive input fields after successful save
      formData.openai_api_key = '';
      formData.azure_openai_key = '';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to save configuration';
      console.error('Config save error:', e);
      toastStore.error(error);
    } finally {
      saving = false;
    }
  }
  
  function handleReset() {
    formData = {
      openai_api_key: '',
      openai_api_base_url: config.openai_api_base_url,
      azure_openai_key: '',
      azure_openai_endpoint: config.azure_openai_endpoint,
      tinytroupe_model: config.tinytroupe_model,
      tinytroupe_temperature: config.tinytroupe_temperature
    };
    error = '';
  }

  async function confirmReset() {
    resetBusy = true;
  error = '';
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.ADMIN_RESET.replace('/api', '')}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Reset failed: ${res.status} ${res.statusText}`);
      }
      toastStore.success('Backend state reset successfully');
      await loadSimState();
      showResetModal = false;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Reset failed';
      toastStore.error(error);
    } finally {
      resetBusy = false;
    }
  }
</script>

<div class="settings-container">
  <div class="mb-6">
    <h1 class="text-3xl font-bold mb-2">⚙️ Settings</h1>
    <p class="text-secondary">Configure OpenAI API settings and TinyTroupe parameters</p>
  </div>

  <!-- Backend state readout -->
  <div class="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
    <div class="card bg-base-200">
      <div class="card-body">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold">Backend State</h2>
          <button class="btn btn-xs btn-outline" type="button" on:click={loadSimState}>Refresh</button>
        </div>
        {#if simState}
          <ul class="text-sm space-y-1">
            <li><strong>World:</strong> {simState.world_name}</li>
            <li><strong>Agents:</strong> {simState.agents_count}</li>
            <li><strong>Step:</strong> {simState.current_step}</li>
            <li><strong>Status:</strong> {simState.is_running ? 'Running' : 'Paused'}</li>
          </ul>
        {:else}
          <p class="text-sm text-secondary">No state available</p>
        {/if}
      </div>
    </div>
    <div class="card bg-base-200">
      <div class="card-body">
        <h2 class="text-lg font-semibold mb-2">Quick Actions</h2>
        <p class="text-sm text-secondary mb-3">Hard reset backend memory, DB rows, and logs via admin endpoint.</p>
        <button type="button" class="btn btn-error" on:click={() => (showResetModal = true)}>
          Reset Simulation
        </button>
      </div>
    </div>
  </div>
  
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <span class="loading"></span>
    </div>
  {:else}
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <!-- Button group for tabs -->
        <div style="display:flex; gap: var(--space-sm); margin-bottom: var(--space-lg);">
          <button
            class="btn {activeTab === 'openai' ? 'btn-primary' : 'btn-secondary'}"
            on:click={() => activeTab = 'openai'}
            type="button"
          >OpenAI</button>
          <button
            class="btn {activeTab === 'azure' ? 'btn-primary' : 'btn-secondary'}"
            on:click={() => activeTab = 'azure'}
            type="button"
          >Azure OpenAI</button>
        </div>
        
        <!-- Inline banners removed; using footer toasts instead -->
        
        <form on:submit|preventDefault={saveConfig} class="space-y-6">
          {#if activeTab === 'openai'}
            <!-- OpenAI Configuration -->
            <div class="form-control">
              <label class="label" for="openaiApiKey">
                <span class="label-text font-semibold">OpenAI API Key</span>
                {#if config.openai_api_key}
                  <span class="label-text-alt badge badge-success badge-sm">Configured</span>
                {/if}
              </label>
              <input
                id="openaiApiKey"
                type="password"
                placeholder="sk-..."
                bind:value={formData.openai_api_key}
                class="input input-bordered w-full"
              />
              <div class="label" role="note">
                <span class="label-text-alt">
                  {config.openai_api_key ? `Current: ${config.openai_api_key}` : 'Not configured'}
                </span>
                <span class="label-text-alt">Leave empty to keep current key</span>
              </div>
            </div>
            
            <div class="form-control">
              <label class="label" for="openaiBaseUrl">
                <span class="label-text font-semibold">Custom Base URL (Optional)</span>
                {#if config.api_base_configured}
                  <span class="label-text-alt badge badge-info badge-sm">Custom URL Active</span>
                {/if}
              </label>
              <input
                id="openaiBaseUrl"
                type="text"
                placeholder="https://api.openai.com/v1 or custom endpoint"
                bind:value={formData.openai_api_base_url}
                class="input input-bordered w-full"
              />
              <div class="label" role="note">
                <span class="label-text-alt">
                  Leave empty to use default OpenAI endpoint
                </span>
              </div>
            </div>
          {:else}
            <!-- Azure OpenAI Configuration -->
            <div class="form-control">
              <label class="label" for="azureApiKey">
                <span class="label-text font-semibold">Azure OpenAI API Key</span>
                {#if config.azure_openai_key}
                  <span class="label-text-alt badge badge-success badge-sm">Configured</span>
                {/if}
              </label>
              <input
                id="azureApiKey"
                type="password"
                placeholder="Your Azure OpenAI key"
                bind:value={formData.azure_openai_key}
                class="input input-bordered w-full"
              />
              <div class="label" role="note">
                <span class="label-text-alt">
                  {config.azure_openai_key ? `Current: ${config.azure_openai_key}` : 'Not configured'}
                </span>
                <span class="label-text-alt">Leave empty to keep current key</span>
              </div>
            </div>
            
            <div class="form-control">
              <label class="label" for="azureEndpoint">
                <span class="label-text font-semibold">Azure OpenAI Endpoint</span>
              </label>
              <input
                id="azureEndpoint"
                type="text"
                placeholder="https://your-resource.openai.azure.com/"
                bind:value={formData.azure_openai_endpoint}
                class="input input-bordered w-full"
              />
              <div class="label" role="note">
                <span class="label-text-alt">
                  Your Azure OpenAI resource endpoint
                </span>
              </div>
            </div>
          {/if}
          
          <!-- TinyTroupe Configuration -->
          <hr />
          <h2 class="text-xl font-semibold mt-md">TinyTroupe Settings</h2>
          
          <div class="form-control">
            <label class="label" for="modelInput">
              <span class="label-text font-semibold">Model</span>
            </label>
            <input
              id="modelInput"
              type="text"
              placeholder="e.g., gpt-4o-mini, deepseek-reasoner, local:my-llm"
              bind:value={formData.tinytroupe_model}
              class="input input-bordered w-full"
            />
            <div class="label" role="note">
              <span class="label-text-alt">
                Free text. Supports custom providers and local IDs.
              </span>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label" for="temperatureRange">
              <span class="label-text font-semibold">Temperature: {formData.tinytroupe_temperature}</span>
            </label>
            <input
              id="temperatureRange"
              type="range"
              min="0"
              max="2"
              step="0.1"
              bind:value={formData.tinytroupe_temperature}
              class="w-full"
            />
            <div style="width: 100%; display:flex; justify-content: space-between; font-size: var(--text-xs); padding: 0 var(--space-sm); margin-top: var(--space-xs);">
              <span>Focused (0)</span>
              <span>Balanced (1)</span>
              <span>Creative (2)</span>
            </div>
            <div class="label" role="note">
              <span class="label-text-alt">
                Controls randomness in agent responses
              </span>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div style="display:flex; justify-content: flex-end; gap: var(--space-sm); margin-top: var(--space-lg);">
            <button
              type="button"
              class="btn btn-outline"
              on:click={handleReset}
              disabled={saving}
            >
              Reset
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              disabled={saving}
            >
              {#if saving}
                Saving...
              {:else}
                Save Configuration
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

    <!-- Confirmation Modal -->
    <BaseModal bind:show={showResetModal} title="Confirm Reset">
      <p>You're about to clear all agents, locations, connections, and logs. This cannot be undone.</p>
      <div class="modal-action">
        <button class="btn btn-outline" type="button" on:click={() => (showResetModal = false)} disabled={resetBusy}>Cancel</button>
        <button class="btn btn-error" type="button" on:click={confirmReset} disabled={resetBusy}>
          {#if resetBusy}Resetting...{:else}Confirm Reset{/if}
        </button>
      </div>
    </BaseModal>
</div>

<style>
  .settings-container {
    height: 100%;
    overflow-y: auto;
    padding: var(--space-lg);
    max-width: 1024px;
    margin: 0 auto;
    animation: fadeIn 0.3s ease-in;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>

