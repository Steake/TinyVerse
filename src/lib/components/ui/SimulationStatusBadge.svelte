<script lang="ts">
  import { simulationStore } from '../../stores/simulation';
  
  $: isRunning = $simulationStore.isRunning;
  $: isBusy = $simulationStore.isBusy;
  $: currentStep = $simulationStore.currentStep;
  
  $: statusText = isBusy ? 'Busy...' : isRunning ? 'Running' : 'Paused';
  $: statusClass = isBusy ? 'badge-warning' : isRunning ? 'badge-success' : 'badge-ghost';
  $: pulseClass = isBusy || isRunning ? 'animate-pulse' : '';
</script>

<div class="flex items-center gap-2 text-sm">
  <span class="text-slate-400">Simulation:</span>
  <div class="badge {statusClass} {pulseClass} gap-1">
    <span class="relative flex h-2 w-2">
      {#if isRunning || isBusy}
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
      {/if}
      <span class="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
    </span>
    {statusText}
  </div>
  {#if currentStep > 0}
    <span class="text-xs text-slate-500">Step {currentStep}</span>
  {/if}
</div>

<style lang="postcss">
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
  
  .badge-success {
    @apply bg-emerald-500/20 text-emerald-400 border border-emerald-500/30;
  }
  
  .badge-warning {
    @apply bg-amber-500/20 text-amber-400 border border-amber-500/30;
  }
  
  .badge-ghost {
    @apply bg-slate-700/30 text-slate-400 border border-slate-600/30;
  }
</style>
