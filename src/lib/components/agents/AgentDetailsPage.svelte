<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../../api';
  import type { Agent } from '../../stores/types';
  import type { MemoryEntry } from '../../api/types';

  export let agentId: string;
  export let onClose: () => void;

  let agent: Agent | null = null;
  let episodicMemories: MemoryEntry[] = [];
  let semanticMemories: MemoryEntry[] = [];
  let relationships: any[] = [];
  let loading = true;
  let error = '';
  let activeTab: 'overview' | 'episodic' | 'semantic' | 'relationships' = 'overview';

  onMount(async () => {
    await loadAgentData();
  });

  async function loadAgentData() {
    loading = true;
    error = '';
    
    try {
      // Load agent details
      const agentResponse = await api.getAgent(agentId);
      agent = agentResponse.data;

      // Load episodic memories
      try {
        const episodicResponse = await api.getEpisodicMemory(agentId, { limit: 50 });
        episodicMemories = Array.isArray(episodicResponse.data) ? episodicResponse.data : [];
      } catch (e) {
        console.warn('Failed to load episodic memories:', e);
        episodicMemories = [];
      }

      // Load semantic memories (if available)
      try {
        const semanticResponse = await api.querySemanticMemory(agentId, { query: '', limit: 20 });
        semanticMemories = Array.isArray(semanticResponse.data) ? semanticResponse.data : [];
      } catch (e) {
        console.warn('Failed to load semantic memories:', e);
        semanticMemories = [];
      }

      // Load relationships (if available)
      try {
        const relationshipsResponse = await api.getAgentRelationships(agentId);
        relationships = Array.isArray(relationshipsResponse.data) ? relationshipsResponse.data : [];
      } catch (e) {
        console.warn('Failed to load relationships:', e);
        relationships = [];
      }
    } catch (e) {
      console.error('Failed to load agent data:', e);
      error = `Failed to load agent details: ${e}`;
    } finally {
      loading = false;
    }
  }

  function formatTimestamp(timestamp: string | Date): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
</script>

<div class="agent-details-page">
  <div class="page-header">
    <div class="header-content">
      <button class="btn btn-ghost btn-sm" on:click={onClose}>
        ← Back
      </button>
      {#if agent}
        <div class="agent-info">
          <span class="agent-emoji">{agent.emoji || '👤'}</span>
          <div>
            <h1 class="agent-name">{agent.name}</h1>
            <p class="agent-subtitle">{agent.occupation || 'Agent'}</p>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="page-content">
    {#if loading}
      <div class="loading-state">
        <span class="loading loading-spinner loading-lg"></span>
        <p>Loading agent data...</p>
      </div>
    {:else if error}
      <div class="error-state">
        <p>{error}</p>
        <button class="btn btn-sm btn-primary" on:click={loadAgentData}>Retry</button>
      </div>
    {:else if agent}
      <div class="tabs">
        <button 
          class="tab" 
          class:active={activeTab === 'overview'}
          on:click={() => activeTab = 'overview'}
        >
          Overview
        </button>
        <button 
          class="tab" 
          class:active={activeTab === 'episodic'}
          on:click={() => activeTab = 'episodic'}
        >
          Episodic Memory ({episodicMemories.length})
        </button>
        <button 
          class="tab" 
          class:active={activeTab === 'semantic'}
          on:click={() => activeTab = 'semantic'}
        >
          Semantic Memory ({semanticMemories.length})
        </button>
        <button 
          class="tab" 
          class:active={activeTab === 'relationships'}
          on:click={() => activeTab = 'relationships'}
        >
          Relationships ({relationships.length})
        </button>
      </div>

      <div class="tab-content">
        {#if activeTab === 'overview'}
          <div class="overview-section">
            <div class="info-grid">
              <div class="info-card">
                <h3>Basic Info</h3>
                <dl>
                  <dt>Age</dt>
                  <dd>{agent.age || 'Unknown'}</dd>
                  <dt>Occupation</dt>
                  <dd>{agent.occupation || 'N/A'}</dd>
                  {#if agent.occupation_description}
                    <dt>Description</dt>
                    <dd>{agent.occupation_description}</dd>
                  {/if}
                </dl>
              </div>

              {#if agent.personality_traits && agent.personality_traits.length > 0}
                <div class="info-card">
                  <h3>Personality Traits</h3>
                  <div class="tag-list">
                    {#each agent.personality_traits as trait}
                      <span class="badge badge-sm badge-primary">{trait}</span>
                    {/each}
                  </div>
                </div>
              {/if}

              {#if agent.professional_interests && agent.professional_interests.length > 0}
                <div class="info-card">
                  <h3>Professional Interests</h3>
                  <div class="tag-list">
                    {#each agent.professional_interests as interest}
                      <span class="badge badge-sm badge-secondary">{interest}</span>
                    {/each}
                  </div>
                </div>
              {/if}

              {#if agent.personal_interests && agent.personal_interests.length > 0}
                <div class="info-card">
                  <h3>Personal Interests</h3>
                  <div class="tag-list">
                    {#each agent.personal_interests as interest}
                      <span class="badge badge-sm badge-accent">{interest}</span>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>

            {#if agent.backstory}
              <div class="info-card backstory-card">
                <h3>Backstory</h3>
                <div class="prose prose-sm max-w-none">
                  {@html agent.backstory}
                </div>
              </div>
            {/if}
          </div>
        {:else if activeTab === 'episodic'}
          <div class="memory-section">
            {#if episodicMemories.length === 0}
              <div class="empty-state">
                <p>No episodic memories recorded yet.</p>
                <p class="text-sm opacity-70">Episodic memories are created as the agent experiences events during simulation.</p>
              </div>
            {:else}
              <div class="memory-timeline">
                {#each episodicMemories as memory, index (memory.id || index)}
                  <div class="memory-entry">
                    <div class="memory-timestamp">
                      {formatTimestamp(memory.timestamp)}
                    </div>
                    <div class="memory-content">
                      <p>{memory.content}</p>
                      {#if memory.metadata}
                        <details class="memory-metadata">
                          <summary>Metadata</summary>
                          <pre>{JSON.stringify(memory.metadata, null, 2)}</pre>
                        </details>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {:else if activeTab === 'semantic'}
          <div class="memory-section">
            {#if semanticMemories.length === 0}
              <div class="empty-state">
                <p>No semantic memories recorded yet.</p>
                <p class="text-sm opacity-70">Semantic memories represent the agent's knowledge and understanding.</p>
              </div>
            {:else}
              <div class="semantic-grid">
                {#each semanticMemories as memory, index (memory.id || index)}
                  <div class="semantic-card">
                    <p class="semantic-content">{memory.content}</p>
                    {#if memory.metadata?.source}
                      <span class="semantic-source">Source: {memory.metadata.source}</span>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {:else if activeTab === 'relationships'}
          <div class="relationships-section">
            {#if relationships.length === 0}
              <div class="empty-state">
                <p>No relationships defined yet.</p>
                <p class="text-sm opacity-70">Relationships are formed through interactions during simulation.</p>
              </div>
            {:else}
              <div class="relationships-grid">
                {#each relationships as relationship}
                  <div class="relationship-card">
                    <div class="relationship-header">
                      <span class="relationship-target">{relationship.targetName || relationship.targetId}</span>
                      <span class="relationship-type badge badge-sm">{relationship.type}</span>
                    </div>
                    {#if relationship.description}
                      <p class="relationship-description">{relationship.description}</p>
                    {/if}
                    {#if relationship.strength !== undefined}
                      <div class="relationship-strength">
                        <span class="label">Strength:</span>
                        <progress class="progress progress-primary w-32" value={relationship.strength} max="10"></progress>
                        <span class="value">{relationship.strength}/10</span>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .agent-details-page {
    @apply fixed inset-0 bg-base-100 z-50 overflow-hidden flex flex-col;
  }

  .page-header {
    @apply bg-base-200 border-b border-base-300 px-6 py-4;
  }

  .header-content {
    @apply flex items-center gap-4;
  }

  .agent-info {
    @apply flex items-center gap-3;
  }

  .agent-emoji {
    @apply text-5xl;
  }

  .agent-name {
    @apply text-2xl font-bold;
  }

  .agent-subtitle {
    @apply text-base-content opacity-70;
  }

  .page-content {
    @apply flex-1 overflow-auto p-6;
  }

  .loading-state,
  .error-state {
    @apply flex flex-col items-center justify-center h-full gap-4;
  }

  .tabs {
    @apply flex gap-2 border-b border-base-300 mb-6;
  }

  .tab {
    @apply px-4 py-2 font-medium text-base-content opacity-70 hover:opacity-100 hover:bg-base-200 rounded-t-lg transition-colors;
  }

  .tab.active {
    @apply text-primary bg-base-200 border-b-2 border-primary opacity-100;
  }

  .info-grid {
    @apply grid grid-cols-1 md:grid-cols-2 gap-4 mb-6;
  }

  .info-card {
    @apply bg-base-200 rounded-xl p-4 border border-base-300;
  }

  .info-card h3 {
    @apply text-lg font-semibold mb-3;
  }

  .info-card dl {
    @apply space-y-2;
  }

  .info-card dt {
    @apply text-sm font-medium text-base-content opacity-70;
  }

  .info-card dd {
    @apply text-base mb-3;
  }

  .tag-list {
    @apply flex flex-wrap gap-2;
  }

  .backstory-card {
    @apply md:col-span-2;
  }

  .memory-timeline {
    @apply space-y-4;
  }

  .memory-entry {
    @apply bg-base-200 rounded-xl p-4 border-l-4 border-primary;
  }

  .memory-timestamp {
    @apply text-xs text-base-content opacity-70 mb-2;
  }

  .memory-content {
    @apply space-y-2;
  }

  .memory-metadata {
    @apply text-xs;
  }

  .memory-metadata summary {
    @apply cursor-pointer text-base-content opacity-70 hover:opacity-100;
  }

  .memory-metadata pre {
    @apply mt-2 p-2 bg-base-300 rounded text-xs overflow-x-auto;
  }

  .semantic-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
  }

  .semantic-card {
    @apply bg-base-200 rounded-xl p-4 border border-base-300;
  }

  .semantic-content {
    @apply text-sm mb-2;
  }

  .semantic-source {
    @apply text-xs text-base-content opacity-70;
  }

  .relationships-grid {
    @apply grid grid-cols-1 md:grid-cols-2 gap-4;
  }

  .relationship-card {
    @apply bg-base-200 rounded-xl p-4 border border-base-300;
  }

  .relationship-header {
    @apply flex items-center justify-between mb-2;
  }

  .relationship-target {
    @apply font-semibold;
  }

  .relationship-description {
    @apply text-sm text-base-content opacity-80 mb-3;
  }

  .relationship-strength {
    @apply flex items-center gap-2 text-sm;
  }

  .relationship-strength .label {
    @apply text-base-content opacity-70;
  }

  .relationship-strength .value {
    @apply font-medium;
  }

  .empty-state {
    @apply text-center py-12 text-base-content opacity-70 space-y-2;
  }
</style>
