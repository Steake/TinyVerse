<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import { agentStore, type Agent, type Relationship } from '../../stores/agents';
  import { groupStore } from '../../stores/groups';
  import RelationshipEditModal from './relationship-network/RelationshipEditModal.svelte';
  import NodeTooltip from './relationship-network/NodeTooltip.svelte';
  import UniversalToolbar from '../common/UniversalToolbar.svelte';

  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let containerDiv: HTMLDivElement;
  let simulation: d3.Simulation<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>>;
  let agents: Agent[] = [];
  let editModal = { show: false, sourceAgent: null as Agent | null, targetAgent: null as Agent | null };
  let selectedSourceAgent: Agent | null = null;
  let filterType: Relationship['type'] | 'all' = 'all';
  let selectedGroup: string | null = null;
  let sortBy: 'none' | 'group' = 'none';
  let width = 800;
  let height = 600;
  let resizeObserver: ResizeObserver;
  let linkElements: d3.Selection<SVGLineElement, any, SVGGElement, unknown>;
  let nodeElements: d3.Selection<SVGGElement, any, SVGGElement, unknown>;
  let hoveredNode: Agent | null = null;

  const NODE_RADIUS = 30;
  const PADDING = NODE_RADIUS + 10;

  $: {
    agents = $agentStore;
    if (svg) updateNetwork();
  }

  function boundaryForce() {
    for (const node of simulation.nodes()) {
      node.x = Math.max(PADDING, Math.min(width - PADDING, node.x || 0));
      node.y = Math.max(PADDING, Math.min(height - PADDING, node.y || 0));
    }
  }

  function ticked() {
    if (linkElements && nodeElements) {
      linkElements
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodeElements
        .attr('transform', d => `translate(${d.x},${d.y})`);
    }
  }

  onMount(() => {
    if (!containerDiv) return;

    width = containerDiv.clientWidth;
    height = containerDiv.clientHeight;

    svg = d3.select(containerDiv)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'bg-base-200 rounded-lg');

    const g = svg.append('g');
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));
    
    svg.call(zoom);

    g.append('g').attr('class', 'links');
    g.append('g').attr('class', 'nodes');

    simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(NODE_RADIUS * 1.2))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .alphaDecay(0.02)
      .velocityDecay(0.3)
      .on('tick', () => {
        boundaryForce();
        ticked();
      });

    resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        if (svg) {
          svg.attr('width', width).attr('height', height);
          updateForces();
        }
      }
    });

    resizeObserver.observe(containerDiv);
    updateNetwork();
  });

  onDestroy(() => {
    if (resizeObserver) resizeObserver.disconnect();
    if (simulation) simulation.stop();
  });

  function updateForces() {
    simulation
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', sortBy === 'group' ? 
        d3.forceY((d: any) => {
          const agent = agents.find(a => a.id === d.id);
          const groupIndex = $groupStore.findIndex(g => g.id === agent?.group);
          return (groupIndex + 1) * (height / ($groupStore.length + 2));
        }).strength(0.3) :
        d3.forceY(height / 2).strength(0.05))
      .alpha(0.3)
      .restart();
  }

  function updateNetwork() {
    if (!svg || !simulation) return;

    const g = svg.select('g');
    const links = getRelationshipLinks();
    const nodes = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      emoji: agent.emoji,
      group: agent.group,
      x: agent.x || width / 2,
      y: agent.y || height / 2
    }));

    // Update simulation with new data
    simulation.nodes(nodes);
    simulation.force<d3.ForceLink<any, any>>('link')?.links(links);

    // Update links
    linkElements = g.select('.links')
      .selectAll<SVGLineElement, any>('line')
      .data(links, (d: any) => `${d.source.id || d.source}-${d.target.id || d.target}`);

    linkElements.exit().remove();

    const linkEnter = linkElements.enter()
      .append('line')
      .attr('class', 'relationship-link')
      .attr('stroke', d => getRelationshipColor(d.type))
      .attr('stroke-width', d => d.strength * 2);

    linkElements = linkElements.merge(linkEnter);

    // Update nodes
    nodeElements = g.select('.nodes')
      .selectAll<SVGGElement, any>('.agent-node')
      .data(nodes, (d: any) => d.id);

    nodeElements.exit().remove();

    const nodeEnter = nodeElements.enter()
      .append('g')
      .attr('class', 'agent-node')
      .call(d3.drag<SVGGElement, any>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));

    nodeEnter.append('circle')
      .attr('r', NODE_RADIUS)
      .attr('class', d => `fill-primary stroke-base-100 ${d.group ? 'ring-2 ring-accent' : ''}`);

    nodeEnter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '3.5em')
      .attr('class', 'text-sm font-bold fill-base-content')
      .text(d => d.name);

    nodeEnter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('class', 'text-2xl select-none pointer-events-none')
      .text(d => d.emoji);

    nodeEnter
      .on('click', handleNodeClick)
      .on('mouseenter', handleNodeMouseEnter)
      .on('mouseleave', handleNodeMouseLeave);

    nodeElements = nodeElements.merge(nodeEnter);

    // Update simulation
    simulation.nodes(nodes);
    simulation.force<d3.ForceLink<any, any>>('link')?.links(links);
    simulation.alpha(0.3).restart();
  }

  function handleNodeClick(event: any, d: any) {
    event.stopPropagation();
    const agent = agents.find(a => a.id === d.id);
    if (!agent) return;

    if (!selectedSourceAgent) {
      selectedSourceAgent = agent;
    } else if (selectedSourceAgent.id !== agent.id) {
      editModal = {
        show: true,
        sourceAgent: selectedSourceAgent,
        targetAgent: agent
      };
      selectedSourceAgent = null;
    }
  }

  function handleNodeMouseEnter(event: any, d: any) {
    const agent = agents.find(a => a.id === d.id);
    if (!agent) return;
    hoveredNode = agent;
  }

  function handleNodeMouseLeave() {
    hoveredNode = null;
  }

  function getRelationshipLinks() {
    return agents.flatMap(agent =>
      agent.relationships
        .filter(rel => filterType === 'all' || rel.type === filterType)
        .map(rel => ({
          source: agent.id,
          target: rel.targetId,
          type: rel.type,
          strength: rel.strength
        }))
    );
  }

  function getRelationshipColor(type: Relationship['type']) {
    const colors = {
      friend: '#4CAF50',
      colleague: '#2196F3',
      family: '#9C27B0',
      rival: '#F44336'
    };
    return colors[type];
  }

  function dragStarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: any) {
    event.subject.fx = Math.max(PADDING, Math.min(width - PADDING, event.x));
    event.subject.fy = Math.max(PADDING, Math.min(height - PADDING, event.y));
  }

  function dragEnded(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  function handleRelationshipSave(event: CustomEvent<Relationship>) {
    const relationship = event.detail;
    agentStore.addRelationship(editModal.sourceAgent!.id, relationship);
    editModal = { show: false, sourceAgent: null, targetAgent: null };
  }

  function handleGroupSelect(event: CustomEvent<string | null>) {
    selectedGroup = event.detail;
    updateNetwork();
  }

  function handleSortChange(event: CustomEvent<string>) {
    sortBy = event.detail === 'group' ? 'group' : 'none';
    updateNetwork();
  }
</script>

<div class="h-full flex flex-col">
  <UniversalToolbar
    {selectedGroup}
    sortBy={sortBy === 'group' ? 'group' : 'none'}
    on:groupSelect={handleGroupSelect}
    on:sortChange={handleSortChange}
  >
    <div class="flex gap-2 items-center">
      <select
        class="select select-bordered select-sm"
        bind:value={filterType}
        on:change={() => updateNetwork()}
      >
        <option value="all">All Relationships</option>
        <option value="friend">Friends</option>
        <option value="colleague">Colleagues</option>
        <option value="family">Family</option>
        <option value="rival">Rivals</option>
      </select>
    </div>
  </UniversalToolbar>

  {#if selectedSourceAgent}
    <div class="alert alert-info">
      <span>Select another agent to create a relationship with {selectedSourceAgent.name}</span>
      <button class="btn btn-sm" on:click={() => selectedSourceAgent = null}>Cancel</button>
    </div>
  {/if}

  <div 
    class="flex-1 relative bg-base-200 rounded-lg overflow-hidden" 
    bind:this={containerDiv}
    role="application"
    aria-label="Relationship network visualization"
  >
    <NodeTooltip
      agent={hoveredNode}
      show={hoveredNode !== null}
    />
  </div>

  <RelationshipEditModal
    show={editModal.show}
    sourceAgent={editModal.sourceAgent}
    targetAgent={editModal.targetAgent}
    on:save={handleRelationshipSave}
    on:close={() => editModal = { show: false, sourceAgent: null, targetAgent: null }}
  />
</div>

<style>
  .relationship-link {
    @apply pointer-events-none opacity-60;
  }

  .agent-node {
    @apply cursor-pointer;
  }

  .agent-node:hover circle {
    @apply brightness-110;
  }

  .agent-node:focus {
    @apply outline-none;
  }

  .agent-node:focus circle {
    @apply ring-2 ring-primary;
  }
</style>