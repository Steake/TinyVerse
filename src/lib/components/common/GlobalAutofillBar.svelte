<script lang="ts">
  import { autofillStore } from '../../stores/autofill';
  import { promptStore, setMasterPrompt } from '../../stores/prompts';
  import PromptReviewPopover from '../prompts/PromptReviewPopover.svelte';
  import { derived } from 'svelte/store';

  export let placeholder: string = 'Describe what you want populated (e.g., “Create a realistic call center agent roster”).';
  export let onApply: (() => void) | undefined;

  const prompt = derived(promptStore, ($s) => $s.master.prompt);
  const applying = derived(autofillStore, ($s) => $s.isApplying);
  const error = derived(autofillStore, ($s) => $s.error);

  let inputValue = '';
  let promptsOpen = false;

  $: inputValue = $prompt ?? '';

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    setMasterPrompt(value);
  }
</script>

<div class="card" style="border: 1px solid var(--color-border-subtle);">
  <div class="card-body" style="gap: var(--space-sm);">
    <div>
      <label class="label" for="global-autofill">
        <span class="label-text font-semibold">Autopopulate with LLM</span>
        <span class="label-text-alt">Applies across forms</span>
      </label>
      <div style="display:flex; gap: var(--space-sm); align-items: flex-start;">
        <input
          id="global-autofill"
          type="text"
          class="input input-bordered"
          placeholder={placeholder}
          bind:value={inputValue}
          on:input={handleInput}
        />
        <button class="btn btn-primary" on:click={() => onApply && onApply()} disabled={$applying}>
          {$applying ? 'Applying…' : 'Apply Now'}
        </button>
        <div class="review-trigger">
          <button type="button" class="btn btn-outline" on:click={() => (promptsOpen = !promptsOpen)}>
            {promptsOpen ? 'Hide Blueprint' : 'Review Prompts'}
          </button>
          <PromptReviewPopover bind:open={promptsOpen} />
        </div>
      </div>
      {#if $error}
        <div class="card" style="border-left:3px solid var(--color-accent-danger); padding: var(--space-sm); margin-top: var(--space-sm);">
          <span class="text-danger">{$error}</span>
        </div>
      {/if}
    </div>
  </div>
  <slot />
</div>

<style>
  :global(#global-autofill)::placeholder { color: var(--color-text-tertiary); }
  .review-trigger { position: relative; }
</style>
