<script lang="ts">
  import { facultyStore } from '../../../stores/faculties';
  import type { MentalFaculty, FacultyParameter } from '../../../stores/types';
  
  export let faculty: MentalFaculty;
  
  let isExpanded = false;

  function toggleActive() {
    facultyStore.toggleActive(faculty.id);
  }

  function updateParameter(parameter: FacultyParameter, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parameter.type === 'boolean' 
      ? target.checked 
      : parseFloat(target.value);
    
    facultyStore.updateParameter(faculty.id, parameter.id, value);
  }

  function getTypeIcon(type: MentalFaculty['type']): string {
    const icons = {
      'memory': '🧠',
      'grounding': '🌍',
      'tool-use': '🛠️'
    };
    return icons[type];
  }
</script>

<div 
  class="card bg-base-200 hover:shadow-lg transition-shadow duration-200"
  class:ring-2={faculty.isActive}
  class:ring-primary={faculty.isActive}
>
  <div class="card-body">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-2xl" aria-hidden="true">{getTypeIcon(faculty.type)}</span>
        <h3 class="card-title">{faculty.name}</h3>
      </div>
      <label class="swap">
        <input
          type="checkbox"
          checked={faculty.isActive}
          on:change={toggleActive}
        />
        <div class="swap-on">🟢</div>
        <div class="swap-off">⚪</div>
      </label>
    </div>

    <p class="text-sm opacity-70 mt-2">{faculty.description}</p>

    <button
      class="btn btn-ghost btn-sm mt-4"
      on:click={() => isExpanded = !isExpanded}
      aria-expanded={isExpanded}
    >
      {isExpanded ? 'Hide Parameters' : 'Show Parameters'}
    </button>

    {#if isExpanded}
      <div class="mt-4 space-y-4">
        {#each faculty.parameters as parameter}
          <div class="form-control">
            <label class="label">
              <span class="label-text">{parameter.name}</span>
              {#if parameter.type === 'range'}
                <span class="label-text-alt">{parameter.value}</span>
              {/if}
            </label>
            
            {#if parameter.type === 'boolean'}
              <input
                type="checkbox"
                class="toggle"
                checked={parameter.value}
                on:change={(e) => updateParameter(parameter, e)}
              />
            {:else if parameter.type === 'range'}
              <div class="join w-full">
                <input
                  type="range"
                  class="range join-item"
                  min={parameter.min}
                  max={parameter.max}
                  step={parameter.step}
                  value={parameter.value}
                  on:input={(e) => updateParameter(parameter, e)}
                />
                <span class="join-item px-2 bg-base-300">
                  {parameter.value}
                </span>
              </div>
            {/if}
            
            <span class="label-text-alt opacity-70">{parameter.description}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>