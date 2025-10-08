<script lang="ts">
  export let removable = false;
  export let variant: 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' = 'neutral';

  function getClasses(): string {
    const classes = ['badge'];
    classes.push(`badge-${variant}`);
    return classes.join(' ');
  }
</script>

<span class={getClasses()}>
  <slot />
  {#if removable}
    <button type="button" class="btn-ghost" on:click style="padding: 0; min-height: auto;">×</button>
  {/if}
</span>