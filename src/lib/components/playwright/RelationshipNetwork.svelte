<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import { agentStore, type Agent, type Relationship } from '../../stores/agents';
  import { groupStore } from '../../stores/groups';
  import RelationshipEditModal from './relationship-network/RelationshipEditModal.svelte';
  import NodeTooltip from './relationship-network/NodeTooltip.svelte';
  import UniversalToolbar from '../common/UniversalToolbar.svelte';

  type RelationshipNode = d3.SimulationNodeDatum & {
    id: string;
    name: string;
    emoji?: string;
    group?: string | null;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
  };

  type RelationshipLink = d3.SimulationLinkDatum<RelationshipNode> & {
    source: string | RelationshipNode;
    target: string | RelationshipNode;
    type: Relationship['type'];
    strength: number;
  };

  const NODE_RADIUS = 30;
  const PADDING = NODE_RADIUS + 10;

  let svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let rootGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;
  let containerDiv: HTMLDivElement;
  let simulation!: d3.Simulation<RelationshipNode, RelationshipLink>;
  let linkForce!: d3.ForceLink<RelationshipNode, RelationshipLink>;
  let linkElements: d3.Selection<SVGLineElement, RelationshipLink, SVGGElement, unknown> | null = null;
  let nodeElements: d3.Selection<SVGGElement, RelationshipNode, SVGGElement, unknown> | null = null;
  let resizeObserver: ResizeObserver | null = null;

  let agents: Agent[] = [];
  let editModal = { show: false, sourceAgent: undefined as Agent | undefined, targetAgent: undefined as Agent | undefined };
  let isSavingRelationship = false;
  let selectedSourceAgent: Agent | null = null;
  let filterType: Relationship['type'] | 'all' = 'all';
  let selectedGroup: string | null = null;
  let sortBy: 'none' | 'group' = 'none';
  let width = 800;
  let height = 600;
  let hoveredNode: Agent | null = null;

  $: {
    agents = $agentStore;
    if (svg) updateNetwork();
  }

  function boundaryForce() {
    for (const node of simulation.nodes()) {
      node.x = Math.max(PADDING, Math.min(width - PADDING, node.x ?? 0));
      node.y = Math.max(PADDING, Math.min(height - PADDING, node.y ?? 0));
    }
  }

  function getCoordinate(value: RelationshipLink['source'] | RelationshipLink['target'], axis: 'x' | 'y'): number {
    if (typeof value === 'string') {
      return 0;
    }
    const coordinate = value[axis];
    return typeof coordinate === 'number' ? coordinate : 0;
  }

  function ticked() {
    if (linkElements && nodeElements) {
      linkElements
        .attr('x1', d => getCoordinate(d.source, 'x'))
        .attr('y1', d => getCoordinate(d.source, 'y'))
        .attr('x2', d => getCoordinate(d.target, 'x'))
        .attr('y2', d => getCoordinate(d.target, 'y'));

      nodeElements
        .attr('transform', d => `translate(${d.x ?? width / 2},${d.y ?? height / 2})`);
    }
  }

  onMount(() => {
    if (!containerDiv) return;

    width = containerDiv.clientWidth;
    height = containerDiv.clientHeight;

    svg = d3.select<HTMLDivElement, unknown>(containerDiv)
      .append<SVGSVGElement>('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'bg-base-200 rounded-lg');
    rootGroup = svg.append<SVGGElement>('g');

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', event => {
        rootGroup?.attr('transform', event.transform.toString());
      });

    svg.call(zoomBehavior);

    rootGroup.append('g').attr('class', 'links');
    rootGroup.append('g').attr('class', 'nodes');

    linkForce = d3.forceLink<RelationshipNode, RelationshipLink>()
      .id(d => d.id)
      .distance(150);

    simulation = d3.forceSimulation<RelationshipNode>()
      .force('link', linkForce)
      .force('charge', d3.forceManyBody<RelationshipNode>().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<RelationshipNode>().radius(NODE_RADIUS * 1.2))
      .force('x', d3.forceX<RelationshipNode>(width / 2).strength(0.05))
      .force('y', d3.forceY<RelationshipNode>(height / 2).strength(0.05))
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
    resizeObserver?.disconnect();
    simulation?.stop();
  });

  function updateForces() {
    if (!simulation) return;

    const yForce = sortBy === 'group'
      ? d3.forceY<RelationshipNode>(node => {
          const agent = agents.find(a => a.id === node.id);
          const groupIndex = $groupStore.findIndex(g => g.id === agent?.group);
          const safeIndex = groupIndex >= 0 ? groupIndex : $groupStore.length;
          return (safeIndex + 1) * (height / ($groupStore.length + 2));
        }).strength(0.3)
      : d3.forceY<RelationshipNode>(height / 2).strength(0.05);

    simulation
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX<RelationshipNode>(width / 2).strength(0.05))
      .force('y', yForce)
      .alpha(0.3)
      .restart();
  }

  function updateNetwork() {
    if (!svg || !simulation || !rootGroup) return;

    const primaryAgents = selectedGroup
      ? agents.filter(agent => agent.group === selectedGroup)
      : agents;

    const links = getRelationshipLinks(primaryAgents);

    const nodeAgentIds = new Set<string>();
    primaryAgents.forEach(agent => nodeAgentIds.add(agent.id));
    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      nodeAgentIds.add(sourceId);
      nodeAgentIds.add(targetId);
    });

    const nodes: RelationshipNode[] = agents
      .filter(agent => nodeAgentIds.has(agent.id))
      .map(agent => ({
        id: agent.id,
        name: agent.name,
        emoji: agent.emoji,
        group: agent.group ?? null,
        x: agent.x ?? width / 2,
        y: agent.y ?? height / 2
      }));

    simulation.nodes(nodes);
    linkForce.links(links);

    const linkGroup = rootGroup.select<SVGGElement>('.links');
    const nodeGroup = rootGroup.select<SVGGElement>('.nodes');

    const linkKey = (link: RelationshipLink) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      return `${sourceId}-${targetId}`;
    };

    const linkSelection = linkGroup
      .selectAll<SVGLineElement, RelationshipLink>('line')
      .data(links, linkKey);

    linkSelection.exit().remove();

    const linkEnter = linkSelection.enter()
      .append('line')
      .attr('class', 'relationship-link')
      .attr('stroke', d => getRelationshipColor(d.type))
      .attr('stroke-width', d => d.strength * 2);

    linkElements = linkEnter.merge(linkSelection);

    const nodeSelection = nodeGroup
      .selectAll<SVGGElement, RelationshipNode>('.agent-node')
      .data(nodes, d => d.id);

    nodeSelection.exit().remove();

    const nodeEnter = nodeSelection.enter()
      .append('g')
      .attr('class', 'agent-node')
      .call(
        d3.drag<SVGGElement, RelationshipNode>()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      );

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
      .text(d => d.emoji ?? '');

    nodeEnter
      .on('click', handleNodeClick)
      .on('mouseenter', handleNodeMouseEnter)
      .on('mouseleave', handleNodeMouseLeave);

    nodeElements = nodeEnter.merge(nodeSelection);

    simulation.alpha(0.3).restart();
  }

  function handleNodeClick(event: MouseEvent, node: RelationshipNode) {
    event.stopPropagation();
    const agent = agents.find(a => a.id === node.id);
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

  function handleNodeMouseEnter(_event: MouseEvent, node: RelationshipNode) {
    const agent = agents.find(a => a.id === node.id);
    hoveredNode = agent ?? null;
  }

  function handleNodeMouseLeave() {
    hoveredNode = null;
  }

  function getRelationshipLinks(agentList: Agent[] = agents): RelationshipLink[] {
    return agentList.flatMap(agent =>
      (agent.relationships ?? [])
        .filter(rel => filterType === 'all' || rel.type === filterType)
        .map<RelationshipLink>(rel => ({
          source: agent.id,
          target: rel.targetId,
          type: rel.type,
          strength: rel.strength
        }))
    );
  }

  function getRelationshipColor(type: Relationship['type']) {
    const colors: Record<Relationship['type'], string> = {
      friend: '#4CAF50',
      colleague: '#2196F3',
      family: '#9C27B0',
      rival: '#F44336'
    };

    return colors[type];
  }

  function dragStarted(event: d3.D3DragEvent<SVGGElement, RelationshipNode, RelationshipNode>) {
    if (!event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    event.subject.fx = event.subject.x ?? 0;
    event.subject.fy = event.subject.y ?? 0;
  }

  function dragged(event: d3.D3DragEvent<SVGGElement, RelationshipNode, RelationshipNode>) {
    event.subject.fx = Math.max(PADDING, Math.min(width - PADDING, event.x));
    event.subject.fy = Math.max(PADDING, Math.min(height - PADDING, event.y));
  }

  function dragEnded(event: d3.D3DragEvent<SVGGElement, RelationshipNode, RelationshipNode>) {
    if (!event.active) {
      simulation.alphaTarget(0);
    }
    event.subject.fx = null;
    event.subject.fy = null;
  }

  async function handleRelationshipSave(event: CustomEvent<Relationship>) {
    const relationship = event.detail;

    if (!editModal.sourceAgent) {
      return;
    }

    try {
      isSavingRelationship = true;
      await agentStore.addRelationship(editModal.sourceAgent.id, relationship);
      editModal = { show: false, sourceAgent: undefined, targetAgent: undefined };
      selectedSourceAgent = null;
    } catch (error) {
      console.error('Failed to save relationship', error);
    } finally {
      isSavingRelationship = false;
    }
  }

  function handleGroupSelect(event: CustomEvent<string | null>) {
    selectedGroup = event.detail;
    updateNetwork();
    updateForces();
  }

  function handleSortChange(event: CustomEvent<string>) {
    sortBy = event.detail === 'group' ? 'group' : 'none';
    updateForces();
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
    saving={isSavingRelationship}
    on:save={handleRelationshipSave}
      on:close={() => {
        editModal = { show: false, sourceAgent: undefined, targetAgent: undefined };
        selectedSourceAgent = null;
      }}
  />
</div>

<style lang="postcss">
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