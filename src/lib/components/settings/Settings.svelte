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
    <p class="text-base-content/70">Configure OpenAI API settings and TinyTroupe parameters</p>
  </div>
  
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <!-- Tabs -->
        <div class="tabs tabs-boxed mb-6">
          <button
            class="tab {activeTab === 'openai' ? 'tab-active' : ''}"
            on:click={() => activeTab = 'openai'}
          >
            OpenAI
          </button>
          <button
            class="tab {activeTab === 'azure' ? 'tab-active' : ''}"
            on:click={() => activeTab = 'azure'}
          >
            Azure OpenAI
          </button>
        </div>
        
        {#if error}
          <div class="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        {/if}
        
        {#if successMessage}
          <div class="alert alert-success mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        {/if}
        
        <form on:submit|preventDefault={saveConfig} class="space-y-6">
          {#if activeTab === 'openai'}
            <!-- OpenAI Configuration -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">OpenAI API Key</span>
                {#if config.openai_api_key}
                  <span class="label-text-alt badge badge-success badge-sm">Configured</span>
                {/if}
              </label>
              <input
                type="password"
                placeholder="sk-..."
                bind:value={formData.openai_api_key}
                class="input input-bordered w-full"
              />
              <label class="label">
                <span class="label-text-alt">
                  {config.openai_api_key ? `Current: ${config.openai_api_key}` : 'Not configured'}
                </span>
                <span class="label-text-alt">Leave empty to keep current key</span>
              </label>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Custom Base URL (Optional)</span>
                {#if config.api_base_configured}
                  <span class="label-text-alt badge badge-info badge-sm">Custom URL Active</span>
                {/if}
              </label>
              <input
                type="text"
                placeholder="https://api.openai.com/v1 or custom endpoint"
                bind:value={formData.openai_api_base_url}
                class="input input-bordered w-full"
              />
              <label class="label">
                <span class="label-text-alt">
                  Leave empty to use default OpenAI endpoint
                </span>
              </label>
            </div>
          {:else}
            <!-- Azure OpenAI Configuration -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Azure OpenAI API Key</span>
                {#if config.azure_openai_key}
                  <span class="label-text-alt badge badge-success badge-sm">Configured</span>
                {/if}
              </label>
              <input
                type="password"
                placeholder="Your Azure OpenAI key"
                bind:value={formData.azure_openai_key}
                class="input input-bordered w-full"
              />
              <label class="label">
                <span class="label-text-alt">
                  {config.azure_openai_key ? `Current: ${config.azure_openai_key}` : 'Not configured'}
                </span>
                <span class="label-text-alt">Leave empty to keep current key</span>
              </label>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Azure OpenAI Endpoint</span>
              </label>
              <input
                type="text"
                placeholder="https://your-resource.openai.azure.com/"
                bind:value={formData.azure_openai_endpoint}
                class="input input-bordered w-full"
              />
              <label class="label">
                <span class="label-text-alt">
                  Your Azure OpenAI resource endpoint
                </span>
              </label>
            </div>
          {/if}
          
          <!-- TinyTroupe Configuration -->
          <div class="divider">TinyTroupe Settings</div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Model</span>
            </label>
            <select
              bind:value={formData.tinytroupe_model}
              class="select select-bordered w-full"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
            <label class="label">
              <span class="label-text-alt">
                Model used by TinyTroupe for agent simulation
              </span>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Temperature: {formData.tinytroupe_temperature}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              bind:value={formData.tinytroupe_temperature}
              class="range range-primary"
            />
            <div class="w-full flex justify-between text-xs px-2 mt-1">
              <span>Focused (0)</span>
              <span>Balanced (1)</span>
              <span>Creative (2)</span>
            </div>
            <label class="label">
              <span class="label-text-alt">
                Controls randomness in agent responses
              </span>
            </label>
          </div>
          
          <!-- Action Buttons -->
          <div class="card-actions justify-end mt-6">
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
                <span class="loading loading-spinner"></span>
                Saving...
              {:else}
                Save Configuration
              {/if}
            </button>
          </div>
        </form>
        
        <!-- Info Panel -->
        <div class="mt-6 p-4 bg-info/10 rounded-lg">
          <h3 class="font-semibold mb-2">💡 Configuration Tips</h3>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>Changes take effect immediately without restarting the server</li>
            <li>Use custom base URLs for OpenAI-compatible APIs (e.g., LocalAI, OpenRouter)</li>
            <li>API keys are securely stored and masked in the interface</li>
            <li>Settings are persisted to your .env file</li>
          </ul>
        </div>
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

