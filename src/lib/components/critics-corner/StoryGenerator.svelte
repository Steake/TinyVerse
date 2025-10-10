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
      if (selectedAgents.length && (!log.agentId || !selectedAgents.includes(log.agentId))) return false;
      if (selectedEventTypes.length && !selectedEventTypes.includes(log.action)) return false;
      return true;
    });
  }

  function formatLogForStory(log: SimulationLog): string {
    const agent = $agentStore.find(a => a.id === log.agentId);
    const agentName = log.agentName || agent?.name || 'Unknown Agent';
    const metadata = log.metadata ?? {};
    const rawContent = (metadata.rawContent ?? {}) as Record<string, unknown>;

    const getString = (value: unknown): string | null => {
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
      return null;
    };

    const location = getString(metadata.location) ?? getString(rawContent.location);
    const message = getString(log.content) ?? getString(rawContent.message);
    const title = getString(rawContent.title) ?? getString(metadata.title);

    switch (log.action) {
      case 'MOVE':
        return location
          ? `${agentName} moved to ${location}`
          : `${agentName} moved`;
      case 'TALK':
        return message
          ? `${agentName} said "${message}"`
          : `${agentName} spoke.`;
      case 'WRITE_DOCUMENT':
        return title
          ? `${agentName} wrote a document titled "${title}"`
          : `${agentName} wrote a document.`;
      case 'CREATE_EVENT':
        return title
          ? `${agentName} scheduled an event: ${title}`
          : `${agentName} scheduled an event.`;
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
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = 'Failed to generate story';
      }
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
          const dramatic: Record<'moved to' | 'said' | 'wrote' | 'scheduled', string> = {
            'moved to': 'ventured forth to',
            said: 'proclaimed',
            wrote: 'penned with great purpose',
            scheduled: 'decreed'
          };
          const key = match as keyof typeof dramatic;
          return dramatic[key] ?? match;
        });
      case 'humorous':
        return event.replace(/moved to|said|wrote|scheduled/g, match => {
          const humorous: Record<'moved to' | 'said' | 'wrote' | 'scheduled', string> = {
            'moved to': 'skipped merrily to',
            said: 'blurted out',
            wrote: 'scribbled',
            scheduled: 'penciled in'
          };
          const key = match as keyof typeof humorous;
          return humorous[key] ?? match;
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
    <fieldset class="form-control">
      <legend class="label-text font-semibold">Featured Agents</legend>
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
    </fieldset>

    <!-- Event Type Selection -->
    <fieldset class="form-control">
      <legend class="label-text font-semibold">Event Types</legend>
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
    </fieldset>
  </div>

  <!-- Narrative Style -->
  <fieldset class="form-control">
    <legend class="label-text font-semibold">Narrative Style</legend>
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
  </fieldset>

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