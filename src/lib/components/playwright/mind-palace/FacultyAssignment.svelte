<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Agent } from '../../../stores/agents';
  import type { MentalFaculty } from '../../../stores/faculties';
  import { agentStore } from '../../../stores/agents';
  import { facultyStore } from '../../../stores/faculties';

  export let selectedAgent: Agent | null = null;

  const dispatch = createEventDispatcher<{
    assign: { agentId: string; facultyId: string };
  }>();

  let agents: Agent[] = [];
  let faculties: MentalFaculty[] = [];

  agentStore.subscribe(value => {
    agents = value;
  });

  facultyStore.subscribe(value => {
    faculties = value;
  });

  function handleDragStart(event: DragEvent, faculty: MentalFaculty) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('faculty-id', faculty.id);
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  function handleDrop(event: DragEvent, agent: Agent) {
    event.preventDefault();
    const facultyId = event.dataTransfer?.getData('faculty-id');
    if (facultyId) {
      dispatch('assign', { agentId: agent.id, facultyId });
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
      {#each faculties as faculty}
        <div
          class="card bg-base-200 cursor-move"
          draggable="true"
          on:dragstart={(e) => handleDragStart(e, faculty)}
        >
          <div class="card-body p-4">
            <h4 class="card-title text-sm">{faculty.name}</h4>
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