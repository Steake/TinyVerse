<script lang="ts">
  import { facultyStore, type MentalFaculty } from '../../stores/faculties';
  import FacultyCard from './mind-palace/FacultyCard.svelte';
  import FacultyAssignment from './mind-palace/FacultyAssignment.svelte';

  let faculties: MentalFaculty[] = [];
  let activeTab: 'configuration' | 'assignment' = 'configuration';
  
  facultyStore.subscribe(value => {
    faculties = value;
  });
</script>

<div class="h-full flex flex-col">
  <div class="p-6 bg-base-200">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Mind Palace</h2>
      <div class="tabs tabs-boxed">
        <button
          class="tab {activeTab === 'configuration' ? 'tab-active' : ''}"
          on:click={() => activeTab = 'configuration'}
        >
          Configuration
        </button>
        <button
          class="tab {activeTab === 'assignment' ? 'tab-active' : ''}"
          on:click={() => activeTab = 'assignment'}
        >
          Assignment
        </button>
      </div>
    </div>
    <p class="text-sm opacity-70">
      {#if activeTab === 'configuration'}
        Configure and manage mental faculties for your agents.
      {:else}
        Assign mental faculties to specific agents.
      {/if}
    </p>
  </div>

  <div class="flex-1 overflow-auto p-6">
    {#if activeTab === 'configuration'}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each faculties as faculty (faculty.id)}
          <FacultyCard {faculty} />
        {/each}
      </div>
    {:else}
      <FacultyAssignment />
    {/if}
  </div>
</div>