<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { simulationStore } from '../../stores/simulation';

  let animationFrameId: number;

  function animate() {
    if ($simulationStore.isRunning) {
      simulationStore.tick();
    }
    animationFrameId = requestAnimationFrame(animate);
  }

  onMount(() => {
    animationFrameId = requestAnimationFrame(animate);
    simulationStore.refresh().catch(error => {
      console.error('Failed to refresh simulation state', error);
    });
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

  async function handleStart() {
    try {
      await simulationStore.start();
    } catch (error) {
      console.error('Start simulation failed', error);
    }
  }

  async function handlePause() {
    try {
      await simulationStore.pause();
    } catch (error) {
      console.error('Pause simulation failed', error);
    }
  }

  async function handleStep() {
    try {
      await simulationStore.step();
    } catch (error) {
      console.error('Step simulation failed', error);
    }
  }
</script>

<div class="flex items-center gap-md">
  <div class="flex items-center gap-sm">
    <button
      class="btn-secondary btn-icon"
      on:click={handleStep}
      disabled={$simulationStore.isRunning}
      aria-label="Step forward"
    >
      ⏭️
    </button>

    {#if $simulationStore.isRunning}
      <button
        class="btn-primary btn-icon"
        on:click={handlePause}
        aria-label="Pause simulation"
      >
        ⏸️
      </button>
    {:else}
      <button
        class="btn-primary btn-icon"
        on:click={handleStart}
        aria-label="Start simulation"
      >
        ▶️
      </button>
    {/if}
  </div>

  <div class="flex items-center gap-sm">
    <span class="text-sm">Speed:</span>
    <div class="flex items-center gap-xs">
      <input
        type="range"
        min="0.1"
        max="5"
        step="0.1"
        value={$simulationStore.speed}
        on:input={handleSpeedChange}
        aria-label="Simulation speed"
        style="width: 120px;"
      />
      <span class="badge badge-neutral">
        {$simulationStore.speed}x
      </span>
    </div>
  </div>
</div>