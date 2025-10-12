<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { StoryBeat } from '../../stores/timeline';

  export let beat: StoryBeat | null = null;
  export let isOpen = false;
  export let existingBeatIds: string[] = [];

  const dispatch = createEventDispatcher<{
    save: Partial<StoryBeat>;
    cancel: void;
  }>();

  let form = {
    title: '',
    description: '',
    trigger: 'simulation_start',
    blocking: false
  };

  $: if (beat) {
    form = {
      title: beat.title || '',
      description: beat.description || '',
      trigger: beat.trigger || 'simulation_start',
      blocking: beat.blocking || false
    };
  }

  $: isEditing = !!beat;
  $: modalTitle = isEditing ? 'Edit Story Beat' : 'Create Story Beat';

  function handleSubmit() {
    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }

    const data: Partial<StoryBeat> = {
      title: form.title.trim(),
      description: form.description.trim(),
      trigger: form.trigger,
      blocking: form.blocking
    };

    if (isEditing && beat) {
      data.id = beat.id;
      data.status = beat.status;
    }

    dispatch('save', data);
    close();
  }

  function close() {
    dispatch('cancel');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      close();
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal-content">
      <header class="modal-header">
        <h3>{modalTitle}</h3>
        <button class="btn btn-ghost btn-sm btn-circle" on:click={close} aria-label="Close">✕</button>
      </header>

      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-control">
          <label class="label" for="beat-title">
            <span class="label-text">Title *</span>
          </label>
          <input
            id="beat-title"
            type="text"
            class="input input-bordered"
            bind:value={form.title}
            placeholder="e.g., The Heist Begins"
            required
            maxlength="100"
          />
        </div>

        <div class="form-control">
          <label class="label" for="beat-description">
            <span class="label-text">Description</span>
          </label>
          <textarea
            id="beat-description"
            class="textarea textarea-bordered"
            bind:value={form.description}
            placeholder="Describe what happens in this story beat..."
            rows="3"
            maxlength="500"
          ></textarea>
        </div>

        <div class="form-control">
          <label class="label" for="beat-trigger">
            <span class="label-text">Trigger</span>
            <span class="label-text-alt">When should this beat activate?</span>
          </label>
          <select id="beat-trigger" class="select select-bordered" bind:value={form.trigger}>
            <option value="simulation_start">Simulation start</option>
            <option value="step:5">After 5 steps</option>
            <option value="step:10">After 10 steps</option>
            <option value="step:20">After 20 steps</option>
            <option value="manual">Manual activation</option>
            {#each existingBeatIds as beatId}
              <option value="after:{beatId}">After beat: {beatId}</option>
            {/each}
          </select>
        </div>

        <div class="form-control">
          <label class="label cursor-pointer justify-start gap-3">
            <input type="checkbox" class="checkbox" bind:checked={form.blocking} />
            <span class="label-text">
              <strong>Blocking</strong>
              <span class="text-sm opacity-70">— Pause simulation until this beat completes</span>
            </span>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" on:click={close}>Cancel</button>
          <button type="submit" class="btn btn-primary">
            {isEditing ? 'Save Changes' : 'Create Beat'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style lang="postcss">
  .modal-backdrop {
    @apply fixed inset-0 bg-black/60 backdrop-blur-sm z-50;
    @apply flex items-center justify-center p-4;
  }

  .modal-content {
    @apply bg-base-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto;
  }

  .modal-header {
    @apply flex items-center justify-between p-6 border-b border-base-content/10;
  }

  .modal-header h3 {
    @apply text-2xl font-bold;
  }

  form {
    @apply p-6 space-y-4;
  }

  .modal-actions {
    @apply flex justify-end gap-3 pt-4 border-t border-base-content/10;
  }
</style>
