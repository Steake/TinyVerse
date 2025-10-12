<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap';

  export let text: string;
  export let x: number = 0;
  export let y: number = 0;
  export let duration: number = 3;
  export let maxWidth: number = 200;
  export let stackIndex: number = 0; // vertical stacking index per agent

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

  // Simple word-wrapping based on approximate character width (~8px per char)
  function wrapWords(t: string, maxChars: number): string[] {
    const words = (t || '').split(/\s+/);
    const lines: string[] = [];
    let current = '';
    for (const w of words) {
      if (current.length === 0) {
        current = w;
      } else if ((current.length + 1 + w.length) <= maxChars) {
        current += ' ' + w;
      } else {
        lines.push(current);
        current = w;
      }
    }
    if (current.length) lines.push(current);
    return lines.length ? lines : ['']
  }

  $: approxCharWidth = 8;
  $: maxCharsPerLine = Math.max(8, Math.floor(maxWidth / approxCharWidth) - 1);
  $: lines = wrapWords((text ?? '').toString(), maxCharsPerLine);
  $: bubbleWidth = Math.max(60, Math.min(maxWidth, Math.max(...lines.map(line => line.length * approxCharWidth))));
  $: bubbleHeight = Math.max(28, lines.length * 18 + 24);

  // Vertical position with stacking offset (older bubbles appear higher)
  $: stackedY = y - 60 - stackIndex * (bubbleHeight + 8);
</script>

<g
  bind:this={element}
  transform={`translate(${x},${stackedY})`}
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
    class="stroke-base-300"
    style="fill: hsl(var(--b1)); filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2));"
    stroke-width="2"
  />
  
  <!-- Text content -->
  <text
    x={bubbleWidth / 2}
    y="4"
    text-anchor="middle"
    class="text-sm fill-base-content"
    style="paint-order: stroke fill; stroke: rgba(0,0,0,0.25); stroke-width: 1px;"
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
    <circle r="8" class="fill-base-200 hover:fill-base-300 cursor-pointer" />
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