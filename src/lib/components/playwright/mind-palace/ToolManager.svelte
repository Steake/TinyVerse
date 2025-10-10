<script lang="ts">
  import { toolStore } from '../../../stores/tools';
  import type { Agent } from '../../../stores/agents';
  import type { ToolDefinition, ToolInstance } from '../../../stores/types';

  export let selectedAgent: Agent | null = null;
  export let tools: ToolInstance[] = [];
  export let toolDefinitions: ToolDefinition[] = [];

  let selectedToolKey: string = '';

  $: if (toolDefinitions.length > 0 && !selectedToolKey) {
    selectedToolKey = toolDefinitions[0].key;
  }

  async function assignTool() {
    if (!selectedAgent || !selectedToolKey) return;
    await toolStore.assign(selectedAgent.id, selectedToolKey);
  }

  async function removeTool(tool: ToolInstance) {
    if (!selectedAgent) return;
    await toolStore.remove(selectedAgent.id, tool.id);
  }
</script>

<div class="space-y-6">
  <div class="card bg-base-200">
    <div class="card-body">
      <h3 class="card-title text-base">Add Tool</h3>
      {#if toolDefinitions.length === 0}
        <p class="text-sm opacity-70 mt-2">There are no TinyTools available. Tool definitions must be configured in the backend.</p>
      {:else}
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <label class="form-control w-full sm:w-72">
            <span class="label-text text-sm font-semibold">Tool</span>
            <select class="select select-bordered" bind:value={selectedToolKey}>
              {#each toolDefinitions as definition (definition.key)}
                <option value={definition.key}>{definition.name}</option>
              {/each}
            </select>
          </label>
          <button class="btn btn-primary" disabled={!selectedAgent} on:click={assignTool}>
            Assign Tool
          </button>
        </div>
      {/if}
    </div>
  </div>

  <div class="card bg-base-200">
    <div class="card-body">
      <h3 class="card-title text-base flex items-center justify-between">
        <span>Assigned Tools</span>
        <span class="badge badge-outline">{tools.length}</span>
      </h3>

      {#if tools.length === 0}
        <p class="text-sm opacity-70">No tools assigned to this agent yet.</p>
      {:else}
        <ul class="space-y-3">
          {#each tools as tool (tool.id)}
            <li class="flex items-center justify-between bg-base-100 px-4 py-3 rounded-lg">
              <div>
                <p class="font-semibold">{tool.name}</p>
                {#if tool.description}
                  <p class="text-xs opacity-70">{tool.description}</p>
                {/if}
                {#if tool.capabilities.length > 0}
                  <p class="text-[11px] uppercase tracking-wide mt-1 opacity-60">
                    {tool.capabilities.join(' • ')}
                  </p>
                {/if}
              </div>
              <button class="btn btn-ghost btn-sm" on:click={() => removeTool(tool)}>
                Remove
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>
