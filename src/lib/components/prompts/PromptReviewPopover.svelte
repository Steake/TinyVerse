<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { promptStore, setMasterPrompt, setPromptById } from '../../stores/prompts';
  import type { PromptNode } from '../../stores/prompts';
  import { derived } from 'svelte/store';

  export let open = false;
  export let title = 'Prompt Blueprint';

  const promptState = promptStore;
  const hierarchy = derived(promptState, ($state) => {
    const items: Array<{ node: PromptNode; depth: number }> = [];

    const master = $state.master;
    items.push({ node: { ...master, children: undefined }, depth: 0 });

    for (const section of $state.sections) {
      items.push({ node: { ...section, children: undefined }, depth: 1 });
      if (section.children) {
        for (const child of section.children) {
          items.push({ node: { ...child, children: undefined }, depth: 2 });
        }
      }
    }

    return items;
  });

  let container: HTMLDivElement | null = null;

  function formatScope(scope: string): string {
    if (!scope) return '';
    return scope.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function handlePromptChange(id: string, value: string) {
    if (id === 'master') {
      setMasterPrompt(value);
      return;
    }
    setPromptById(id, value);
  }

  function handleTextareaInput(id: string, event: Event) {
    const target = event.target as HTMLTextAreaElement | null;
    if (!target) return;
    handlePromptChange(id, target.value);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      open = false;
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);
  });

  $: className = open ? 'prompt-popover open' : 'prompt-popover';

  const metadata = derived(promptState, ($state) => ({
    totalPrompts:
      1 +
      $state.sections.length +
      $state.sections.reduce((sum, section) => sum + (section.children?.length ?? 0), 0)
  }));
</script>

<div bind:this={container} class={className} role="dialog" aria-modal="false" aria-hidden={!open}>
  <div class="popover-content">
    <header class="popover-header">
      <div>
        <h4>{title}</h4>
        <p class="subtitle">Review and edit the blueprint plus scoped prompts.</p>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" on:click={() => (open = false)}>
        Close
      </button>
    </header>

    <section class="stats" aria-label="Prompt statistics">
      <div>
        <span class="label">Total prompts</span>
        <span class="value">{$metadata.totalPrompts}</span>
      </div>
    </section>

    <div class="prompt-list" role="list">
      {#each $hierarchy as { node, depth } (node.id)}
        <article
          class="prompt-card"
          style={`--depth:${depth}`}
          role="listitem"
          aria-label={`${node.label} prompt`}
        >
          <div class="prompt-card__header">
            <div>
              <h5>{node.label}</h5>
              <span class="scope">Scope: {formatScope(node.scope)}</span>
            </div>
          </div>
          {#if node.description}
            <p class="description">{node.description}</p>
          {/if}
          <textarea
            class="textarea textarea-bordered"
            rows={Math.max(3, Math.min(8, node.prompt.split('\n').length))}
            value={node.prompt}
            on:input={(event) => handleTextareaInput(node.id, event)}
            aria-label={`${node.label} prompt body`}
          />
        </article>
      {/each}
    </div>
  </div>
</div>

<style>
  .prompt-popover {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.75rem;
    width: min(720px, 90vw);
    max-height: 70vh;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid var(--color-border-subtle);
    background: var(--color-bg-elevated, #0f172a);
    box-shadow: 0 22px 45px rgba(15, 23, 42, 0.45);
    transition: opacity 120ms ease, transform 120ms ease;
    opacity: 0;
    transform: translateY(-6px);
    pointer-events: none;
    z-index: 40;
  }

  .prompt-popover.open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .popover-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
    max-height: 70vh;
    overflow-y: auto;
  }

  .popover-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .popover-header h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .subtitle {
    margin: 0;
    font-size: 0.85rem;
    color: var(--color-text-tertiary);
  }

  .stats {
    display: flex;
    gap: 1.5rem;
    font-size: 0.85rem;
  }

  .stats .label {
    color: var(--color-text-tertiary);
  }

  .stats .value {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .prompt-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .prompt-card {
    border-radius: 12px;
    border: 1px solid var(--color-border-subtle);
    padding: 1rem;
    background: var(--color-bg-primary);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
    margin-left: calc(var(--depth) * 1.5rem);
  }

  .prompt-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .prompt-card__header h5 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .scope {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-tertiary);
  }

  .description {
    margin: 0 0 0.5rem;
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }

  textarea {
    font-size: 0.85rem;
    line-height: 1.4;
  }
</style>
