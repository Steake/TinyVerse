<script lang="ts">
  import ResultsExtractor from './ResultsExtractor.svelte';
  import DataVisualizer from './DataVisualizer.svelte';
  import StoryGenerator from './StoryGenerator.svelte';

  let activeTab: 'results' | 'visualization' | 'story' = 'results';
</script>

<div class="h-full flex flex-col">
  <div class="p-6 bg-base-200">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Critic's Corner</h2>
      <div class="tabs tabs-boxed">
        <button
          class="tab {activeTab === 'results' ? 'tab-active' : ''}"
          on:click={() => activeTab = 'results'}
        >
          Results Extraction
        </button>
        <button
          class="tab {activeTab === 'visualization' ? 'tab-active' : ''}"
          on:click={() => activeTab = 'visualization'}
        >
          Data Visualization
        </button>
        <button
          class="tab {activeTab === 'story' ? 'tab-active' : ''}"
          on:click={() => activeTab = 'story'}
        >
          Story Generation
        </button>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-auto p-6">
    {#if activeTab === 'results'}
      <ResultsExtractor />
    {:else if activeTab === 'visualization'}
      <DataVisualizer />
    {:else}
      <StoryGenerator />
    {/if}
  </div>
</div>