<script lang="ts">
  import { onMount } from 'svelte';
  import { stageStore } from '../../stores/stage';
  import { agentStore } from '../../stores/agents';
  import StageControls from './StageControls.svelte';
  import StageBackground from './StageBackground.svelte';
  import AgentNode from './agents/AgentNode.svelte';
  import SpeechBubble from './speech/SpeechBubble.svelte';
  import AgentTooltip from './agents/AgentTooltip.svelte';
  import type { Interaction } from '../../utils/mock-data/grand-stage';

  let activeAgents = [];
  let agentPositions = {};
  let currentInteractions: Interaction[] = [];
  let hoveredAgent: Agent | null = null;

  stageStore.subscribe(state => {
    activeAgents = state.activeAgents;
    agentPositions = state.agentPositions;
    currentInteractions = state.currentInteractions;
  });

  function handleAgentMove(event: CustomEvent<{ id: string; x: number; y: number }>) {
    const { id, x, y } = event.detail;
    stageStore.updateAgentPosition(id, x, y);
  }

  function handleAgentHover(event: CustomEvent<Agent | null>) {
    hoveredAgent = event.detail;
  }

  function handleInteractionComplete(interactionId: string) {
    stageStore.removeInteraction(interactionId);
  }
</script>

<div class="h-full flex flex-col">
  <StageControls />

  <div class="flex-1 relative overflow-hidden">
    <StageBackground />

    <div class="absolute inset-0">
      <!-- Agents -->
      {#each activeAgents as agentId}
        {@const agent = $agentStore.find(a => a.id === agentId)}
        {@const position = agentPositions[agentId]}
        {#if agent && position}
          <AgentNode
            {agent}
            x={position.x}
            y={position.y}
            on:move={handleAgentMove}
            on:hover={handleAgentHover}
          />
        {/if}
      {/each}

      <!-- Interactions -->
      {#each currentInteractions as interaction (interaction.id)}
        {@const agent = $agentStore.find(a => a.id === interaction.participants[0])}
        {@const position = agentPositions[interaction.participants[0]]}
        {#if agent && position}
          <SpeechBubble
            text={interaction.content}
            x={position.x}
            y={position.y - 60}
            duration={interaction.duration / 1000}
            on:complete={() => handleInteractionComplete(interaction.id)}
          />
        {/if}
      {/each}

      <!-- Agent Tooltip -->
      {#if hoveredAgent}
        <AgentTooltip agent={hoveredAgent} />
      {/if}
    </div>
  </div>
</div>

<style>
  .absolute {
    position: absolute;
  }

  .inset-0 {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
</style>