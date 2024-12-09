<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap';

  export let text: string;
  export let x: number = 0;
  export let y: number = 0;
  export let duration: number = 3;
  export let maxWidth: number = 200;

  let element: SVGGElement;
  let timeline: gsap.core.Timeline;

  onMount(() => {
    timeline = gsap.timeline()
      .from(element, {
        opacity: 0,
        scale: 0,
        duration: 0.3,
        ease: 'back.out(1.7)'
      })
      .to(element, {
        opacity: 0,
        y: y - 20,
        duration: 0.5,
        delay: duration,
        ease: 'power2.in'
      });
  });

  onDestroy(() => {
    if (timeline) timeline.kill();
  });

  // Calculate bubble dimensions based on text length
  $: lines = text.split('\n');
  $: bubbleWidth = Math.min(maxWidth, Math.max(...lines.map(line => line.length * 8)));
  $: bubbleHeight = lines.length * 20 + 20;
</script>

<g
  bind:this={element}
  transform={`translate(${x},${y})`}
  class="speech-bubble"
>
  <!-- Bubble background -->
  <path
    d={`
      M0,0
      L10,-10
      H${bubbleWidth - 10}
      Q${bubbleWidth},-10 ${bubbleWidth},0
      V${bubbleHeight - 10}
      Q${bubbleWidth},${bubbleHeight} ${bubbleWidth - 10},${bubbleHeight}
      H10
      Q0,${bubbleHeight} 0,${bubbleHeight - 10}
      Z
    `}
    class="fill-white stroke-base-300"
    stroke-width="2"
  />
  
  <!-- Text content -->
  <text
    x={bubbleWidth / 2}
    y="4"
    text-anchor="middle"
    class="text-sm fill-base-content"
  >
    {#each lines as line, i}
      <tspan x={bubbleWidth / 2} dy={i === 0 ? '1em' : '1.2em'}>
        {line}
      </tspan>
    {/each}
  </text>

  <!-- Optional text-to-speech button -->
  <g
    class="tts-button"
    transform={`translate(${bubbleWidth - 24}, 8)`}
  >
    <circle
      r="8"
      class="fill-base-200 hover:fill-base-300 cursor-pointer"
    />
    <text
      y="1"
      text-anchor="middle"
      dominant-baseline="middle"
      class="text-xs fill-base-content"
    >
      🔊
    </text>
  </g>
</g>

<style>
  .speech-bubble {
    pointer-events: none;
  }

  .speech-bubble .tts-button {
    pointer-events: all;
  }
</style>