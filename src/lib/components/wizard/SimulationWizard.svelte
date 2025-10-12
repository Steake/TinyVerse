<script lang="ts">
  import { setupWizardStore, closeWizard, advanceWizard, setWizardPrompt, setWizardCounts, setWizardNarrative, startWizardGeneration } from '../../stores/setupWizard';
  import type { WizardStep } from '../../stores/setupWizard';

  const state = setupWizardStore;

  const steps: Array<{ id: WizardStep; label: string }> = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'prompt', label: 'Configure' },
    { id: 'progress', label: 'Generate' },
    { id: 'summary', label: 'Complete' }
  ];

  $: currentStepIndex = steps.findIndex(s => s.id === $state.step);

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

{#if $state.isOpen}
  <div class="wizard-overlay" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
    <div class="wizard-container">
      <!-- Header with step indicator -->
      <header class="wizard-header">
        <div class="wizard-brand">
          <h1 id="wizard-title" class="text-2xl font-bold">TinyVerse Setup Wizard</h1>
          <p class="text-sm opacity-70">Create your simulation world in a few simple steps</p>
        </div>
        
        <nav class="wizard-stepper" aria-label="Progress">
          {#each steps as step, index}
            <div class="stepper-item {index <= currentStepIndex ? 'active' : ''} {index < currentStepIndex ? 'complete' : ''}">
              <div class="stepper-circle">
                {#if index < currentStepIndex}
                  ✓
                {:else}
                  {index + 1}
                {/if}
              </div>
              <span class="stepper-label">{step.label}</span>
            </div>
            {#if index < steps.length - 1}
              <div class="stepper-line {index < currentStepIndex ? 'complete' : ''}"></div>
            {/if}
          {/each}
        </nav>

        <button
          class="wizard-close"
          on:click={handleClose}
          aria-label="Close wizard"
          type="button"
        >
          ×
        </button>
      </header>

      <!-- Main content -->
      <main class="wizard-content">
        {#if $state.step === 'welcome'}
          <section class="space-y-6 max-w-2xl mx-auto">
            <div class="text-center">
              <h2 class="text-3xl font-bold mb-3">Welcome to TinyVerse</h2>
              <p class="text-lg opacity-80">
                Kickstart a fresh simulation by describing your world. We'll draft your agent roster,
                stage layout, and narrative beats in one shot.
              </p>
            </div>
            
            <div class="card bg-base-200 p-6">
              <h3 class="font-semibold mb-3 text-lg">What happens next:</h3>
              <ul class="space-y-3">
                <li class="flex gap-3">
                  <span class="text-2xl">🎨</span>
                  <div>
                    <strong>Describe your world</strong> — Theme, tone, and goals for your simulation
                  </div>
                </li>
                <li class="flex gap-3">
                  <span class="text-2xl">⚙️</span>
                  <div>
                    <strong>Configure the scale</strong> — How many agents and locations to pre-seed
                  </div>
                </li>
                <li class="flex gap-3">
                  <span class="text-2xl">📖</span>
                  <div>
                    <strong>Add narrative (optional)</strong> — Include a lightweight timeline to guide the story
                  </div>
                </li>
                <li class="flex gap-3">
                  <span class="text-2xl">🚀</span>
                  <div>
                    <strong>Watch it generate</strong> — AI creates your complete world in moments
                  </div>
                </li>
              </ul>
            </div>
          </section>
        {:else if $state.step === 'prompt'}
          <div class="space-y-6 max-w-2xl mx-auto">
            <div class="form-control">
              <label for="wizard-prompt" class="label">
                <span class="label-text font-semibold">Simulation blueprint</span>
              </label>
              <textarea
                id="wizard-prompt"
                class="textarea textarea-bordered h-40 text-base"
                placeholder="Example: A futuristic space station where scientists and engineers work together to solve a critical life support failure while political tensions rise..."
                value={$state.prompt}
                on:input={handlePromptInput}
                required
              />
              <label class="label">
                <span class="label-text-alt opacity-70">Describe the world, characters, and situation</span>
              </label>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-control">
                <label for="agent-count" class="label">
                  <span class="label-text font-semibold">Agent count</span>
                </label>
                <input
                  id="agent-count"
                  type="number"
                  min="1"
                  max="20"
                  value={$state.agentCount}
                  on:input={handleAgentCountInput}
                  class="input input-bordered"
                />
                <label class="label">
                  <span class="label-text-alt opacity-70">1-20 characters</span>
                </label>
              </div>
              
              <div class="form-control">
                <label for="location-count" class="label">
                  <span class="label-text font-semibold">Location count</span>
                </label>
                <input
                  id="location-count"
                  type="number"
                  min="1"
                  max="15"
                  value={$state.locationCount}
                  on:input={handleLocationCountInput}
                  class="input input-bordered"
                />
                <label class="label">
                  <span class="label-text-alt opacity-70">1-15 places</span>
                </label>
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">Narrative timeline</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-base-300 hover:bg-base-200 transition" for="include-narrative">
                  <input
                    id="include-narrative"
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={$state.includeNarrative}
                    on:change={handleIncludeNarrative}
                  />
                  <span class="text-sm">Include story beats</span>
                </label>
                <label class="label">
                  <span class="label-text-alt opacity-70">Add ordered plot points</span>
                </label>
              </div>
            </div>
          </div>
        {:else if $state.step === 'progress'}
          <div class="space-y-6 max-w-2xl mx-auto">
            <div class="text-center">
              <h2 class="text-2xl font-bold mb-2">Creating your world...</h2>
              <p class="text-sm opacity-70">
                We're generating agents, locations, and {$state.includeNarrative ? 'narrative beats' : 'world details'}. This may take a moment.
              </p>
            </div>

            <ul class="space-y-4">
              <li class="card bg-base-200 p-4">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <p class="font-semibold">Agents</p>
                    <p class="text-xs opacity-70">{$state.progress.agentsCompleted} / {$state.progress.agentsTotal} created</p>
                  </div>
                  <div class="text-3xl">
                    {#if $state.progress.agentsCompleted === $state.progress.agentsTotal && $state.progress.agentsTotal > 0}
                      ✓
                    {:else}
                      ⏳
                    {/if}
                  </div>
                </div>
                <progress 
                  class="progress progress-primary w-full" 
                  value={$state.progress.agentsCompleted} 
                  max={$state.progress.agentsTotal || 1}
                />
              </li>
              
              <li class="card bg-base-200 p-4">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <p class="font-semibold">Locations</p>
                    <p class="text-xs opacity-70">{$state.progress.locationsCompleted} / {$state.progress.locationsTotal} created</p>
                  </div>
                  <div class="text-3xl">
                    {#if $state.progress.locationsCompleted === $state.progress.locationsTotal && $state.progress.locationsTotal > 0}
                      ✓
                    {:else}
                      ⏳
                    {/if}
                  </div>
                </div>
                <progress 
                  class="progress progress-primary w-full" 
                  value={$state.progress.locationsCompleted} 
                  max={$state.progress.locationsTotal || 1}
                />
              </li>
              
              {#if $state.includeNarrative}
                <li class="card bg-base-200 p-4">
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <p class="font-semibold">Narrative beats</p>
                      <p class="text-xs opacity-70">{$state.progress.beatsCompleted} / {$state.progress.beatsTotal || 'several'} created</p>
                    </div>
                    <div class="text-3xl">
                      {#if $state.progress.stage === 'complete'}
                        ✓
                      {:else}
                        ⏳
                      {/if}
                    </div>
                  </div>
                  <progress 
                    class="progress progress-primary w-full" 
                    value={$state.progress.beatsCompleted} 
                    max={Math.max($state.progress.beatsTotal || 1, 1)}
                  />
                </li>
              {/if}
            </ul>

            {#if $state.error}
              <div class="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{$state.error}</span>
              </div>
            {/if}
          </div>
        {:else if $state.step === 'summary'}
          <div class="space-y-6 max-w-2xl mx-auto">
            <div class="text-center">
              <div class="text-6xl mb-4">🎉</div>
              <h2 class="text-3xl font-bold mb-3">Your world is ready!</h2>
              <p class="text-lg opacity-80">
                Successfully created {$state.result?.agentsCreated ?? $state.agentCount} agents, 
                {$state.result?.locationsCreated ?? $state.locationCount} locations
                {#if $state.includeNarrative}
                  , and {$state.result?.beatsCreated ?? 0} narrative beats
                {/if}.
              </p>
            </div>

            <div class="card bg-base-200 p-6">
              <h3 class="font-semibold mb-3 flex items-center gap-2">
                <span class="text-xl">📋</span>
                <span>Your Blueprint</span>
              </h3>
              <p class="text-sm whitespace-pre-wrap leading-relaxed opacity-90">{$state.prompt}</p>
            </div>

            <div class="card bg-primary/10 border border-primary/30 p-6">
              <h3 class="font-semibold mb-2">What's next?</h3>
              <ul class="space-y-2 text-sm">
                <li class="flex gap-2">
                  <span>→</span>
                  <span>Visit <strong>Casting Call</strong> to review and customize your agents</span>
                </li>
                <li class="flex gap-2">
                  <span>→</span>
                  <span>Check <strong>Locations</strong> to adjust the world layout</span>
                </li>
                <li class="flex gap-2">
                  <span>→</span>
                  <span>Head to <strong>Grand Stage</strong> to start your simulation</span>
                </li>
              </ul>
            </div>
          </div>
        {/if}
      </main>

      <!-- Footer with navigation -->
      <footer class="wizard-footer">
        {#if $state.step === 'welcome'}
          <button class="btn btn-outline" type="button" on:click={handleClose}>Maybe later</button>
          <button class="btn btn-primary" type="button" on:click={() => goTo('prompt')}>Let's build it →</button>
        {:else if $state.step === 'prompt'}
          <button class="btn btn-outline" type="button" on:click={() => goTo('welcome')}>← Back</button>
          <button 
            class="btn btn-primary" 
            type="button" 
            on:click={beginGeneration} 
            disabled={$state.status === 'running' || !$state.prompt.trim()}
          >
            {$state.status === 'running' ? 'Generating...' : 'Generate my scenario →'}
          </button>
        {:else if $state.step === 'progress'}
          <div class="text-sm opacity-70">
            {#if $state.error}
              <button class="btn btn-error" type="button" on:click={() => goTo('prompt')}>← Try again</button>
            {:else}
              Generating your world...
            {/if}
          </div>
        {:else if $state.step === 'summary'}
          <button class="btn btn-outline" type="button" on:click={() => goTo('prompt')}>
            Create another →
          </button>
          <button class="btn btn-primary" type="button" on:click={handleClose}>
            Start using my world
          </button>
        {/if}
      </footer>
    </div>
  </div>
{/if}

<style lang="postcss">
  .wizard-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .wizard-container {
    background: var(--color-bg-primary);
    border-radius: var(--radius-xl);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    max-width: 900px;
    width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .wizard-header {
    padding: 2rem 2.5rem 1.5rem;
    border-bottom: 1px solid var(--color-border-subtle);
    background: linear-gradient(180deg, var(--color-bg-secondary), var(--color-bg-primary));
    position: relative;
  }

  .wizard-brand {
    margin-bottom: 1.5rem;
  }

  .wizard-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    color: var(--color-text-primary);
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .wizard-close:hover {
    background: var(--color-bg-hover);
    transform: scale(1.05);
  }

  .wizard-stepper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stepper-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    opacity: 0.4;
    transition: opacity 0.3s;
  }

  .stepper-item.active,
  .stepper-item.complete {
    opacity: 1;
  }

  .stepper-circle {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--color-bg-tertiary);
    border: 2px solid var(--color-border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    transition: all 0.3s;
  }

  .stepper-item.active .stepper-circle {
    background: var(--color-accent-primary);
    border-color: var(--color-accent-primary);
    color: white;
    box-shadow: 0 0 0 4px rgba(var(--color-accent-primary-rgb), 0.2);
  }

  .stepper-item.complete .stepper-circle {
    background: var(--color-success);
    border-color: var(--color-success);
    color: white;
  }

  .stepper-label {
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
  }

  .stepper-line {
    flex: 1;
    height: 2px;
    background: var(--color-border-subtle);
    margin: 0 -0.5rem;
    margin-bottom: 1.5rem;
    transition: background 0.3s;
  }

  .stepper-line.complete {
    background: var(--color-success);
  }

  .wizard-content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 2.5rem;
  }

  .wizard-footer {
    padding: 1.5rem 2.5rem;
    border-top: 1px solid var(--color-border-subtle);
    background: var(--color-bg-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  :global(.wizard-content) .space-y-4 > * + * {
    margin-top: 1rem;
  }

  :global(.wizard-content) .space-y-6 > * + * {
    margin-top: 1.5rem;
  }
</style>