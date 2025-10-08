<script lang="ts">
  import { onMount } from 'svelte';
  import { agentStore, type Agent } from '../../stores/agents';
  import { groupStore } from '../../stores/groups';
  import AgentForm from './casting-call/AgentForm.svelte';
  import AgentList from './casting-call/AgentList.svelte';
  import GroupCreationControl from './casting-call/GroupCreationControl.svelte';
  import { createNewAgent } from '../../utils/agent';

  let showForm = false;
  let editingAgent: Partial<Agent> | null = null;
  let isEditing = false;

  onMount(async () => {
    // Load agents from backend
    await agentStore.fetchAgents();
  });

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
      editingAgent = null;
      isEditing = false;
    } catch (error) {
      console.error('Failed to save agent:', error);
      // You might want to show an error toast here
    }
  }

  function handleCancel() {
    showForm = false;
    editingAgent = null;
    isEditing = false;
  }
</script>

<div class="h-full flex flex-col">
  <div class="p-4 bg-base-200 flex justify-between items-center shadow-xl">
    <GroupCreationControl />
    {#if !showForm}
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
    {/if}
  </div>

  <div class="flex-1 overflow-auto">
    {#if showForm}
      <div class="max-w-2xl mx-auto bg-base-100 p-6 m-6 rounded-lg shadow-lg">
        <div class="mb-6">
          <h3 class="text-xl font-semibold">
            {isEditing ? 'Edit Agent' : 'Add New Agent'}
          </h3>
          <p class="text-sm opacity-70">Use the LLM autofill button inside the form to generate a full persona instantly.</p>
        </div>
        <AgentForm 
          agent={editingAgent} 
          on:save={handleSave}
          on:cancel={handleCancel}
        />
      </div>
    {:else}
      <AgentList on:edit={handleEdit} />
    {/if}
  </div>
</div>
