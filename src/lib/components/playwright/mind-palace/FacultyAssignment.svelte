<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Agent } from '../../../stores/agents';
  import type { MentalFacultyDefinition } from '../../../stores/types';
  import { agentStore } from '../../../stores/agents';

  export let selectedAgent: Agent | null = null;
  export let facultyDefinitions: MentalFacultyDefinition[] = [];

  const dispatch = createEventDispatcher<{
    assign: { agentId: string; facultyKey: string };
  }>();

  let agents: Agent[] = [];

  agentStore.subscribe(value => {
    agents = value;
  });

  function handleDragStart(event: DragEvent, faculty: MentalFacultyDefinition) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('faculty-key', faculty.key);
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  function handleDrop(event: DragEvent, agent: Agent) {
    event.preventDefault();
    const facultyKey = event.dataTransfer?.getData('faculty-key');
    if (facultyKey) {
      dispatch('assign', { agentId: agent.id, facultyKey });
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <h3 class="text-lg font-semibold mb-4">Available Faculties</h3>
    <div class="space-y-4">
      {#if facultyDefinitions.length === 0}
        <div class="p-4 bg-base-200 rounded-lg text-xs opacity-70">
          No faculties available. Add them from the Faculties tab first.
        </div>
      {/if}
      {#each facultyDefinitions as faculty (faculty.key)}
        <div
          class="card bg-base-200 cursor-grab"
          draggable="true"
          on:dragstart={(e) => handleDragStart(e, faculty)}
        >
          <div class="card-body p-4">
            <h4 class="card-title text-sm flex items-center justify-between">
              <span>{faculty.name}</span>
              <span class="badge badge-outline badge-sm uppercase">{faculty.type}</span>
            </h4>
            <p class="text-xs opacity-70">{faculty.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div>
    <h3 class="text-lg font-semibold mb-4">Agents</h3>
    <div class="space-y-4">
      {#each agents as agent}
        <div
          class="card bg-base-200"
          class:ring-2={selectedAgent?.id === agent.id}
          class:ring-primary={selectedAgent?.id === agent.id}
          on:dragover={handleDragOver}
          on:drop={(e) => handleDrop(e, agent)}
        >
          <div class="card-body p-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{agent.emoji}</span>
              <div>
                <h4 class="font-semibold">{agent.name}</h4>
                <p class="text-xs opacity-70">{agent.occupation}</p>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
