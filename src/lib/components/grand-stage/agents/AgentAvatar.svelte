<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { gsap } from 'gsap';
  import type { Agent } from '../../../stores/agents';

  export let agent: Agent;
  export let x: number = 0;
  export let y: number = 0;
  export let selected: boolean = false;

  const dispatch = createEventDispatcher();
  const NODE_RADIUS = 30;

  let element: SVGGElement;

  $: if (element) {
    gsap.to(element, {
      x,
      y,
      duration: 1,
      ease: 'power2.inOut'
    });
  }
</script>

<g
  bind:this={element}
  class="agent-avatar"
  class:selected
  transform={`translate(${x},${y})`}
  on:click={() => dispatch('click')}
  on:mouseenter={() => dispatch('mouseenter')}
  on:mouseleave={() => dispatch('mouseleave')}
>
  <circle
    r={NODE_RADIUS}
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
  {#if selected}
    <circle
      r={NODE_RADIUS + 4}
      class="stroke-primary fill-none"
      stroke-width="2"
      stroke-dasharray="4,4"
    />
  {/if}
</g>

<style>
  .agent-avatar {
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
  }

  .agent-avatar:hover {
    transform: scale(1.1);
  }

  .agent-avatar.selected circle {
    filter: brightness(1.2);
  }
</style>