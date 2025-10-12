<script lang="ts">
  import { tokenUsage } from '../stores/tokenUsage';
  
  $: usage = $tokenUsage;
  
  function formatNumber(num: number): string {
    return num.toLocaleString();
  }
  
  function handleReset() {
    if (confirm('Reset token counter for this session?')) {
      tokenUsage.reset();
    }
  }
</script>

<footer class="fixed bottom-0 left-64 right-0 bg-base-300/95 backdrop-blur border-t border-base-content/10 px-4 py-2 z-40">
  <div class="container mx-auto flex items-center justify-between text-xs">
    <div class="flex items-center gap-4">
      <div class="tooltip tooltip-top" data-tip="Total tokens consumed this session">
        <span class="font-mono">
          <span class="font-semibold">Total:</span> 
          <span class="text-primary">{formatNumber(usage.totalTokens)}</span>
        </span>
      </div>
      
      <div class="tooltip tooltip-top" data-tip="Input tokens (prompts)">
        <span class="font-mono text-base-content/70">
          <span class="text-success">↑</span> {formatNumber(usage.promptTokens)}
        </span>
      </div>
      
      <div class="tooltip tooltip-top" data-tip="Output tokens (completions)">
        <span class="font-mono text-base-content/70">
          <span class="text-warning">↓</span> {formatNumber(usage.completionTokens)}
        </span>
      </div>
    </div>
    
    <button 
      class="btn btn-ghost btn-xs" 
      on:click={handleReset}
      aria-label="Reset token counter"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Reset
    </button>
  </div>
</footer>
