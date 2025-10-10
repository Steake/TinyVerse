<script lang="ts">
  export let title: string = 'TinyVerse';
  export let subtitle: string = '';
  // Svelte doesn't support optional with '?', provide a default no-op instead
  export let onPrimary: () => void = () => {};
  export let primaryLabel: string = '';
</script>

<header class="topbar">
  <div class="brand">
    <div class="logo">🌌</div>
    <div class="titles">
      <h1>{title}</h1>
      {#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
    </div>
  </div>
  <div class="actions">
    <slot name="actions" />
    {#if primaryLabel}
      <button class="btn-primary btn-sm" on:click={onPrimary}>{primaryLabel}</button>
    {/if}
  </div>
  <div class="shadow-glow" aria-hidden="true"></div>
</header>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-lg);
    background: linear-gradient(180deg, rgba(19,25,32,0.92), rgba(19,25,32,0.75));
    border-bottom: 1px solid var(--color-border-subtle);
    backdrop-filter: blur(6px);
  }
  .brand { display: flex; align-items: center; gap: var(--space-sm); }
  .logo { font-size: 1.5rem; filter: drop-shadow(0 0 8px rgba(99,102,241,0.3)); }
  .titles h1 { font-size: var(--text-xl); margin: 0; }
  .subtitle { font-size: var(--text-sm); color: var(--color-text-secondary); margin: 0; }
  .actions { display: flex; align-items: center; gap: var(--space-sm); }
  .shadow-glow { position: absolute; inset: auto 0 -4px 0; height: 4px; background: radial-gradient(50% 100% at 50% 0%, rgba(99,102,241,.6), transparent 70%); opacity: .4; }
</style>
