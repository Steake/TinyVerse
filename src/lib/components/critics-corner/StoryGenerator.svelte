<script lang="ts">
  import { simulationStore, type SimulationLog } from '../../stores/simulation';
  import { agentStore } from '../../stores/agents';

  let selectedAgents: string[] = [];
  let selectedEventTypes: string[] = [];
  let narrativeStyle: 'descriptive' | 'dramatic' | 'humorous' = 'descriptive';
  let prompt = '';
  let generatedStory = '';
  let loading = false;
  let error: string | null = null;
  let wordCount = 0;

  const styles = [
    { id: 'descriptive', label: 'Descriptive', description: 'A detailed, objective narrative' },
    { id: 'dramatic', label: 'Dramatic', description: 'An emotional, theatrical story' },
    { id: 'humorous', label: 'Humorous', description: 'A light-hearted, comedic tale' }
  ];

  const eventTypes = [
    { id: 'MOVE', label: 'Movement' },
    { id: 'TALK', label: 'Conversation' },
    { id: 'WRITE_DOCUMENT', label: 'Document Creation' },
    { id: 'CREATE_EVENT', label: 'Calendar Events' }
  ];

  $: filteredLogs = filterLogs($simulationStore.logs);
  $: wordCount = prompt.trim().split(/\s+/).length;

  function filterLogs(logs: SimulationLog[]): SimulationLog[] {
    return logs.filter(log => {
      if (selectedAgents.length && !selectedAgents.includes(log.agentId)) return false;
      if (selectedEventTypes.length && !selectedEventTypes.includes(log.action)) return false;
      return true;
    });
  }

  function formatLogForStory(log: SimulationLog): string {
    const agent = $agentStore.find(a => a.id === log.agentId);
    const agentName = agent?.name || 'Unknown Agent';

    switch (log.action) {
      case 'MOVE':
        return `${agentName} moved to ${log.data.location}`;
      case 'TALK':
        return `${agentName} said "${log.data.message}"`;
      case 'WRITE_DOCUMENT':
        return `${agentName} wrote a document titled "${log.data.title}"`;
      case 'CREATE_EVENT':
        return `${agentName} scheduled an event: ${log.data.title}`;
      default:
        return `${agentName} performed an action: ${log.action}`;
    }
  }

  async function generateStory() {
    loading = true;
    error = null;

    try {
      const events = filteredLogs.map(formatLogForStory);
      
      // In a real implementation, this would call an API
      // For now, we'll generate a simple story based on the events
      const storyIntro = getStoryIntro(narrativeStyle);
      const storyEvents = events
        .map(event => addNarrativeStyle(event, narrativeStyle))
        .join(' ');
      const storyOutro = getStoryOutro(narrativeStyle);

      generatedStory = `${storyIntro}\n\n${storyEvents}\n\n${storyOutro}`;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      error = e.message;
      generatedStory = '';
    } finally {
      loading = false;
    }
  }

  function getStoryIntro(style: string): string {
    switch (style) {
      case 'dramatic':
        return 'In a world of endless possibilities...';
      case 'humorous':
        return 'Get ready for a tale that might make you chuckle...';
      default:
        return 'Here\'s what happened in our simulation:';
    }
  }

  function getStoryOutro(style: string): string {
    switch (style) {
      case 'dramatic':
        return 'And thus, another chapter in our grand saga comes to a close...';
      case 'humorous':
        return 'And that\'s all folks! (No agents were harmed in the making of this story)';
      default:
        return 'End of simulation events.';
    }
  }

  function addNarrativeStyle(event: string, style: string): string {
    switch (style) {
      case 'dramatic':
        return event.replace(/moved to|said|wrote|scheduled/g, match => {
          const dramatic = {
            'moved to': 'ventured forth to',
            'said': 'proclaimed',
            'wrote': 'penned with great purpose',
            'scheduled': 'decreed'
          };
          return dramatic[match] || match;
        });
      case 'humorous':
        return event.replace(/moved to|said|wrote|scheduled/g, match => {
          const humorous = {
            'moved to': 'skipped merrily to',
            'said': 'blurted out',
            'wrote': 'scribbled',
            'scheduled': 'penciled in'
          };
          return humorous[match] || match;
        });
      default:
        return event;
    }
  }

  function downloadStory() {
    const blob = new Blob([generatedStory], { type: 'text/plain' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'simulation_story.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<div class="space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Agent Selection -->
    <div class="form-control">
      <label class="label">Featured Agents</label>
      <div class="flex flex-wrap gap-2">
        {#each $agentStore as agent}
          <label class="label cursor-pointer gap-2">
            <input
              type="checkbox"
              class="checkbox"
              bind:group={selectedAgents}
              value={agent.id}
            />
            <span class="label-text">{agent.name}</span>
          </label>
        {/each}
      </div>
    </div>

    <!-- Event Type Selection -->
    <div class="form-control">
      <label class="label">Event Types</label>
      <div class="flex flex-wrap gap-2">
        {#each eventTypes as eventType}
          <label class="label cursor-pointer gap-2">
            <input
              type="checkbox"
              class="checkbox"
              bind:group={selectedEventTypes}
              value={eventType.id}
            />
            <span class="label-text">{eventType.label}</span>
          </label>
        {/each}
      </div>
    </div>
  </div>

  <!-- Narrative Style -->
  <div class="form-control">
    <label class="label">Narrative Style</label>
    <div class="flex gap-4">
      {#each styles as style}
        <label class="label cursor-pointer gap-2">
          <input
            type="radio"
            class="radio"
            bind:group={narrativeStyle}
            value={style.id}
          />
          <div>
            <span class="label-text font-medium">{style.label}</span>
            <p class="text-sm opacity-70">{style.description}</p>
          </div>
        </label>
      {/each}
    </div>
  </div>

  <!-- Custom Prompt -->
  <div class="form-control">
    <label class="label" for="prompt">
      <span class="label-text">Custom Prompt</span>
      <span class="label-text-alt">{wordCount} words</span>
    </label>
    <textarea
      id="prompt"
      class="textarea textarea-bordered h-24"
      placeholder="Add any specific instructions or themes for the story..."
      bind:value={prompt}
    />
  </div>

  <!-- Actions -->
  <div class="flex gap-2">
    <button
      class="btn btn-primary"
      on:click={generateStory}
      disabled={loading}
    >
      {loading ? 'Generating...' : 'Generate Story'}
    </button>
    {#if generatedStory}
      <button class="btn" on:click={downloadStory}>
        Download Story
      </button>
    {/if}
  </div>

  {#if error}
    <div class="alert alert-error">
      <span>{error}</span>
    </div>
  {/if}

  <!-- Generated Story -->
  {#if generatedStory}
    <div class="card bg-base-200">
      <div class="card-body prose max-w-none">
        {#each generatedStory.split('\n') as paragraph}
          <p>{paragraph}</p>
        {/each}
      </div>
    </div>
  {/if}
</div>