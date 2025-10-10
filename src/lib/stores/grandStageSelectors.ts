import { derived } from 'svelte/store';
import { agentStore } from './agents';
import { stageStore } from './stage';
import { simulationStore } from './simulation';
import type { GrandStageEvent, AgentSummary, GrandStageEventCategory } from '../utils/grand-stage/data';
import { deriveAgentSummaries, deriveEvents, filterEventsByCategory } from '../utils/grand-stage/data';

function ensureEvents(events: GrandStageEvent[] | undefined): GrandStageEvent[] {
  return events ?? [];
}

export const grandStageEvents = derived(
  simulationStore,
  (state): GrandStageEvent[] => {
    const logs = state?.logs ?? [];
    return deriveEvents(logs);
  },
  [] as GrandStageEvent[]
);

export const grandStageAgentSummaries = derived(
  [agentStore, stageStore, grandStageEvents],
  ([agents, stage, events]): AgentSummary[] => {
    return deriveAgentSummaries(agents ?? [], stage, ensureEvents(events));
  },
  [] as AgentSummary[]
);

export function createEventCategoryStore(category: GrandStageEventCategory) {
  return derived(grandStageEvents, events => filterEventsByCategory(events, category), [] as GrandStageEvent[]);
}

export const grandStageThoughtEvents = createEventCategoryStore('thought');
export const grandStageDialogueEvents = createEventCategoryStore('dialogue');
export const grandStageToolEvents = createEventCategoryStore('tool');
export const grandStageMovementEvents = createEventCategoryStore('movement');
