<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Agent } from '../../../stores/types';
  import { gsap } from 'gsap';

  export let agent: Agent;
  export let x: number = 0;
  export let y: number = 0;
  export let selected: boolean = false;

  const dispatch = createEventDispatcher<{
    move: { id: string; x: number; y: number };
    select: Agent;
    hover: Agent | null;
  }>();

  let element: SVGGElement;

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dispatch('select', agent);
    }
  };

  const handleFocus = () => {
    dispatch('hover', agent);
  };

  const handleBlur = () => {
    dispatch('hover', null);
  };

  $: if (element) {
    gsap.to(element, {
      x,
      y,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  // Safe fallbacks to avoid "undefined" showing in UI
  $: safeName = (agent?.name || '').trim() || 'Unnamed';
  $: safeEmoji = (agent?.emoji || '').trim() || '👤';
</script>

<g
  bind:this={element}
  class="agent-node"
  class:selected
  transform={`translate(${x},${y})`}
  role="button"
  tabindex="0"
  aria-pressed={selected}
  aria-label={`Select ${safeName}`}
  on:click={() => dispatch('select', agent)}
  on:mouseenter={() => dispatch('hover', agent)}
  on:mouseleave={() => dispatch('hover', null)}
  on:focus={handleFocus}
  on:blur={handleBlur}
  on:keydown={handleKeydown}
>
  <circle
    r="30"
    class="fill-primary stroke-base-100"
    stroke-width="2"
  />
  <text
    text-anchor="middle"
    dy=".3em"
    class="text-2xl select-none pointer-events-none"
  >
    {safeEmoji}
  </text>
  <text
    text-anchor="middle"
    dy="3.5em"
    class="text-sm font-bold fill-base-content"
    style="paint-order: stroke fill; stroke: rgba(0,0,0,0.45); stroke-width: 2px;"
  >
    {safeName}
  </text>
  {#if selected}
    <circle
      r="34"
      class="stroke-primary fill-none"
      stroke-width="2"
      stroke-dasharray="4,4"
    />
  {/if}
</g>

<style>
  .agent-node {
    cursor: pointer;
    transition: transform 0.2s ease-out;
    outline: none;
  }

  .agent-node:hover {
    transform: scale(1.1);
  }

  .agent-node:focus-visible {
    transform: scale(1.1);
  }

  .agent-node:focus-visible circle {
    stroke-width: 3;
    stroke: hsl(var(--p));
  }

  .agent-node.selected circle {
    filter: brightness(1.2);
  }

  text {
    pointer-events: none;
  }
</style>