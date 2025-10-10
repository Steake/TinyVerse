<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { runFieldAutofill } from '../../stores/autofill';
  import type { AutofillScope } from '../../stores/autofill';

  export let scope: AutofillScope = 'agent';
  export let field: string;
  export let seed: Record<string, unknown> | undefined;
  export let onValue: (value: any) => void;
  export let title = 'Autofill';
  export let disabled = false;

  let loading = false;
  let localPrompt = '';
  let feedbackVisible = false;
  let feedbackMessage = '';
  let feedbackTimer: number | undefined;

  const dispatch = createEventDispatcher<{ value: any; loading: boolean }>();

  function showFeedback(message: string, durationMs?: number) {
    feedbackMessage = message;
    feedbackVisible = true;
    if (feedbackTimer !== undefined) {
      window.clearTimeout(feedbackTimer);
      feedbackTimer = undefined;
    }
    if (durationMs && durationMs > 0) {
      feedbackTimer = window.setTimeout(() => {
        feedbackVisible = false;
        feedbackTimer = undefined;
      }, durationMs);
    }
  }

  async function handleClick() {
    if (disabled || loading) return;
    loading = true;
    showFeedback('Generating suggestion…');
    dispatch('loading', true);
    try {
      const value = await runFieldAutofill(scope, field, seed, localPrompt || undefined);
      if (onValue && value !== undefined) onValue(value);
      dispatch('value', value);
      showFeedback(value === undefined ? 'No suggestion returned.' : 'Suggestion applied.', 3000);
    } catch (e: any) {
      const message = e?.message ?? 'Autofill failed.';
      showFeedback(message, 4000);
    } finally {
      loading = false;
      dispatch('loading', false);
      if (!feedbackTimer) {
        feedbackVisible = false;
      }
    }
  }

  function handlePromptKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleClick();
    }
  }

  onDestroy(() => {
    if (feedbackTimer !== undefined) {
      window.clearTimeout(feedbackTimer);
    }
  });
</script>

<div
  class="autofill-panel"
  data-loading={loading ? 'true' : 'false'}
  aria-live="polite"
>
  <div class="autofill-controls">
    <input
      class="input input-bordered input-sm autofill-prompt"
      type="text"
      placeholder="Custom prompt (optional)"
      bind:value={localPrompt}
      aria-label={`${title} prompt override`}
      disabled={loading}
      on:keydown={handlePromptKeydown}
    />
    <button
      type="button"
      class="btn btn-sm btn-secondary autofill-trigger"
      aria-label={title}
      aria-busy={loading ? 'true' : undefined}
      on:click={handleClick}
      disabled={disabled || loading}
    >
      {#if loading}
        <span class="loading loading-xs" aria-hidden="true"></span>
        Generating…
      {:else}
        ✨ Autofill
      {/if}
    </button>
  </div>
  <div
    class="autofill-status"
    data-visible={feedbackVisible ? 'true' : 'false'}
    role="status"
  >
    {feedbackMessage}
  </div>
  <div class="autofill-hint">If empty, the global prompt will be used.</div>
</div>
