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
  export let icon = '✨';

  const dispatch = createEventDispatcher<{ value: any; loading: boolean }>();

  let state: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  let statusMessage = '';
  let resetTimer: number | undefined;

  function showFeedback(message: string, nextState: 'success' | 'error') {
    statusMessage = message;
    state = nextState;
    scheduleReset();
  }

  function scheduleReset() {
    if (resetTimer !== undefined) {
      window.clearTimeout(resetTimer);
    }
    resetTimer = window.setTimeout(() => {
      state = 'idle';
      statusMessage = '';
      resetTimer = undefined;
    }, 2400);
  }

  async function handleClick() {
    if (disabled || state === 'loading') return;
    state = 'loading';
    statusMessage = 'Generating suggestion…';
    dispatch('loading', true);
    try {
      const value = await runFieldAutofill(scope, field, seed, undefined);
      if (onValue && value !== undefined) onValue(value);
      dispatch('value', value);
      showFeedback(value === undefined ? 'No suggestion returned.' : 'Suggestion applied.', value === undefined ? 'error' : 'success');
    } catch (e: any) {
      const message = e?.message ?? 'Autofill failed.';
      showFeedback(message, 'error');
    } finally {
      dispatch('loading', false);
    }
  }

  onDestroy(() => {
    if (resetTimer !== undefined) {
      window.clearTimeout(resetTimer);
    }
  });

  $: buttonLabel = title;
  $: currentIcon = state === 'loading' ? '⏳' : state === 'success' ? '✅' : state === 'error' ? '⚠️' : icon;
</script>

<button
  type="button"
  class="autofill-chip"
  data-state={state}
  aria-label={buttonLabel}
  title={buttonLabel}
  on:click={handleClick}
  disabled={disabled || state === 'loading'}
>
  {currentIcon}
</button>
<span class="autofill-status" aria-live="polite">{statusMessage}</span>
