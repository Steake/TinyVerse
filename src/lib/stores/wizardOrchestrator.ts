import { api } from '../api';
import { agentStore } from './agents';
import { worldStore } from './world';
import { timelineStore, type StoryBeat } from './timeline';
import { ensureUniqueName, buildOccupiedNameSet } from '../utils/naming';
import { normalizeAgentPayload } from '../utils/agents';
import { applyFields } from './autofill';
import type { Location } from './types';
import { get } from 'svelte/store';
import { parseJson } from '../utils/jsonParsing';
import { toastStore } from './toast';

type ScenarioPayload = {
  agents?: unknown;
  Agents?: unknown;
  personas?: unknown;
  locations?: unknown;
  Locations?: unknown;
  spaces?: unknown;
  narrative?: unknown;
  story?: unknown;
  beats?: unknown;
  [key: string]: unknown;
};

const FALLBACK_LOCATION_TYPE: Location['type'] = 'room';

function coerceLocationType(value: unknown): Location['type'] {
  if (typeof value !== 'string') {
    return FALLBACK_LOCATION_TYPE;
  }
  const normalized = value.trim().toLowerCase();
  if (['room', 'indoor', 'interior', 'office', 'lab', 'workspace'].includes(normalized)) {
    return 'room';
  }
  if (['outdoor', 'exterior', 'outside', 'courtyard', 'garden', 'plaza'].includes(normalized)) {
    return 'outdoor';
  }
  if (normalized.length && !['room', 'outdoor'].includes(normalized)) {
    return 'special';
  }
  return FALLBACK_LOCATION_TYPE;
}

export interface ScenarioBootstrapParams {
  prompt: string;
  agentCount: number;
  locationCount: number;
  includeNarrative: boolean;
}

export interface ScenarioBootstrapResult {
  agentsCreated: number;
  locationsCreated: number;
  beatsCreated: number;
}

export interface ScenarioBootstrapHooks {
  onStageUpdate?: (
    stage: 'agents' | 'locations' | 'narrative',
    detail: { completed: number; total: number }
  ) => void;
}

function asArray<T>(input: any): T[] {
  if (!input) return [];
  if (Array.isArray(input)) return input as T[];
  const parsed = parseJson<T[]>(input);
  return Array.isArray(parsed) ? parsed : [];
}

function normalizeLocationPayload(raw: any): Omit<Location, 'id'> {
  const data = raw?.data ?? raw ?? {};
  const base: Omit<Location, 'id'> = {
    name: String(data.name ?? 'Location').trim() || 'Location',
    type: coerceLocationType(data.type ?? data.zone),
    description: String(data.description ?? data.summary ?? '').trim(),
    x: Number(data.x ?? (Array.isArray(data.coordinates) ? data.coordinates[0] : undefined) ?? Math.random() * 400),
    y: Number(data.y ?? (Array.isArray(data.coordinates) ? data.coordinates[1] : undefined) ?? Math.random() * 400),
    width: Number(data.width ?? 120),
    height: Number(data.height ?? 120),
    image: data.image ?? undefined,
    zone: data.zone,
    level: typeof data.level === 'number' ? data.level : undefined,
    features: Array.isArray(data.features) ? data.features : undefined
  };

  // Clamp layout to sensible defaults
  if (!Number.isFinite(base.x)) base.x = Math.random() * 400;
  if (!Number.isFinite(base.y)) base.y = Math.random() * 300;
  if (!Number.isFinite(base.width) || base.width <= 0) base.width = 120;
  if (!Number.isFinite(base.height) || base.height <= 0) base.height = 120;

  return base;
}

function normalizeBeats(raw: any): StoryBeat[] {
  const beats = asArray<any>(raw);
  return beats.map((beat, index) => {
    const id = String(beat?.id ?? beat?.slug ?? `beat-${index + 1}`);
    return {
      id,
      title: String(beat?.title ?? `Beat ${index + 1}`),
      description: String(beat?.description ?? beat?.summary ?? ''),
      status: index === 0 ? 'active' : 'pending',
      trigger: beat?.trigger ?? beat?.condition,
      blocking: Boolean(beat?.blocking ?? beat?.requires_decision),
      metadata: typeof beat === 'object' ? { ...beat } : undefined
    };
  });
}

export async function runScenarioBootstrap(
  params: ScenarioBootstrapParams,
  hooks?: ScenarioBootstrapHooks
): Promise<ScenarioBootstrapResult> {
  const { prompt, agentCount, locationCount, includeNarrative } = params;
  const countsLine = `Agents: ${agentCount}, Locations: ${locationCount}, Narrative: ${includeNarrative ? 'include story beats' : 'omit narrative array (return empty array)'}.`;

  const contextSections = [
    'You are TinyVerse\'s simulation architect. Generate a cohesive scenario from the provided blueprint.',
    `Blueprint:\n${prompt}`,
    countsLine,
    'Return strict JSON with the following structure: {"agents": [...], "locations": [...], "narrative": [...]}.'
      + ' Each agent must include: name, age, occupation, occupation_description, nationality, country_of_residence, '
      + 'personality_traits (array), professional_interests (array), personal_interests (array), '
      + 'skills (array of {"name", "level" from 1-5}), backstory (HTML string), emoji.' ,
    'Each location must include: name, description, type, x, y, width, height, optional zone, optional features array.',
    includeNarrative
      ? 'The "narrative" array should provide ordered story beats with id, title, description, trigger, and whether the beat blocks progress.'
      : 'The "narrative" array should be empty.'
  ];

  const response = await api.autofillScenario({
    context: contextSections.join('\n\n'),
    seed: { agentCount, locationCount, includeNarrative, blueprint: prompt }
  });

  // Response already parsed; still be defensive if backend evolves
  const parsedPayload = parseJson<ScenarioPayload>(response.data as any) ?? (response.data as any);
  const payload: ScenarioPayload = typeof parsedPayload === 'object' && parsedPayload ? parsedPayload : {};

  const agentPayloads = asArray<any>(payload.agents ?? payload.Agents ?? payload.personas);
  const locationPayloads = asArray<any>(payload.locations ?? payload.Locations ?? payload.spaces);
  const narrativePayloads = includeNarrative
    ? asArray<any>(payload.narrative ?? payload.story ?? payload.beats)
    : [];

  const existingAgents = get(agentStore) ?? [];
  const occupied = buildOccupiedNameSet(existingAgents.map((agent) => agent.name));
  let agentsCreated = 0;

  hooks?.onStageUpdate?.('agents', { completed: 0, total: agentCount });

  for (const rawAgent of agentPayloads.slice(0, agentCount)) {
    const normalized = normalizeAgentPayload(applyFields({}, 'agent', rawAgent));
    normalized.name = ensureUniqueName(normalized.name ?? '', occupied, { fallback: 'Agent' });
    try {
      await agentStore.addAgent(normalized);
      agentsCreated += 1;
      hooks?.onStageUpdate?.('agents', { completed: agentsCreated, total: agentCount });
    } catch (error) {
      console.warn('Failed to import generated agent', error);
    }
  }

  hooks?.onStageUpdate?.('locations', { completed: 0, total: locationCount });
  let locationsCreated = 0;

  for (const rawLocation of locationPayloads.slice(0, locationCount)) {
    const normalized = normalizeLocationPayload(rawLocation);
    try {
      await worldStore.addLocation(normalized);
      locationsCreated += 1;
      hooks?.onStageUpdate?.('locations', { completed: locationsCreated, total: locationCount });
    } catch (error) {
      console.warn('Failed to import generated location', error);
    }
  }

  if (includeNarrative) {
    const beats = normalizeBeats(narrativePayloads);
    if (beats.length > 0) {
      timelineStore.setBeats(beats);
      hooks?.onStageUpdate?.('narrative', { completed: beats.length, total: beats.length });
    } else {
      timelineStore.reset();
      hooks?.onStageUpdate?.('narrative', { completed: 0, total: 0 });
      toastStore.info('Scenario created without beats. You can add story beats later from the timeline.', 4000);
    }
  } else {
    timelineStore.reset();
    hooks?.onStageUpdate?.('narrative', { completed: 0, total: 0 });
  }

  return {
    agentsCreated,
    locationsCreated,
    beatsCreated: includeNarrative ? narrativePayloads.length : 0
  };
}
