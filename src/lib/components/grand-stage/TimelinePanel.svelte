<script lang="ts">
  import { timelineStore } from '../../stores/timeline';
  import type { StoryBeat } from '../../stores/timeline';
  import BeatEditor from './BeatEditor.svelte';

  const timeline = timelineStore;

  let isEditorOpen = false;
  let editingBeat: StoryBeat | null = null;

  $: beats = $timeline.beats ?? [];
  $: totalBeats = beats.length;
  $: completedBeats = beats.filter((beat) => beat.status === 'complete').length;
  $: activeBeat = beats.find((beat) => beat.status === 'active');
  $: nextPending = beats.find((beat) => beat.status === 'pending');
  $: progressPercent = totalBeats === 0 ? 0 : Math.round((completedBeats / totalBeats) * 100);
  $: existingBeatIds = beats.map(b => b.id);

  function activateBeat(id: string) {
    timelineStore.markActive(id);
  }

  function completeBeat(id: string) {
    timelineStore.markComplete(id);
  }

  function activateNext() {
    if (nextPending) {
      timelineStore.markActive(nextPending.id);
    }
  }

  function completeCurrent() {
    if (!activeBeat) return;
    timelineStore.markComplete(activeBeat.id);
    const next = beats.find((beat) => beat.status === 'pending');
    if (next) {
      timelineStore.markActive(next.id);
    }
  }

  function openCreateBeat() {
    editingBeat = null;
    isEditorOpen = true;
  }

  function openEditBeat(beat: StoryBeat) {
    editingBeat = beat;
    isEditorOpen = true;
  }

  function handleSaveBeat(event: CustomEvent<Partial<StoryBeat>>) {
    const data = event.detail;
    
    if (editingBeat) {
      // Update existing beat
      timelineStore.updateBeat(editingBeat.id, data);
    } else {
      // Create new beat
      const newBeat: StoryBeat = {
        id: `beat-${Date.now()}`,
        title: data.title || 'Untitled Beat',
        description: data.description || '',
        trigger: data.trigger || 'manual',
        blocking: data.blocking || false,
        status: 'pending'
      };
      timelineStore.addBeat(newBeat);
    }
    
    isEditorOpen = false;
    editingBeat = null;
  }

  function handleCancelEdit() {
    isEditorOpen = false;
    editingBeat = null;
  }

  function deleteBeat(id: string) {
    if (confirm('Delete this story beat? This cannot be undone.')) {
      timelineStore.deleteBeat(id);
    }
  }
</script>

<section class="timeline-panel">
  <header class="timeline-header">
    <div>
      <h2>Narrative Timeline</h2>
      <p class="subtitle">
        {#if totalBeats === 0}
          Awaiting beats from the setup wizard.
        {:else}
          {completedBeats} of {totalBeats} beats complete · {progressPercent}%
        {/if}
      </p>
    </div>

    <div class="actions">
      <button class="btn btn-xs btn-outline" type="button" on:click={openCreateBeat}>
        + New Beat
      </button>
      <button class="btn btn-xs btn-outline" type="button" on:click={activateNext} disabled={!nextPending}>
        Activate next beat
      </button>
      <button class="btn btn-xs btn-primary" type="button" on:click={completeCurrent} disabled={!activeBeat}>
        Complete current beat
      </button>
    </div>
  </header>

  {#if activeBeat?.blocking}
    <div class="blocking-alert" role="status">
      <strong>{activeBeat.title}</strong> is marked as blocking. Advance or complete this beat to resume the storyline.
    </div>
  {/if}

  {#if totalBeats === 0}
    <div class="empty-state">
      <p>No story beats have been defined yet.</p>
      <p class="muted">Use the simulation setup wizard with narrative enabled to seed a storyline.</p>
    </div>
  {:else}
    <ol class="beat-list">
      {#each beats as beat (beat.id)}
        <li class={`beat ${beat.status} ${beat.blocking ? 'blocking' : ''}`}>
          <div class="beat-row">
            <div>
              <div class="beat-title">
                <span class="status-dot" aria-hidden="true"></span>
                <span>{beat.title}</span>
                {#if beat.blocking}
                  <span class="pill">Blocking</span>
                {/if}
              </div>
              {#if beat.description}
                <p class="beat-description">{beat.description}</p>
              {/if}
              {#if beat.trigger}
                <p class="beat-trigger">Trigger: {beat.trigger}</p>
              {/if}
            </div>

            <div class="beat-actions">
              <button 
                class="btn btn-xs btn-ghost" 
                type="button" 
                on:click={() => openEditBeat(beat)}
                title="Edit beat"
              >
                ✏️
              </button>
              <button 
                class="btn btn-xs btn-ghost text-error" 
                type="button" 
                on:click={() => deleteBeat(beat.id)}
                title="Delete beat"
              >
                🗑️
              </button>
              {#if beat.status !== 'active'}
                <button class="btn btn-xs btn-outline" type="button" on:click={() => activateBeat(beat.id)}>
                  {beat.status === 'pending' ? 'Activate' : 'Revisit'}
                </button>
              {/if}
              {#if beat.status !== 'complete'}
                <button class="btn btn-xs btn-outline" type="button" on:click={() => completeBeat(beat.id)}>
                  Mark complete
                </button>
              {/if}
            </div>
          </div>
        </li>
      {/each}
    </ol>
  {/if}
</section>

<BeatEditor 
  bind:isOpen={isEditorOpen}
  beat={editingBeat}
  existingBeatIds={existingBeatIds}
  on:save={handleSaveBeat}
  on:cancel={handleCancelEdit}
/>

<style lang="postcss">
  .timeline-panel {
    @apply bg-slate-900/70 border border-slate-600/40 rounded-xl p-5 space-y-4 text-slate-100;
    backdrop-filter: blur(14px);
  }

  .timeline-header {
    @apply flex flex-col gap-3 md:flex-row md:items-center md:justify-between;
  }

  .timeline-header h2 {
    @apply text-lg font-semibold;
  }

  .subtitle {
    @apply text-sm text-slate-300/80;
  }

  .actions {
    @apply flex gap-2;
  }

  .empty-state {
    @apply rounded-lg border border-dashed border-slate-600/50 bg-slate-800/50 p-4 text-sm text-slate-300/80 space-y-1;
  }

  .muted {
    @apply text-slate-500;
  }

  .beat-list {
    @apply space-y-3;
  }

  .beat {
    @apply rounded-lg border border-slate-700/50 bg-slate-800/60 p-4 transition-shadow;
  }

  .beat.pending {
    @apply border-slate-600/50;
  }

  .beat.active {
    @apply border-primary shadow-lg;
  }

  .beat.complete {
    @apply opacity-70 border-slate-700/40;
  }

  .beat.blocking {
    @apply border-warning bg-warning;
    background-color: rgba(251, 191, 36, 0.12);
  }

  .beat-title {
    @apply flex items-center gap-2 text-sm font-semibold;
  }

  .status-dot {
    @apply w-2 h-2 rounded-full bg-slate-500 inline-block;
  }

  .beat.pending .status-dot {
    @apply bg-slate-400;
  }

  .beat.active .status-dot {
    @apply bg-primary;
  }

  .beat.complete .status-dot {
    @apply bg-emerald-500;
  }

  .beat.blocking .status-dot {
    @apply bg-warning;
  }

  .pill {
    @apply uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full text-warning;
    font-size: 0.65rem;
    line-height: 1rem;
    background-color: rgba(251, 191, 36, 0.2);
  }

  .beat-description {
    @apply text-sm text-slate-200/90 mt-2 leading-relaxed;
  }

  .beat-trigger {
    @apply text-xs text-slate-400 mt-1;
  }

  .beat-actions {
    @apply flex flex-col gap-2 justify-center min-w-[8rem];
  }

  @media (max-width: 768px) {
    .actions {
      @apply w-full flex-col;
    }

    .beat-row {
      @apply flex flex-col gap-3;
    }

    .beat-actions {
      @apply flex-row gap-2;
    }
  }

  .beat-row {
    @apply flex gap-4 justify-between;
  }

  .blocking-alert {
    @apply rounded-lg border border-warning text-warning px-4 py-3 text-sm;
    background-color: rgba(251, 191, 36, 0.12);
  }
</style>
