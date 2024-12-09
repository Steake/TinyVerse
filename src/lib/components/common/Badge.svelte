<script lang="ts">
  export let removable = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let variant: 'default' | 'primary' | 'secondary' = 'default';

  function getClasses(): string {
    const classes = ['badge'];
    if (size === 'sm') classes.push('badge-sm');
    if (size === 'lg') classes.push('badge-lg');
    if (variant === 'primary') classes.push('badge-primary');
    if (variant === 'secondary') classes.push('badge-secondary');
    if (removable) classes.push('gap-2');
    return classes.join(' ');
  }
</script>

<span class={getClasses()}>
  <slot />
  {#if removable}
    <button type="button" class="btn btn-ghost btn-xs" on:click>×</button>
  {/if}
</span>