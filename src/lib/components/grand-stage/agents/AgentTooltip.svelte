<script lang="ts">
  import type { Agent } from '../../../stores/types';

  export let agent: Agent;
</script>

<div 
  class="fixed top-4 left-4 bg-base-200 p-3 rounded-lg shadow-lg min-w-[200px] z-50"
>
  <div class="flex items-center gap-2 mb-2">
    <span class="text-xl">{agent.emoji}</span>
    <h3 class="font-semibold">{agent.name}</h3>
  </div>
  <div class="space-y-1 text-sm opacity-80">
    <p>{agent.occupation}</p>
    <p>{agent.nationality}</p>
    <p class="text-xs mt-2">
      {agent.personalityTraits.join(', ')}
    </p>
  </div>
</div>