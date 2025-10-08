<script lang="ts">
  import { onMount } from 'svelte';
  import { API_ENDPOINTS } from '../../api/endpoints';
  
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
  let successMessage = '';
  let activeTab: 'openai' | 'azure' = 'openai';
  
  onMount(async () => {
    await loadConfig();
  });
  
  async function loadConfig() {
    loading = true;
    error = '';
    
    try {
      const response = await fetch(`http://localhost:8000${API_ENDPOINTS.CONFIG}`);
      
      if (!response.ok) {
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
    } finally {
      loading = false;
    }
  }
  
  async function saveConfig() {
    saving = true;
    error = '';
    successMessage = '';
    
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
      
      const response = await fetch(`http://localhost:8000${API_ENDPOINTS.CONFIG}`, {
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
      successMessage = 'Configuration saved successfully!';
      
      // Clear sensitive input fields after successful save
      formData.openai_api_key = '';
      formData.azure_openai_key = '';
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        successMessage = '';
      }, 3000);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to save configuration';
      console.error('Config save error:', e);
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
    successMessage = '';
  }
</script>

<div class="container mx-auto p-6 max-w-4xl">
  <div class="mb-6">
    <h1 class="text-3xl font-bold mb-2">⚙️ Settings</h1>
    <p class="text-secondary">Configure OpenAI API settings and TinyTroupe parameters</p>
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
        
        {#if error}
          <div class="card" style="border-left: 3px solid var(--color-accent-danger); margin-bottom: var(--space-md); display:flex; align-items:center; gap: var(--space-sm);">
            <span class="text-danger">⚠</span>
            <span>{error}</span>
          </div>
        {/if}
        
        {#if successMessage}
          <div class="card" style="border-left: 3px solid var(--color-accent-success); margin-bottom: var(--space-md); display:flex; align-items:center; gap: var(--space-sm);">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        {/if}
        
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
            <label class="label" for="modelSelect">
              <span class="label-text font-semibold">Model</span>
            </label>
            <select
              id="modelSelect"
              bind:value={formData.tinytroupe_model}
              class="select select-bordered w-full"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
            <div class="label" role="note">
              <span class="label-text-alt">
                Model used by TinyTroupe for agent simulation
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
              class="btn btn-ghost"
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
</div>

<style>
  .container {
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

