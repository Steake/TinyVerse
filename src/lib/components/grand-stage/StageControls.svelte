<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { stageStore } from '../../stores/stage';
  import { simulationStore } from '../../stores/simulation';
  import { toastStore } from '../../stores/toast';
  import { timelineStore } from '../../stores/timeline';
  import type { StageState } from '../../utils/mock-data/grand-stage';

  const dispatch = createEventDispatcher<{
    weatherChange: StageState['weather'];
    timeChange: Date;
    resetView: void;
    fitToBounds: void;
  }>();

  const stage = stageStore;
  const simulation = simulationStore;
  const timeline = timelineStore;

  const speedOptions = [0.5, 1, 1.5, 2, 4];

  let weather: StageState['weather'] = 'sunny';
  let timeInput = '09:00';
  let speed = 1;

  $: weather = $stage.weather;
  $: timeInput = formatTime($stage.time);
  $: speed = $simulation.speed;
  $: isBusy = $simulation.isBusy;
  $: blockingBeatActive = ($timeline.beats ?? []).some((beat) => beat.status === 'active' && beat.blocking);

  function formatTime(date?: Date) {
    if (!date) return '00:00';
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function handleWeatherChange(event: Event) {
    const newWeather = (event.target as HTMLSelectElement).value as StageState['weather'];
    stageStore.updateWeather(newWeather);
    dispatch('weatherChange', newWeather);
  }

  function handleTimeChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const [hours, minutes] = value.split(':').map(Number);
    const current = $stage.time ?? new Date();
    const updated = new Date(current);
    updated.setHours(hours ?? 0, minutes ?? 0, 0, 0);
    stageStore.updateTime(updated);
    dispatch('timeChange', updated);
  }

  async function togglePlayPause() {
    if ($simulation.isBusy) return;
    if (blockingBeatActive) {
      toastStore.warning('Complete the blocking story beat before resuming playback.');
      return;
    }
    try {
      if ($simulation.isRunning) {
        await simulation.pause();
      } else {
        await simulation.start();
      }
    } catch (error) {
      console.error('Failed to toggle simulation', error);
      // Toast already shown by simulation store, don't duplicate
    }
  }

  async function handleStepForward() {
  if ($simulation.isBusy || blockingBeatActive) return;
    try {
      await simulation.step(1);
    } catch (error) {
      console.error('Failed to advance simulation', error);
      toastStore.error('Unable to advance simulation');
    }
  }

  function handleSpeedChange(event: Event) {
    const nextSpeed = Number((event.target as HTMLSelectElement).value);
    simulation.setSpeed(nextSpeed);
  }

  function handleResetView() {
    dispatch('resetView');
  }

  function handleFitToBounds() {
    dispatch('fitToBounds');
  }
</script>

<div class="controls-shell">
  <div class="environment-controls">
    <div class="form-control">
      <label class="label" for="weather">
        <span class="label-text">Weather</span>
      </label>
      <select
        id="weather"
        class="select select-bordered select-sm"
        value={weather}
        on:change={handleWeatherChange}
      >
        <option value="sunny">☀️ Sunny</option>
        <option value="cloudy">☁️ Cloudy</option>
        <option value="rainy">🌧️ Rainy</option>
      </select>
    </div>

    <div class="form-control">
      <label class="label" for="time">
        <span class="label-text">Time</span>
      </label>
      <input
        type="time"
        id="time"
        class="input input-bordered input-sm"
        bind:value={timeInput}
        on:change={handleTimeChange}
      />
    </div>
  </div>

  <div class="playback-controls">
    <div class="btn-group">
      <button class="btn btn-sm btn-outline" on:click={handleResetView} title="Reset view" aria-label="Reset view">↺</button>
      <button class="btn btn-sm btn-outline" on:click={handleFitToBounds} title="Fit to bounds" aria-label="Fit to bounds">⤢</button>
    </div>
    <button
      class={`btn btn-sm ${$simulation.isRunning ? 'btn-secondary' : 'btn-primary'}`}
      on:click={togglePlayPause}
  disabled={$simulation.isBusy || blockingBeatActive}
      aria-pressed={$simulation.isRunning}
    >
      {#if $simulation.isRunning}
        ⏸ Pause
      {:else}
        ▶️ Play
      {/if}
    </button>

    <button
      class="btn btn-sm btn-outline"
      on:click={handleStepForward}
  disabled={$simulation.isBusy || $simulation.isRunning || blockingBeatActive}
      aria-label="Advance simulation one step"
    >
      ⏭ Step
    </button>

    <label class="speed-selector">
      <span>Speed</span>
      <select
        class="select select-bordered select-sm"
        value={speed}
        on:change={handleSpeedChange}
        disabled={$simulation.isBusy}
      >
        {#each speedOptions as option (option)}
          <option value={option}>{option}×</option>
        {/each}
      </select>
    </label>

    <span class={`badge badge-sm ${blockingBeatActive ? 'badge-error' : $simulation.isBusy ? 'badge-warning' : $simulation.isRunning ? 'badge-success' : 'badge-ghost'}`}>
      {#if blockingBeatActive}
        Awaiting story beat
      {:else if $simulation.isBusy}
        Working…
      {:else if $simulation.isRunning}
        Running
      {:else}
        Paused
      {/if}
    </span>
  </div>
</div>

<style>
  .controls-shell {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: center;
    padding: 1rem 1.25rem;
    background: rgba(15, 23, 42, 0.72);
    border-radius: 0.85rem;
    box-shadow: 0 12px 30px rgba(2, 6, 23, 0.4);
    border: 1px solid rgba(94, 110, 135, 0.28);
    backdrop-filter: blur(12px);
  }

  .environment-controls,
  .playback-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .playback-controls {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
  }

  .speed-selector {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: rgba(226, 232, 240, 0.78);
  }

  @media (max-width: 900px) {
    .controls-shell {
      flex-direction: column;
      align-items: stretch;
    }

    .environment-controls,
    .playback-controls {
      width: 100%;
      justify-content: space-between;
    }

    .playback-controls {
      margin-left: 0;
      flex-wrap: wrap;
    }
  }
</style>