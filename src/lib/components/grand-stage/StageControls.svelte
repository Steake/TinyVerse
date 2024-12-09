<script lang="ts">
  import { stageStore } from '../../stores/stage';
  import type { StageState } from '../../utils/mock-data/grand-stage';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    weatherChange: StageState['weather'];
    timeChange: Date;
  }>();

  let weather: StageState['weather'];
  let time: Date;

  stageStore.subscribe(state => {
    weather = state.weather;
    time = state.time;
  });

  function handleWeatherChange(event: Event) {
    const newWeather = (event.target as HTMLSelectElement).value as StageState['weather'];
    stageStore.updateWeather(newWeather);
    dispatch('weatherChange', newWeather);
  }

  function handleTimeChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const [hours, minutes] = value.split(':').map(Number);
    const newTime = new Date(time);
    newTime.setHours(hours, minutes);
    stageStore.updateTime(newTime);
    dispatch('timeChange', newTime);
  }
</script>

<div class="flex items-center gap-4 p-4 bg-base-200 shadow-md">
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
      value={time.toTimeString().slice(0, 5)}
      on:change={handleTimeChange}
    />
  </div>

  <div class="flex-1" />

  <button class="btn btn-primary btn-sm">
    Add Agent
  </button>
</div>