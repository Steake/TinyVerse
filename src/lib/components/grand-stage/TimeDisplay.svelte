<script lang="ts">
  import { simulationStore } from '../../stores/simulation';

  let currentTime: Date;

  simulationStore.subscribe(state => {
    currentTime = state.currentTime;
  });

  $: formattedTime = currentTime?.toLocaleString();
</script>

<div class="text-lg font-mono">
  {formattedTime}
</div>