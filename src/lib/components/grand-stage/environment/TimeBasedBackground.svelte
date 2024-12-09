<script lang="ts">
  import { onMount } from 'svelte';
  import { simulationStore } from '../../../stores/simulation';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  $: if (ctx && $simulationStore.currentTime) {
    updateBackground($simulationStore.currentTime);
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
        updateBackground($simulationStore.currentTime);
      }
    });

    resizeObserver.observe(canvas.parentElement!);

    return () => {
      resizeObserver.disconnect();
    };
  });

  function updateBackground(time: Date) {
    if (!ctx) return;

    const hour = time.getHours();
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient based on time of day
    const gradient = ctx.createLinearGradient(0, 0, 0, height);

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

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle noise texture
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 10 - 5;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }

    ctx.putImageData(imageData, 0, 0);
  }
</script>

<canvas
  bind:this={canvas}
  class="absolute inset-0 -z-10 opacity-10"
/>