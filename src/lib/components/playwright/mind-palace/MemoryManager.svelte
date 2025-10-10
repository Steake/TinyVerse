<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { memoryStore } from '../../../stores/memory';
  import type { Agent } from '../../../stores/agents';
  import type { MemoryEntry } from '../../../stores/types';

  export let selectedAgent: Agent | null = null;

  const dispatch = createEventDispatcher<{ refresh: void }>();

  let query = '';
  let summaryQuery = '';
  let ingestText = '';
  let ingestUrl = '';

  let lastHydratedAgent: string | null = null;

  $: memoryState = $memoryStore;
  $: episodic = memoryState.episodic as MemoryEntry[];
  $: semantic = memoryState.semantic as MemoryEntry[];
  $: matches = memoryState.queryMatches;
  $: summary = memoryState.summary;

  $: if (selectedAgent && selectedAgent.id !== lastHydratedAgent) {
    void preloadMemory(selectedAgent.id);
  }

  async function preloadMemory(agentId: string) {
    lastHydratedAgent = agentId;
    await Promise.all([
      memoryStore.fetchEpisodic(agentId),
      memoryStore.fetchSemantic(agentId),
    ]);
  }

  async function runQuery() {
    if (!selectedAgent || !query.trim()) return;
    await memoryStore.querySemantic(selectedAgent.id, query.trim());
  }

  async function runSummary() {
    if (!selectedAgent) return;
    const target = summaryQuery.trim() || query.trim();
    if (!target) return;
    await memoryStore.summarizeSemantic(selectedAgent.id, target);
  }

  async function clearEpisodic() {
    if (!selectedAgent) return;
    await memoryStore.clearEpisodic(selectedAgent.id, {});
  }

  async function ingest() {
    if (!selectedAgent) return;
    if (!ingestText.trim() && !ingestUrl.trim()) return;
    await memoryStore.ingestSemantic(selectedAgent.id, {
      text: ingestText.trim() || undefined,
      url: ingestUrl.trim() || undefined,
    });
    ingestText = '';
    ingestUrl = '';
    dispatch('refresh');
    await memoryStore.fetchSemantic(selectedAgent.id);
  }

  function pretty(entry: MemoryEntry) {
    const timestamp = entry.simulation_timestamp ? `(${entry.simulation_timestamp})` : '';
    const type = entry.type ? `[${entry.type}]` : '';
    return `${type} ${timestamp} ${entry.content}`.trim();
  }
</script>

{#if !selectedAgent}
  <div class="h-full flex items-center justify-center text-sm opacity-70">
    Select an agent to view memory.
  </div>
{:else}
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <section class="card">
      <div class="card-body">
        <div class="flex items-center justify-between mb-2">
          <h3 class="card-title text-base">Episodic Memory</h3>
          <button class="btn btn-ghost btn-xs" on:click={clearEpisodic}>Clear</button>
        </div>
        {#if episodic.length === 0}
          <p class="text-sm opacity-70">No episodic traces recorded.</p>
        {:else}
          <ul class="space-y-2 max-h-72 overflow-auto text-sm">
            {#each episodic as entry, index (index)}
              <li class="bg-primary px-3 py-2 rounded">
                <p class="font-mono text-xs opacity-60">{entry.type ?? 'event'} · {entry.simulation_timestamp ?? 'unknown'}</p>
                <p>{entry.content}</p>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </section>

  <section class="card">
      <div class="card-body space-y-4">
        <h3 class="card-title text-base">Semantic Memory</h3>
        <div class="form-control">
          <label class="label" for="mm-query">
            <span class="label-text">Query</span>
          </label>
          <div style="display:flex; gap: var(--space-sm);">
            <input id="mm-query" class="input input-bordered" bind:value={query} placeholder="Lookup..." />
            <button class="btn btn-primary" on:click={runQuery} disabled={!query.trim()}>Search</button>
          </div>
        </div>

        <div class="form-control">
          <label class="label" for="mm-summary">
            <span class="label-text">Summarize</span>
          </label>
          <div style="display:flex; gap: var(--space-sm);">
            <input id="mm-summary" class="input input-bordered" bind:value={summaryQuery} placeholder="Enter summary prompt" />
            <button class="btn btn-secondary" on:click={runSummary} disabled={!summaryQuery.trim() && !query.trim()}>
              Summarize
            </button>
          </div>
        </div>

        <div class="form-control">
          <label class="label" for="mm-ingest-text">
            <span class="label-text">Ingest Text Artifact</span>
          </label>
          <textarea id="mm-ingest-text" class="textarea textarea-bordered" rows="3" bind:value={ingestText} placeholder="Paste knowledge the agent should retain"></textarea>
        </div>

        <div class="form-control">
          <label class="label" for="mm-ref-url">
            <span class="label-text">Reference URL</span>
          </label>
          <input id="mm-ref-url" class="input input-bordered" type="url" bind:value={ingestUrl} placeholder="https://example.com/resource" />
        </div>

        <div class="flex items-center gap-2">
          <button class="btn btn-primary" on:click={ingest} disabled={!ingestText.trim() && !ingestUrl.trim()}>
            Add to Semantic Memory
          </button>
          <button class="btn btn-ghost" on:click={() => dispatch('refresh')}>
            Refresh
          </button>
        </div>

        {#if matches.length > 0}
          <div class="bg-primary rounded-lg p-4 space-y-2">
            <h4 class="font-semibold text-sm">Query Matches</h4>
            <ul class="space-y-1 text-sm">
              {#each matches as match, index (index)}
                <li class="border rounded px-2 py-1">{JSON.stringify(match)}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if summary}
          <div class="bg-primary rounded-lg p-4">
            <h4 class="font-semibold text-sm mb-2">Summary</h4>
            <p class="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        {/if}

        <div>
          <h4 class="font-semibold text-sm mb-2">All Semantic Entries</h4>
          {#if semantic.length === 0}
            <p class="text-sm opacity-70">No semantic entries stored yet.</p>
          {:else}
            <ul class="space-y-2 max-h-72 overflow-auto text-sm">
              {#each semantic as entry, index (index)}
                <li class="bg-primary px-3 py-2 rounded">
                  {pretty(entry)}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    </section>
  </div>
{/if}
