<script lang="ts">
  import { onMount } from 'svelte';

  const STORAGE_KEY = 'tinyverse.theme';
  let theme: 'dark' | 'light' = 'dark';

  function applyTheme(next: 'dark' | 'light') {
    theme = next;
    const root = document.documentElement;
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }

  function toggle() {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as 'dark' | 'light' | null;
      if (saved === 'light' || saved === 'dark') {
        applyTheme(saved);
      } else {
        // prefer system dark
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
      }
    } catch {
      applyTheme('dark');
    }
  });
</script>

<button class="btn-secondary btn-sm" on:click={toggle} aria-label="Toggle theme">
  {#if theme === 'dark'}
    <span>☀️ Light</span>
  {:else}
    <span>🌙 Dark</span>
  {/if}
  <span class="sr-only">Toggle color theme</span>
  
</button>

<style>
  button { display: inline-flex; align-items: center; gap: .5rem; }
</style>
