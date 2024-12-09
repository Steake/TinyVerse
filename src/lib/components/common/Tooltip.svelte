<script lang="ts">
  export let text: string;
  export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
</script>

<div class="tooltip-wrapper group relative">
  <div 
    class="tooltip absolute hidden group-hover:block bg-base-300 text-base-content p-2 rounded-lg shadow-lg text-sm whitespace-nowrap z-50"
    class:tooltip-top={position === 'top'}
    class:tooltip-bottom={position === 'bottom'}
    class:tooltip-left={position === 'left'}
    class:tooltip-right={position === 'right'}
  >
    {text}
  </div>
  <slot />
</div>

<style>
  .tooltip-wrapper {
    display: contents;
  }

  .tooltip {
    transform: translateX(-50%);
  }

  .tooltip-top {
    bottom: calc(100% + 0.5rem);
    left: 50%;
  }

  .tooltip-bottom {
    top: calc(100% + 0.5rem);
    left: 50%;
  }

  .tooltip-left {
    right: calc(100% + 0.5rem);
    top: 50%;
    transform: translateY(-50%);
  }

  .tooltip-right {
    left: calc(100% + 0.5rem);
    top: 50%;
    transform: translateY(-50%);
  }
</style>