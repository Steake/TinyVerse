<script lang="ts">
  import type { Agent } from '../../../stores/types';

  export let agent: Agent;
</script>

<div 
  class="tooltip-card fixed top-4 left-4 min-w-[220px] z-50"
>
  <div class="flex items-center gap-2 mb-2">
    <span class="text-xl">{agent.emoji}</span>
    <h3 class="font-semibold text-base">{agent.name}</h3>
  </div>
  <div class="tooltip-body space-y-1 text-sm">
    <p class="text-[0.83rem]">{agent.occupation}</p>
    <p class="text-[0.83rem] opacity-80">{agent.nationality}</p>
    <p class="text-xs mt-2 opacity-70 font-medium tracking-wide">
      {(agent.personality_traits ?? []).join(', ')}
    </p>
  </div>
</div>

<style>
  .tooltip-card {
    background: linear-gradient(140deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.88));
    padding: 1rem;
    border-radius: 0.85rem;
    box-shadow: 0 20px 40px rgba(2, 6, 23, 0.55);
    border: 1px solid rgba(148, 163, 184, 0.24);
    color: rgba(226, 232, 240, 0.92);
    backdrop-filter: blur(12px);
  }

  .tooltip-body p {
    margin: 0;
  }
</style>
