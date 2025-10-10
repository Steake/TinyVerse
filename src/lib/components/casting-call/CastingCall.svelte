<script lang="ts">
  import { onMount } from 'svelte';
  import { agentStore, type Agent } from '../../stores/agents';
  import AgentForm from '../playwright/casting-call/AgentForm.svelte';
  import AgentList from '../playwright/casting-call/AgentList.svelte';
  import { createNewAgent } from '../../utils/agent';
  import { mockAgents } from '../../utils/mock-data/agents';

  let showForm = false;
  let editingAgent: Partial<Agent> | undefined = undefined;
  let isEditing = false;

  onMount(() => {
    if ($agentStore.length === 0) {
      mockAgents.forEach(agent => {
        if (!agentStore.getAgent(agent.id)) {
          agentStore.addAgent(agent);
        }
      });
    }
  });

  function handleEdit(event: CustomEvent<Agent>) {
    editingAgent = event.detail;
    isEditing = true;
    showForm = true;
  }

  function handleSave(event: CustomEvent<Agent>) {
    const agent = event.detail;
    if (agent.id && agentStore.getAgent(agent.id)) {
      agentStore.updateAgent(agent);
    } else {
      agentStore.addAgent(agent);
    }
    showForm = false;
    editingAgent = undefined;
  }

  function handleCancel() {
    showForm = false;
    editingAgent = undefined;
    isEditing = false;
  }
</script>

<div class="h-full flex flex-col">
  <div class="p-4 bg-base-200 flex justify-end">
    {#if !showForm}
      <button 
        class="btn btn-primary"
        on:click={() => {
          editingAgent = createNewAgent();
          isEditing = false;
          showForm = true;
        }}
      >
        Add New Agent
      </button>
    {/if}
  </div>

  <div class="flex-1 overflow-auto p-6">
    {#if showForm}
      <div class="max-w-2xl mx-auto bg-base-100 p-6 rounded-lg shadow-lg">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-semibold">
            {isEditing ? 'Edit Agent' : 'Add New Agent'}
          </h3>
          <button 
            class="btn btn-ghost"
            on:click={handleCancel}
          >
            ← Back
          </button>
        </div>
        <AgentForm 
          agent={editingAgent ?? createNewAgent()} 
          on:save={handleSave}
          on:cancel={handleCancel}
        />
      </div>
    {:else}
      <AgentList
        on:edit={handleEdit}
      />
    {/if}
  </div>
</div>