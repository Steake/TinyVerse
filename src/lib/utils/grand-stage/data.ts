import type { Agent, SimulationLog, SimulationLogMetadata } from '../../stores/types';
import type { StageState } from '../mock-data/grand-stage';

export type GrandStageEventCategory = 'thought' | 'dialogue' | 'tool' | 'movement' | 'action';

export interface GrandStageEvent {
  id: string;
  timestamp: string;
  agentId?: string;
  agentName?: string;
  category: GrandStageEventCategory;
  action: string;
  content: string;
  metadata?: SimulationLogMetadata;
}

export interface AgentSummary {
  id: string;
  name: string;
  emoji?: string;
  status: AgentStatus;
  lastAction?: string;
  lastTimestamp?: string;
  locationLabel?: string;
  position?: { x: number; y: number };
  tool?: string;
  thoughtCount: number;
  dialogueCount: number;
  movementCount: number;
  toolCount: number;
}

export type AgentStatus = 'idle' | 'moving' | 'speaking' | 'thinking' | 'using-tool';

export function categorizeLog(log: SimulationLog): GrandStageEventCategory {
  const metadata = log.metadata ?? {};
  const kind = typeof metadata.kind === 'string' ? metadata.kind.toLowerCase() : undefined;
  const rendering = typeof metadata.rendering === 'string' ? metadata.rendering.toLowerCase() : undefined;
  const action = log.action?.toLowerCase?.() ?? '';

  if (kind === 'thought' || action === 'thought' || action === 'reflect') {
    return 'thought';
  }

  if (kind === 'tool' || metadata.toolId || metadata.tool_id || action === 'tool_use') {
    return 'tool';
  }

  if (rendering === 'speech' || action === 'talk' || action === 'say' || action === 'speak') {
    return 'dialogue';
  }

  if (action === 'move' || action === 'travel' || action === 'walk') {
    return 'movement';
  }

  return 'action';
}

export function buildEvent(log: SimulationLog): GrandStageEvent {
  return {
    id: log.id,
    timestamp: log.timestamp,
    agentId: log.agentId,
    agentName: log.agentName,
    category: categorizeLog(log),
    action: log.action,
    content: log.content,
    metadata: log.metadata,
  };
}

export function deriveEvents(logs: SimulationLog[]): GrandStageEvent[] {
  return logs.map(buildEvent).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function determineStatusFromEvent(event?: GrandStageEvent): AgentStatus {
  if (!event) {
    return 'idle';
  }

  switch (event.category) {
    case 'dialogue':
      return 'speaking';
    case 'thought':
      return 'thinking';
    case 'tool':
      return 'using-tool';
    case 'movement':
      return 'moving';
    default:
      return 'idle';
  }
}

export function deriveAgentSummaries(
  agents: Agent[],
  stage: StageState,
  events: GrandStageEvent[]
): AgentSummary[] {
  const agentMap = new Map(agents.map(agent => [agent.id, agent] as const));
  const eventsByAgent = new Map<string, GrandStageEvent[]>();

  for (const event of events) {
    if (!event.agentId) continue;
    if (!eventsByAgent.has(event.agentId)) {
      eventsByAgent.set(event.agentId, []);
    }
    eventsByAgent.get(event.agentId)!.push(event);
  }

  const { activeAgents, agentPositions } = stage;

  return activeAgents.reduce<AgentSummary[]>((acc, agentId) => {
    const agent = agentMap.get(agentId);
    if (!agent) {
      return acc;
    }

    const agentEvents = eventsByAgent.get(agentId) ?? [];
    const lastEvent = agentEvents[agentEvents.length - 1];
    const position = agentPositions[agentId];

    const counts = agentEvents.reduce(
      (totals, event) => {
        switch (event.category) {
          case 'thought':
            totals.thought += 1;
            break;
          case 'dialogue':
            totals.dialogue += 1;
            break;
          case 'movement':
            totals.movement += 1;
            break;
          case 'tool':
            totals.tool += 1;
            break;
        }
        return totals;
      },
      { thought: 0, dialogue: 0, movement: 0, tool: 0 }
    );

    acc.push({
      id: agent.id,
      name: agent.name,
      emoji: agent.emoji,
      status: determineStatusFromEvent(lastEvent),
      lastAction: lastEvent?.content ?? lastEvent?.action,
      lastTimestamp: lastEvent?.timestamp,
      locationLabel: typeof lastEvent?.metadata?.location === 'string' ? lastEvent?.metadata?.location : undefined,
      position,
      tool: typeof lastEvent?.metadata?.toolName === 'string'
        ? lastEvent?.metadata?.toolName
        : typeof lastEvent?.metadata?.tool === 'string'
          ? lastEvent?.metadata?.tool
          : undefined,
      thoughtCount: counts.thought,
      dialogueCount: counts.dialogue,
      movementCount: counts.movement,
      toolCount: counts.tool,
    });

    return acc;
  }, []);
}

export function filterEventsByCategory(
  events: GrandStageEvent[],
  category: GrandStageEventCategory
): GrandStageEvent[] {
  return events.filter(event => event.category === category);
}

export function groupEventsByAgent(events: GrandStageEvent[]): Map<string, GrandStageEvent[]> {
  const map = new Map<string, GrandStageEvent[]>();
  for (const event of events) {
    if (!event.agentId) continue;
    if (!map.has(event.agentId)) {
      map.set(event.agentId, []);
    }
    map.get(event.agentId)!.push(event);
  }
  return map;
}
