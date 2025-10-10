<script lang="ts">
  import BaseModal from '../common/BaseModal.svelte';
  import { setupWizardStore, closeWizard, advanceWizard, setWizardPrompt, setWizardCounts, setWizardNarrative, startWizardGeneration } from '../../stores/setupWizard';
  import type { WizardStep } from '../../stores/setupWizard';

  const state = setupWizardStore;

  function handleClose() {
    closeWizard();
  }

  function goTo(step: WizardStep) {
    advanceWizard(step);
  }

  function handlePromptInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    setWizardPrompt(target.value);
  }

  function handleAgentCountInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    setWizardCounts({ agents: value });
  }

  function handleLocationCountInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    setWizardCounts({ locations: value });
  }

  function handleIncludeNarrative(event: Event) {
    const target = event.target as HTMLInputElement;
    setWizardNarrative(target.checked);
  }

  function beginGeneration(event: Event) {
    event.preventDefault();
    startWizardGeneration();
  }
</script>

<BaseModal
  title="Simulation Setup Wizard"
  show={$state.isOpen}
  on:close={handleClose}
>
  {#if $state.step === 'welcome'}
    <section class="space-y-4">
      <p class="text-sm text-base-content/80">
        Kickstart a fresh TinyVerse scenario by giving us a single high-level prompt. We'll draft your agent roster,
        stage layout, and narrative beats in one shot.
      </p>
      <ul class="list-disc pl-6 space-y-1 text-sm">
        <li>Describe the theme, tone, and big goals of the world you want.</li>
        <li>Select how many agents and locations you'd like pre-seeded.</li>
        <li>Optionally include a lightweight narrative timeline to drive the Grand Stage.</li>
      </ul>
      <div class="modal-action">
        <button class="btn btn-ghost" type="button" on:click={handleClose}>Maybe later</button>
        <button class="btn btn-primary" type="button" on:click={() => goTo('prompt')}>Let's build it</button>
      </div>
    </section>
  {:else if $state.step === 'prompt'}
    <form class="space-y-6" on:submit={beginGeneration}>
      <div class="form-control">
        <label for="wizard-prompt">Simulation blueprint</label>
        <textarea
          id="wizard-prompt"
          class="textarea textarea-bordered h-40"
          placeholder="Tell us about the world you're imagining..."
          value={$state.prompt}
          on:input={handlePromptInput}
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-control">
          <label for="agent-count">Agent count</label>
          <input
            id="agent-count"
            type="number"
            min="1"
            max="20"
            value={$state.agentCount}
            on:input={handleAgentCountInput}
            class="input input-bordered"
          />
        </div>
        <div class="form-control">
          <label for="location-count">Location count</label>
          <input
            id="location-count"
            type="number"
            min="1"
            max="15"
            value={$state.locationCount}
            on:input={handleLocationCountInput}
            class="input input-bordered"
          />
        </div>
        <div class="form-control">
          <label class="flex items-center gap-2" for="include-narrative">
            <input
              id="include-narrative"
              type="checkbox"
              class="toggle toggle-primary"
              checked={$state.includeNarrative}
              on:change={handleIncludeNarrative}
            />
            Include narrative timeline
          </label>
          <p class="text-xs text-base-content/70 mt-2">
            Adds an ordered list of story beats so the Grand Stage knows what to cue next.
          </p>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost" type="button" on:click={() => goTo('welcome')}>Back</button>
        <button class="btn btn-primary" type="submit" disabled={$state.status === 'running'}>
          {$state.status === 'running' ? 'Generating...' : 'Generate my scenario'}
        </button>
      </div>
    </form>
  {:else if $state.step === 'progress'}
    <section class="space-y-4">
      <div>
        <h3 class="font-semibold text-base">Working on it</h3>
        <p class="text-sm text-base-content/80">We'll populate your agents, locations, and beats. Hang tight!</p>
      </div>

      <ul class="space-y-3">
        <li class="flex items-center justify-between p-3 rounded-lg bg-base-200">
          <div>
            <p class="font-medium">Agents</p>
            <p class="text-xs text-base-content/70">{$state.progress.agentsCompleted} / {$state.progress.agentsTotal}</p>
          </div>
          <progress class="progress progress-primary w-32" value={$state.progress.agentsCompleted} max={$state.progress.agentsTotal} />
        </li>
        <li class="flex items-center justify-between p-3 rounded-lg bg-base-200">
          <div>
            <p class="font-medium">Locations</p>
            <p class="text-xs text-base-content/70">{$state.progress.locationsCompleted} / {$state.progress.locationsTotal}</p>
          </div>
          <progress class="progress progress-primary w-32" value={$state.progress.locationsCompleted} max={$state.progress.locationsTotal} />
        </li>
        <li class="flex items-center justify-between p-3 rounded-lg bg-base-200">
          <div>
            <p class="font-medium">Narrative beats</p>
            <p class="text-xs text-base-content/70">{$state.progress.beatsCompleted} / {$state.progress.beatsTotal}</p>
          </div>
          <progress class="progress progress-primary w-32" value={$state.progress.beatsCompleted} max={Math.max($state.progress.beatsTotal, 1)} />
        </li>
      </ul>

      {#if $state.error}
        <div class="alert alert-error text-sm">
          <span>{$state.error}</span>
        </div>
      {/if}
    </section>
  {:else if $state.step === 'summary'}
    <section class="space-y-4">
      <div>
        <h3 class="font-semibold text-base">Scenario ready</h3>
        <p class="text-sm text-base-content/80">
          {$state.result?.agentsCreated ?? $state.agentCount} agents, {$state.result?.locationsCreated ?? $state.locationCount} locations, and
          {$state.result?.beatsCreated ?? ($state.includeNarrative ? $state.progress.beatsCompleted : 0)} beats prepared from your prompt.
        </p>
      </div>

      <div class="rounded-lg bg-base-200 p-4">
        <h4 class="text-sm font-semibold uppercase tracking-wide text-base-content/70">Blueprint</h4>
        <p class="text-sm text-base-content mt-2 whitespace-pre-wrap leading-relaxed">{$state.prompt}</p>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost" type="button" on:click={handleClose}>Close</button>
        <button class="btn btn-primary" type="button" on:click={() => goTo('prompt')}>
          Run it again
        </button>
      </div>
    </section>
  {/if}
</BaseModal>

<style lang="postcss">
  :global(.modal-body) {
    @apply space-y-6;
  }
</style>
