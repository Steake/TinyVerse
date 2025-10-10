<script lang="ts">
  import { onMount } from 'svelte';
  import { agentStore, type Agent } from '../../stores/agents';
  import { groupStore } from '../../stores/groups';
  import AgentForm from './casting-call/AgentForm.svelte';
  import AgentList from './casting-call/AgentList.svelte';
  import GroupCreationControl from './casting-call/GroupCreationControl.svelte';
  import { createNewAgent } from '../../utils/agent';
  import { derived, get } from 'svelte/store';
  import { autofillStore, runGlobalAutofill, applyFields, setBatchCount } from '../../stores/autofill';
  import { promptStore } from '../../stores/prompts';
  import { toastStore } from '../../stores/toast';
  import { ensureUniqueName, buildOccupiedNameSet } from '../../utils/naming';
  import { normalizeAgentPayload } from '../../utils/agents';

  let showForm = false;
  let editingAgent: Partial<Agent> | undefined = undefined;
  let isEditing = false;
  let isBatchGenerating = false;
  const batchCountStore = derived(autofillStore, ($s) => $s.batchCounts.agent ?? 1);
  let lastBatchMetadata: Array<{ name: string; metadata: Record<string, unknown> }> = [];
  let search = '';

  onMount(async () => {
    // Load agents from backend
    await agentStore.fetchAgents();
  });

  function prettifyLabel(label: string): string {
    return label
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function formatMetadataValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
        .join(', ');
    }
    if (value && typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return String(value);
  }

  const normalizeGeneratedAgent = (payload: any) => normalizeAgentPayload(payload);

  function handleBatchCountChange(event: Event) {
    const next = Number((event.target as HTMLInputElement).value);
    setBatchCount('agent', next);
  }

  async function generateAgentsFromBlueprint() {
    if (isBatchGenerating) return;
    const blueprint = get(promptStore).master.prompt.trim();
    if (!blueprint) {
      toastStore.error('Set the simulation blueprint before generating agents in batch.');
      return;
    }

    const batchSize = get(autofillStore).batchCounts.agent ?? 1;
    const existingAgents = get(agentStore) ?? [];
    const occupiedNames = buildOccupiedNameSet(existingAgents.map((existing) => existing?.name));
    isBatchGenerating = true;
    try {
      const response = await runGlobalAutofill('agent', undefined, { count: batchSize });
      const payloads = Array.isArray(response)
        ? response
        : response
        ? [response]
        : [];

      if (!payloads.length) {
        toastStore.error('No agent data returned from the LLM.');
        return;
      }

      const metadataCollection: Array<{ name: string; metadata: Record<string, unknown> }> = [];

      for (const payload of payloads) {
  const normalized = normalizeGeneratedAgent(payload);
  normalized.name = ensureUniqueName(normalized.name ?? '', occupiedNames, { fallback: 'Agent' });
        const agent = normalized;
        await agentStore.addAgent(agent);
        const metadata = (payload as any)?.metadata ?? (payload as any)?.meta;
        if (metadata && typeof metadata === 'object') {
          metadataCollection.push({ name: agent.name, metadata: metadata as Record<string, unknown> });
        }
      }

      lastBatchMetadata = metadataCollection;
      toastStore.success(`Generated ${payloads.length} agent${payloads.length === 1 ? '' : 's'} from the blueprint.`);
    } catch (error) {
      console.error('Failed to batch-generate agents', error);
      toastStore.error('Agent batch generation failed. Check the console for details.');
    } finally {
      isBatchGenerating = false;
    }
  }

  function handleEdit(event: CustomEvent<Agent>) {
  editingAgent = event.detail;
    isEditing = true;
    showForm = true;
  }

  async function handleSave(event: CustomEvent<Agent>) {
    const agent = event.detail;
    try {
      if (agent.id && agentStore.getAgent(agent.id)) {
        await agentStore.updateAgent(agent);
      } else {
        await agentStore.addAgent(agent);
      }
  showForm = false;
  editingAgent = undefined;
  isEditing = false;
    } catch (error) {
      console.error('Failed to save agent:', error);
      // You might want to show an error toast here
    }
  }

  function handleCancel() {
  showForm = false;
  editingAgent = undefined;
  isEditing = false;
  }
</script>

<div class="h-full flex flex-col">
  <div class="card p-4 flex flex-wrap gap-3 items-center justify-between">
    <GroupCreationControl />
    {#if !showForm}
      <div class="flex items-center gap-3 ml-auto">
        <label class="input input-sm input-bordered flex items-center gap-2" aria-label="Search agents">
          <span class="opacity-70">🔎</span>
          <input class="grow" placeholder="Search agents…" bind:value={search} />
        </label>
        <div class="batch-control" aria-label="Agent batch generation">
          <label for="batch-size" class="label-text">Batch size</label>
          <input
            id="batch-size"
            class="input input-sm input-bordered w-20"
            type="number"
            min="1"
            max="10"
            value={$batchCountStore}
            on:change={handleBatchCountChange}
          />
        </div>
        <button
          class="btn btn-secondary btn-sm"
          type="button"
          on:click={generateAgentsFromBlueprint}
          disabled={isBatchGenerating}
        >
          {isBatchGenerating ? 'Generating…' : 'Generate Agents'}
        </button>
        <button 
          class="btn btn-primary btn-sm"
          on:click={() => {
            editingAgent = createNewAgent();
            isEditing = false;
            showForm = true;
          }}
        >
          Add New Agent
        </button>
      </div>
    {/if}
  </div>

  {#if lastBatchMetadata.length}
    <section class="batch-metadata card" aria-label="Generated agent metadata">
      <h4>Recent agent metadata</h4>
      <div class="metadata-grid">
        {#each lastBatchMetadata as entry, index}
          <article class="metadata-card card" aria-label={`Agent metadata ${index + 1}`}>
            <header>
              <strong>{entry.name}</strong>
              <span>from blueprint run</span>
            </header>
            <dl>
              {#each Object.entries(entry.metadata) as [key, value]}
                <div>
                  <dt>{prettifyLabel(key)}</dt>
                  <dd>{formatMetadataValue(value)}</dd>
                </div>
              {/each}
            </dl>
          </article>
        {/each}
      </div>
    </section>
  {/if}

  <div class="flex-1 overflow-auto p-4">
    {#if showForm}
      <div class="max-w-2xl mx-auto card p-6 m-6">
        <div class="mb-6">
          <h3 class="text-xl font-semibold">
            {isEditing ? 'Edit Agent' : 'Add New Agent'}
          </h3>
          <p class="text-sm opacity-70">Use the LLM autofill button inside the form to generate a full persona instantly.</p>
        </div>
        <AgentForm 
          agent={editingAgent ?? createNewAgent()} 
          on:save={handleSave}
          on:cancel={handleCancel}
        />
      </div>
    {:else}
      <div class="card p-4">
        <AgentList on:edit={handleEdit} search={search} />
      </div>
    {/if}
  </div>
</div>

<style>
  .batch-control {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
  }

  .batch-metadata { padding: 1.5rem; }

  .batch-metadata h4 {
    margin: 0 0 1rem;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .metadata-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }

  .metadata-card { display: flex; flex-direction: column; gap: 0.5rem; }

  .metadata-card header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  .metadata-card header span {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-tertiary);
  }

  .metadata-card dl {
    margin: 0;
    display: grid;
    grid-template-columns: minmax(100px, 120px) 1fr;
    gap: 0.25rem 0.75rem;
    font-size: 0.8rem;
  }

  .metadata-card dt {
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .metadata-card dd {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--color-text-primary);
  }
</style>
