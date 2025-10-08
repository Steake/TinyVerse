<script lang="ts">
  import { facultyStore } from '../../../stores/faculties';
  import type { MentalFaculty, FacultyParameter } from '../../../stores/types';
  
  export let faculty: MentalFaculty;
  
  let isExpanded = false;

  async function toggleActive() {
    await facultyStore.toggleActive(faculty.agent_id, faculty);
  }

  async function updateParameter(parameter: FacultyParameter, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    let value: unknown = parameter.value;

    switch (parameter.type) {
      case 'boolean':
        value = (target as HTMLInputElement).checked;
        break;
      case 'range':
      case 'number':
        value = Number.parseFloat((target as HTMLInputElement).value);
        break;
      case 'select':
        value = (target as HTMLSelectElement).value;
        break;
      case 'multi-select':
        value = Array.from((target as HTMLSelectElement).selectedOptions).map((option) => option.value);
        break;
    }

    await facultyStore.updateParameter(faculty.agent_id, faculty.id, parameter.id, value);
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
  class="card hover:shadow-lg transition"
  style={faculty.is_active ? 'border-left:3px solid var(--color-accent-primary);' : ''}
>
  <div class="card-body">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-2xl" aria-hidden="true">{getTypeIcon(faculty.type)}</span>
        <div>
          <h3 class="card-title">{faculty.name}</h3>
          <p class="text-xs opacity-60 uppercase tracking-wide">{faculty.key}</p>
        </div>
      </div>
      <label style="display:inline-flex; align-items:center; gap: var(--space-xs);">
        <input
          type="checkbox"
          checked={faculty.is_active}
          on:change={toggleActive}
          aria-label={faculty.is_active ? 'Deactivate faculty' : 'Activate faculty'}
        />
        <span aria-hidden="true">{faculty.is_active ? '🟢' : '⚪'}</span>
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
            <div class="label" role="group" aria-label="{parameter.name}">
              <span class="label-text">{parameter.name}</span>
              {#if parameter.type === 'range'}
                <span class="label-text-alt">{parameter.value}</span>
              {/if}
            </div>
            
            {#if parameter.type === 'boolean'}
              <input
                type="checkbox"
                class="toggle"
                checked={!!parameter.value}
                on:change={(e) => updateParameter(parameter, e)}
              />
            {:else if parameter.type === 'range'}
              <div style="display:flex; align-items:center; gap: var(--space-sm);">
                <input
                  type="range"
                  min={parameter.min}
                  max={parameter.max}
                  step={parameter.step}
                  value={Number(parameter.value)}
                  on:input={(e) => updateParameter(parameter, e)}
                  class="w-full"
                />
                <span class="badge badge-neutral">
                  {parameter.value}
                </span>
              </div>
            {:else if parameter.type === 'number'}
              <input
                type="number"
                class="input input-bordered"
                min={parameter.min}
                max={parameter.max}
                step={parameter.step}
                value={parameter.value}
                on:change={(e) => updateParameter(parameter, e)}
              />
            {:else if parameter.type === 'select'}
              <select class="select select-bordered" value={String(parameter.value || '')} on:change={(e) => updateParameter(parameter, e)}>
                {#if parameter.options}
                  {#each parameter.options as option}
                    <option value={option.value}>{option.label}</option>
                  {/each}
                {/if}
              </select>
            {:else if parameter.type === 'multi-select'}
              <select
                multiple
                class="select select-bordered"
                on:change={(e) => updateParameter(parameter, e)}
              >
                {#if parameter.options}
                  {#each parameter.options as option}
                    <option
                      value={option.value}
                      selected={Array.isArray(parameter.value) && parameter.value.includes(option.value)}
                    >{option.label}</option>
                  {/each}
                {/if}
              </select>
            {/if}
            
            {#if parameter.description}
              <div class="label" role="note"><span class="label-text-alt opacity-70">{parameter.description}</span></div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
