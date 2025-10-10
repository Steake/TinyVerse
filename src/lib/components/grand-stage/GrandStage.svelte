<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { stageStore } from '../../stores/stage';
  import { agentStore } from '../../stores/agents';
  import { worldStore } from '../../stores/world';
  import { openWizard } from '../../stores/setupWizard';
  import StageControls from './StageControls.svelte';
  import StageBackground from './StageBackground.svelte';
  import AgentNode from './agents/AgentNode.svelte';
  import SpeechBubble from './speech/SpeechBubble.svelte';
  import AgentTooltip from './agents/AgentTooltip.svelte';
  import TranscriptDrawer from './TranscriptDrawer.svelte';
  import type { Interaction } from '../../utils/mock-data/grand-stage';
  import type { Agent } from '../../stores/types';

  let activeAgents: string[] = [];
  let agentPositions: Record<string, { x: number; y: number }> = {};
  let currentInteractions: Interaction[] = [];
  let hoveredAgent: Agent | null = null;
  let locations: import('../../stores/types').Location[] = [];
  let connections: import('../../stores/types').Connection[] = [];
  const SCALE = 5;

  // Simple zoom/pan state
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;
  let isPanning = false;
  let panStart = { x: 0, y: 0 };

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = Math.sign(e.deltaY) * -0.1;
    const prev = zoom;
    zoom = Math.min(3, Math.max(0.4, zoom + delta));
    // Zoom towards cursor
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    offsetX = cx - (cx - offsetX) * (zoom / prev);
    offsetY = cy - (cy - offsetY) * (zoom / prev);
  }

  function onMouseDown(e: MouseEvent) {
    isPanning = true;
    panStart = { x: e.clientX - offsetX, y: e.clientY - offsetY };
  }
  function onMouseMove(e: MouseEvent) {
    if (!isPanning) return;
    offsetX = e.clientX - panStart.x;
    offsetY = e.clientY - panStart.y;
  }
  function onMouseUp() { isPanning = false; }
  function onMouseLeave() { isPanning = false; }

  function resetView() {
    zoom = 1;
    offsetX = 0;
    offsetY = 0;
  }

  function fitToBounds() {
    // Fit all locations into view; fallback to reset if none
    if (!locations?.length) { resetView(); return; }
    const padding = 40;
    const minX = Math.min(...locations.map(l => (l.x ?? 0) * SCALE));
    const minY = Math.min(...locations.map(l => (l.y ?? 0) * SCALE));
    const maxX = Math.max(...locations.map(l => ((l.x ?? 0) + (l.width ?? 0)) * SCALE));
    const maxY = Math.max(...locations.map(l => ((l.y ?? 0) + (l.height ?? 0)) * SCALE));

    const view = container?.getBoundingClientRect?.();
    if (!view) { resetView(); return; }
    const w = view.width - padding * 2;
    const h = view.height - padding * 2;
    const bw = Math.max(1, maxX - minX);
    const bh = Math.max(1, maxY - minY);
    const scale = Math.max(0.2, Math.min(3, Math.min(w / bw, h / bh)));
    zoom = scale;
    offsetX = padding - minX * scale;
    offsetY = padding - minY * scale;
  }

  let container: HTMLDivElement | null = null;

  stageStore.subscribe(state => {
    activeAgents = Array.isArray(state?.activeAgents) ? state.activeAgents : [];
    agentPositions = state?.agentPositions ?? {};
    currentInteractions = Array.isArray(state?.currentInteractions) ? state.currentInteractions : [];
  });

  worldStore.subscribe(state => {
    locations = state?.locations ?? [];
    connections = state?.connections ?? [];
  });

  // Seed stage layout from agents if empty
  onMount(async () => {
    try {
      let agents = get(agentStore) ?? [];
      if (!Array.isArray(agents) || agents.length === 0) {
        // Load agents from backend if not already loaded
        await agentStore.fetchAgents?.();
        agents = get(agentStore) ?? [];
      }
      // Always load locations and connections for the stage background map
      await worldStore.fetchLocations?.();
      await worldStore.fetchConnections?.();
      if ((activeAgents?.length ?? 0) === 0 && (agents?.length ?? 0) > 0) {
        stageStore.seedFromAgents(agents);
      }
    } catch (e) {
      console.error('GrandStage: failed to seed from agents', e);
    }
  });

  $: if ((activeAgents?.length ?? 0) === 0 && ($agentStore?.length ?? 0) > 0) {
    stageStore.seedFromAgents($agentStore);
  }

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

  async function seedFromBackend() {
    try {
      await agentStore.fetchAgents?.();
      const agents = get(agentStore) ?? [];
      if ((agents?.length ?? 0) > 0) {
        stageStore.seedFromAgents(agents);
      }
    } catch (e) {
      console.error('GrandStage: seedFromBackend failed', e);
    }
  }

  function seedWithDemo() {
    const demo = [
      {
        id: 'demo-a1',
        name: 'Aiden',
        age: 30,
        occupation: 'Engineer',
        personality_traits: [],
        professional_interests: [],
        personal_interests: [],
        skills: [],
        emoji: '🧑‍💻'
      },
      {
        id: 'demo-a2',
        name: 'Rhea',
        age: 29,
        occupation: 'Designer',
        personality_traits: [],
        professional_interests: [],
        personal_interests: [],
        skills: [],
        emoji: '🎨'
      }
    ] as unknown as Agent[];

    // Populate UI store only (no backend persistence)
    agentStore.seed?.(demo as any);
    stageStore.seedFromAgents(demo.map(a => ({ id: a.id })) as any);
  }
</script>

<section class="flex-col flex-1 brand-gradient">
  <StageControls on:resetView={resetView} on:fitToBounds={fitToBounds} />

  <div class="flex-1 relative overflow-hidden grid-overlay" bind:this={container}>
    <StageBackground />

    <div class="absolute inset-0">
      {#if (activeAgents?.length ?? 0) === 0 && (locations?.length ?? 0) === 0}
        <div class="w-full h-full flex items-center justify-center opacity-80 pointer-events-none">
          <div class="text-center space-y-3 bg-base-200/40 p-6 rounded-xl border border-base-300 pointer-events-auto">
            <div class="text-lg font-semibold">No agents on stage</div>
            <div class="text-sm max-w-md">
              Create agents via the Casting Call or run the Setup Wizard to generate a scenario. Once agents exist, they’ll appear here automatically.
            </div>
            <div class="pt-2">
              <div class="flex items-center justify-center gap-2">
                <button class="btn btn-primary btn-sm" type="button" on:click={openWizard}>Open Setup Wizard</button>
                <button class="btn btn-outline btn-sm" type="button" on:click={seedFromBackend}>Load Agents</button>
                <button class="btn btn-ghost btn-sm" type="button" on:click={seedWithDemo}>Add Demo Agents</button>
              </div>
            </div>
          </div>
        </div>
      {/if}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <svg class="w-full h-full" role="application" aria-label="Grand Stage canvas" on:wheel|passive={onWheel} on:mousedown={onMouseDown} on:mousemove={onMouseMove} on:mouseup={onMouseUp} on:mouseleave={onMouseLeave}>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
          </marker>
        </defs>
        <g transform={`translate(${offsetX},${offsetY}) scale(${zoom})`}>
        <!-- Connections Layer -->
        <g class="connections-layer">
          {#each connections as conn (conn.id)}
            {@const src = locations.find(l => l.id === conn.source)}
            {@const dst = locations.find(l => l.id === conn.target)}
            {#if src && dst}
              {@const x1 = (src.x + (src.width ?? 0)/2) * SCALE}
              {@const y1 = (src.y + (src.height ?? 0)/2) * SCALE}
              {@const x2 = (dst.x + (dst.width ?? 0)/2) * SCALE}
              {@const y2 = (dst.y + (dst.height ?? 0)/2) * SCALE}
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                class="stroke-base-300"
                stroke-width="2"
                marker-end={conn.isDirectional ? 'url(#arrow)' : undefined}
              />
              {#if conn.label}
                <text x={(x1+x2)/2} y={(y1+y2)/2 - 6} class="text-xs fill-base-content/70" text-anchor="middle">{conn.label}</text>
              {/if}
            {/if}
          {/each}
        </g>
        <!-- Locations Layer -->
        <g class="locations-layer">
          {#each locations as loc (loc.id)}
            <rect
              x={(loc.x ?? 0) * SCALE}
              y={(loc.y ?? 0) * SCALE}
              width={Math.max(1, (loc.width ?? 0) * SCALE)}
              height={Math.max(1, (loc.height ?? 0) * SCALE)}
              class="fill-base-200/30 stroke-base-300"
              stroke-width="1.5"
              rx="6"
              ry="6"
            />
            <text
              x={(loc.x ?? 0) * SCALE + 8}
              y={(loc.y ?? 0) * SCALE + 16}
              class="text-xs fill-base-content/80"
            >{loc.name}</text>
          {/each}
        </g>
      <!-- Agents -->
      {#each activeAgents as agentId}
        {@const agent = ($agentStore || []).find?.((a) => a.id === agentId)}
        {@const position = agentPositions?.[agentId]}
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
        {@const agent = ($agentStore || []).find?.((a) => a.id === interaction.participants?.[0])}
        {@const position = agentPositions?.[interaction.participants?.[0] ?? '']}
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
        </g>
  </svg>

      <!-- Agent Tooltip -->
      {#if hoveredAgent}
        <AgentTooltip agent={hoveredAgent} />
      {/if}
    </div>
  </div>
  <div class="px-3 py-2">
    <TranscriptDrawer />
  </div>
</section>