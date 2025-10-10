<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap';

  export let type: 'write' | 'calendar' | 'custom' = 'write';
  export let x: number = 0;
  export let y: number = 0;
  export let onComplete: () => void = () => {};

  let element: SVGGElement;
  let timeline: gsap.core.Timeline;

  const animations: Record<'write' | 'calendar' | 'custom', {
    icon: string;
    duration: number;
    create: (target: SVGElement) => gsap.core.Timeline;
  }> = {
    write: {
      icon: '✍️',
      duration: 2,
      create: (target: SVGElement) => 
        gsap.timeline()
          .from(target, {
            opacity: 0,
            scale: 0,
            rotation: -45,
            duration: 0.5,
            ease: 'back.out(1.7)'
          })
          .to(target, {
            y: -20,
            rotation: 45,
            duration: 1.5,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: 1
          })
          .to(target, {
            opacity: 0,
            scale: 0,
            duration: 0.3,
            onComplete
          })
    },
    calendar: {
      icon: '📅',
      duration: 1.5,
      create: (target: SVGElement) =>
        gsap.timeline()
          .from(target, {
            opacity: 0,
            scale: 0,
            duration: 0.3,
            ease: 'back.out(1.7)'
          })
          .to(target, {
            scale: 1.2,
            duration: 0.2,
            repeat: 1,
            yoyo: true
          })
          .to(target, {
            opacity: 0,
            scale: 0,
            duration: 0.3,
            delay: 0.5,
            onComplete
          })
    },
    custom: {
      icon: '🛠️',
      duration: 1.2,
      create: (target: SVGElement) =>
        gsap.timeline()
          .from(target, {
            opacity: 0,
            scale: 0.5,
            duration: 0.3,
            ease: 'back.out(1.7)'
          })
          .to(target, {
            scale: 1.1,
            rotation: 10,
            duration: 0.4,
            yoyo: true,
            repeat: 1
          })
          .to(target, {
            opacity: 0,
            scale: 0.5,
            rotation: 0,
            duration: 0.3,
            onComplete
          })
    }
  };

  onMount(() => {
    const animation = animations[type];
    if (animation) {
      timeline = animation.create(element);
    }
  });

  onDestroy(() => {
    if (timeline) timeline.kill();
  });
</script>

<g
  bind:this={element}
  transform={`translate(${x},${y})`}
  class="tool-animation"
>
  <text
    text-anchor="middle"
    dominant-baseline="middle"
    class="text-2xl select-none"
  >
    {animations[type].icon}
  </text>
</g>

<style>
  .tool-animation {
    pointer-events: none;
  }
</style>