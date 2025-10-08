<script lang="ts">
  import { onMount } from 'svelte';
  import { agentStore, type Agent } from '../../stores/agents';
  import {
    facultyStore,
    type MentalFaculty,
    type MentalFacultyDefinition,
  } from '../../stores/faculties';
  import { toolStore, type ToolDefinition, type ToolInstance } from '../../stores/tools';
  import { memoryStore } from '../../stores/memory';
  import FacultyCard from './mind-palace/FacultyCard.svelte';
  import FacultyAssignment from './mind-palace/FacultyAssignment.svelte';
  import ToolManager from './mind-palace/ToolManager.svelte';
  import MemoryManager from './mind-palace/MemoryManager.svelte';
  import { loadingStore } from '../../stores/loading';

  let activeTab: 'configuration' | 'assignment' | 'tools' | 'memory' = 'configuration';
  let selectedAgentId: string | null = null;
  let lastHydratedAgent: string | null = null;

  const facultyDefinitionsStore = facultyStore.definitions;
  const toolDefinitionsStore = toolStore.definitions;

  $: agents = $agentStore as Agent[];
  $: faculties = $facultyStore as MentalFaculty[];
  $: facultyDefinitions = $facultyDefinitionsStore as MentalFacultyDefinition[];
  $: tools = $toolStore as ToolInstance[];
  $: toolDefinitions = $toolDefinitionsStore as ToolDefinition[];
  $: selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? null;

  onMount(async () => {
    await Promise.all([facultyStore.fetchDefinitions(), toolStore.fetchDefinitions()]);
    if (!$agentStore.length) {
      await agentStore.fetchAgents();
    }
  });

  $: if (!selectedAgentId && agents.length > 0) {
    selectedAgentId = agents[0].id;
  }

  $: if (selectedAgentId && selectedAgentId !== lastHydratedAgent) {
    void hydrateAgent(selectedAgentId);
  }

  async function hydrateAgent(agentId: string) {
    lastHydratedAgent = agentId;
    const loadingKey = `mind-palace:hydrate:${agentId}`;
    try {
      loadingStore.start(loadingKey);
      await Promise.all([
        facultyStore.fetchFaculties(agentId),
        toolStore.fetchTools(agentId),
      ]);
      memoryStore.reset();
    } finally {
      loadingStore.stop(loadingKey);
    }
  }

  async function handleAgentChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value && target.value !== selectedAgentId) {
      selectedAgentId = target.value;
    }
  }

  async function handleFacultyAssign(event: CustomEvent<{ agentId: string; facultyKey: string }>) {
    const { agentId, facultyKey } = event.detail;
    await facultyStore.assign(agentId, facultyKey);
  }

  function refreshMemory(agentId: string) {
    void memoryStore.fetchEpisodic(agentId);
    void memoryStore.fetchSemantic(agentId);
  }
</script>

<div class="h-full flex flex-col">
  <div class="p-6 bg-base-200">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <div>
        <h2 class="text-2xl font-bold">Mind Palace</h2>
        <p class="text-sm opacity-70 mt-1">
          Strategize how each agent thinks, remembers, and leverages tools.
        </p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <label class="form-control w-full sm:w-64">
          <span class="label-text text-sm font-semibold">Active Agent</span>
          <select class="select select-bordered" bind:value={selectedAgentId} on:change={handleAgentChange}>
            {#if agents.length === 0}
              <option disabled selected>Loading agents...</option>
            {/if}
            {#each agents as agent (agent.id)}
              <option value={agent.id}>{agent.name}</option>
            {/each}
          </select>
        </label>
        <div class="tabs tabs-boxed">
          <button class="tab {activeTab === 'configuration' ? 'tab-active' : ''}" on:click={() => (activeTab = 'configuration')}>
            Faculties
          </button>
          <button class="tab {activeTab === 'assignment' ? 'tab-active' : ''}" on:click={() => (activeTab = 'assignment')}>
            Assignment
          </button>
          <button class="tab {activeTab === 'tools' ? 'tab-active' : ''}" on:click={() => (activeTab = 'tools')}>
            Tools
          </button>
          <button class="tab {activeTab === 'memory' ? 'tab-active' : ''}" on:click={() => (activeTab = 'memory')}>
            Memory
          </button>
        </div>
      </div>
    </div>
    <p class="text-sm opacity-70">
      {#if activeTab === 'configuration'}
        Toggle and tune cognitive faculties for the selected agent.
      {:else if activeTab === 'assignment'}
        Drag faculties onto agents to activate new mental abilities.
      {:else if activeTab === 'tools'}
        Provision TinyTool integrations each agent can wield.
      {:else}
        Inspect and manage episodic and semantic memory in real time.
      {/if}
    </p>
  </div>

  <div class="flex-1 overflow-auto p-6">
    {#if !selectedAgent}
      <div class="h-full flex items-center justify-center text-sm opacity-70">
        Select an agent to continue.
      </div>
    {:else if activeTab === 'configuration'}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#if faculties.length === 0}
          <div class="col-span-full p-6 bg-base-200 rounded-lg text-sm opacity-70">
            No faculties assigned yet. Use the Assignment tab to add one.
          </div>
        {/if}
        {#each faculties as faculty (faculty.id)}
          <FacultyCard {faculty} />
        {/each}
      </div>
    {:else if activeTab === 'assignment'}
      <FacultyAssignment
        {selectedAgent}
        {facultyDefinitions}
        on:assign={handleFacultyAssign}
      />
    {:else if activeTab === 'tools'}
      <ToolManager
        {selectedAgent}
        {tools}
        {toolDefinitions}
      />
    {:else}
      <MemoryManager
        {selectedAgent}
        on:refresh={() => selectedAgentId && refreshMemory(selectedAgentId)}
      />
    {/if}
  </div>
</div>
