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

  $: if (element) {
    gsap.to(element, {
      x,
      y,
      duration: 0.5,
      ease: 'power2.out'
    });
  }
</script>

<g
  bind:this={element}
  class="agent-node"
  class:selected
  transform={`translate(${x},${y})`}
  on:click={() => dispatch('select', agent)}
  on:mouseenter={() => dispatch('hover', agent)}
  on:mouseleave={() => dispatch('hover', null)}
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
    {agent.emoji}
  </text>
  <text
    text-anchor="middle"
    dy="3.5em"
    class="text-sm font-bold fill-base-content"
  >
    {agent.name}
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
  }

  .agent-node:hover {
    transform: scale(1.1);
  }

  .agent-node.selected circle {
    filter: brightness(1.2);
  }

  text {
    pointer-events: none;
  }
</style>