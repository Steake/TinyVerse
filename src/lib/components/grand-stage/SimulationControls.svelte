<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { simulationStore } from '../../stores/simulation';

  let animationFrameId: number;
  let lastTime = performance.now();

  function animate(currentTime: number) {
    if ($simulationStore.isRunning) {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      simulationStore.tick(deltaTime);
    }
    animationFrameId = requestAnimationFrame(animate);
  }

  onMount(() => {
    simulationStore.reset();
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(animate);
  });

  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });

  function handleSpeedChange(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value);
    simulationStore.setSpeed(value);
  }
</script>

<div class="flex items-center gap-4">
  <div class="flex items-center gap-2">
    <button
      class="btn btn-circle btn-sm"
      on:click={() => simulationStore.step()}
      disabled={$simulationStore.isRunning}
      aria-label="Step forward"
    >
      ⏭️
    </button>

    {#if $simulationStore.isRunning}
      <button
        class="btn btn-circle btn-sm btn-primary"
        on:click={() => simulationStore.pause()}
        aria-label="Pause simulation"
      >
        ⏸️
      </button>
    {:else}
      <button
        class="btn btn-circle btn-sm btn-primary"
        on:click={() => simulationStore.start()}
        aria-label="Start simulation"
      >
        ▶️
      </button>
    {/if}
  </div>

  <div class="flex items-center gap-2">
    <span class="text-sm">Speed:</span>
    <div class="join">
      <input
        type="range"
        min="0.1"
        max="5"
        step="0.1"
        value={$simulationStore.speed}
        class="range range-xs join-item"
        on:input={handleSpeedChange}
        aria-label="Simulation speed"
      />
      <span class="join-item px-2 bg-base-200 text-sm">
        {$simulationStore.speed}x
      </span>
    </div>
  </div>
</div>