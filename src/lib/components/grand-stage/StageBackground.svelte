<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { stageStore } from '../../stores/stage';
  import type { StageState } from '../../utils/mock-data/grand-stage';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let weather: StageState['weather'];
  let time: Date;

  const unsubscribe = stageStore.subscribe(state => {
    weather = state.weather;
    time = state.time;
    if (ctx && canvas) updateBackground();
  });

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
        updateBackground();
      }
    });

    if (canvas?.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    updateBackground();

    return () => {
      resizeObserver.disconnect();
    };
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  function updateBackground() {
    if (!canvas || !ctx || !time) return;
    const width = canvas.width ?? 0;
    const height = canvas.height ?? 0;
    const hour = time.getHours();
    const gradient = ctx.createLinearGradient(0, 0, 0, height);

    // Base colors based on time of day
    if (hour >= 5 && hour < 8) { // Dawn
      gradient.addColorStop(0, '#FF7F50');
      gradient.addColorStop(1, '#FFB6C1');
    } else if (hour >= 8 && hour < 16) { // Day
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0FFFF');
    } else if (hour >= 16 && hour < 19) { // Dusk
      gradient.addColorStop(0, '#FF6B6B');
      gradient.addColorStop(1, '#4A90E2');
    } else { // Night
      gradient.addColorStop(0, '#191970');
      gradient.addColorStop(1, '#483D8B');
    }

    // Apply weather effects
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    switch (weather) {
      case 'rainy':
        addRainEffect();
        break;
      case 'cloudy':
        addCloudEffect();
        break;
      case 'sunny':
        addSunEffect();
        break;
    }
  }

  function addRainEffect() {
  if (!canvas || !ctx) return;
  const { width, height } = canvas;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillRect(x, y, 1, 10);
    }
  }

  function addCloudEffect() {
  if (!canvas || !ctx) return;
  const { width, height } = canvas;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * (height / 2);
      const radius = 50 + Math.random() * 50;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function addSunEffect() {
  if (!canvas || !ctx) return;
  const { width, height } = canvas;
    const x = width * 0.8;
    const y = height * 0.2;
    const radius = 50;

    ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius
      );
      ctx.lineTo(
        x + Math.cos(angle) * (radius + 30),
        y + Math.sin(angle) * (radius + 30)
      );
      ctx.stroke();
    }
  }
</script>

<canvas
  bind:this={canvas}
  class="absolute inset-0 -z-10"
/>