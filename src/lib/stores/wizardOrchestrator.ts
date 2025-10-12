import { api } from '../api';
import { agentStore } from './agents';
import { worldStore } from './world';
import { timelineStore, type StoryBeat, type StoryBeatStatus } from './timeline';
import { ensureUniqueName, buildOccupiedNameSet } from '../utils/naming';
import { normalizeAgentPayload } from '../utils/agents';
import { applyFields } from './autofill';
import type { Location } from './types';
import { get } from 'svelte/store';
import { parseJson } from '../utils/jsonParsing';
import { tokenUsage } from './tokenUsage';
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
  
  // If input is a string, try parsing it first
  if (typeof input === 'string') {
    const parsed = parseJson<T[]>(input);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    console.warn('[asArray] Failed to parse string as array, returning empty');
    return [];
  }
  
  // If it's already an object, wrap it in array (single item)
  if (typeof input === 'object') {
    console.warn('[asArray] Input is object, not array. Wrapping in array');
    return [input] as T[];
  }
  
  return [];
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
  
  // First pass: normalize and collect IDs
  const normalized = beats.map((beat, index) => {
    const id = String(beat?.id ?? beat?.slug ?? `beat-${index + 1}`);
    return {
      id,
      title: String(beat?.title ?? `Beat ${index + 1}`),
      description: String(beat?.description ?? beat?.summary ?? ''),
      status: (index === 0 ? 'active' : 'pending') as StoryBeatStatus,
      trigger: beat?.trigger ?? beat?.condition,
      blocking: Boolean(beat?.blocking ?? beat?.requires_decision),
      metadata: typeof beat === 'object' ? { ...beat } : undefined
    };
  });
  
  // Build ID map for reference fixing
  const idSet = new Set(normalized.map(b => b.id));
  
  // Second pass: fix broken after:X references
  const fixed = normalized.map((beat, index) => {
    if (beat.trigger?.startsWith('after:')) {
      const refId = beat.trigger.substring(6);
      if (!idSet.has(refId)) {
        // Broken reference - try to fix it
        console.warn(`Beat "${beat.title}" has broken reference: after:${refId}, auto-fixing`);
        
        // If this isn't the first beat, chain to previous beat
        if (index > 0) {
          const previousBeat = normalized[index - 1];
          return {
            ...beat,
            trigger: `after:${previousBeat.id}`
          };
        } else {
          // First beat with broken reference - use simulation_start
          return {
            ...beat,
            trigger: 'simulation_start'
          };
        }
      }
    }
    return beat;
  });
  
  return fixed;
}

export async function runScenarioBootstrap(
  params: ScenarioBootstrapParams,
  hooks?: ScenarioBootstrapHooks
): Promise<ScenarioBootstrapResult> {
  const { prompt, agentCount, locationCount, includeNarrative } = params;
  const countsLine = `You MUST generate EXACTLY ${agentCount} agents and EXACTLY ${locationCount} locations. Do not generate more or fewer.`;

  const narrativeGuidance = includeNarrative
    ? `Generate 3-5 narrative beats that structure the scenario as a story arc. Each beat should represent a key dramatic moment or turning point.

BEAT STRUCTURE (all fields required):
- id: unique identifier (e.g., "beat-1", "opening", "confrontation")
- title: short, punchy name for the beat (2-5 words)
- description: what happens in this beat, the dramatic action (1-2 sentences)
- trigger: condition that activates this beat. Valid patterns (AUTOMATICALLY EVALUATED):
  * "simulation_start" - fires immediately when simulation begins
  * "after:beat-id" - fires after specific beat completes (e.g., "after:beat-1")
  * "step:N" - fires after N simulation steps (e.g., "step:10")
  * "agent:AgentName:action" - fires when agent performs action (e.g., "agent:Max:makes_call")
  * "manual" - requires manual activation by user
- blocking: boolean - if true, beat is highlighted as critical decision point

NARRATIVE TIPS:
- First beat should have trigger "simulation_start" to kick things off
- Use "after:previous-beat-id" to chain beats sequentially
- Use "step:N" for time-based events (e.g., "step:20" for midpoint)
- Use "agent:Name:action" to trigger on specific character actions
- Mark critical decision points as blocking:true for emphasis
- Keep descriptions focused on observable actions, not internal thoughts
- Make beats specific to the scenario, not generic

Example for a heist scenario:
{
  "id": "casing",
  "title": "Casing the Joint",
  "description": "The crew surveys the target building, noting security patterns and weak points.",
  "trigger": "simulation_start",
  "blocking": false
},
{
  "id": "breach",
  "title": "The Breach",
  "description": "Security is disabled. The team enters the vault floor.",
  "trigger": "step:15",
  "blocking": true
},
{
  "id": "confrontation",
  "title": "The Guard Discovers Them",
  "description": "A guard stumbles upon the crew. Quick thinking required.",
  "trigger": "agent:Guard:patrol",
  "blocking": true
}`
    : 'The "narrative" array MUST be empty ([]). Do not generate any beats.';

  const contextSections = [
    'You are TinyVerse\'s simulation architect. Generate a cohesive scenario from the provided blueprint.',
    `Blueprint:\n${prompt}`,
    countsLine,
    'Return strict JSON with the following structure: {"agents": [...], "locations": [...], "narrative": [...]}.',
    '',
    'AGENT SCHEMA (all fields required):',
    'Each agent must include: name, age, occupation, occupation_description, nationality, country_of_residence, '
      + 'personality_traits (array of 2-5 strings), professional_interests (array), personal_interests (array), '
      + 'skills (array of {"name": string, "level": 1-10}), backstory (2-3 sentences of HTML), emoji (single emoji character).',
    '',
    'LOCATION SCHEMA (all fields required):',
    'Each location must include: name, description (1-2 sentences), type ("room"|"outdoor"|"special"), '
      + 'x (number, 0-800), y (number, 0-600), width (number, 80-200), height (number, 80-200).',
    'Arrange locations spatially so they don\'t overlap. Leave at least 20px between adjacent locations.',
    '',
    'NARRATIVE SCHEMA:',
    narrativeGuidance
  ];

  const response = await api.autofillScenario({
    context: contextSections.join('\n'),
    seed: { agentCount, locationCount, includeNarrative, blueprint: prompt }
  });

  // Track estimated token usage
  const promptText = contextSections.join('\n');
  const estimatedPromptTokens = Math.ceil(promptText.length / 4);
  const estimatedCompletionTokens = Math.ceil(JSON.stringify(response).length / 4);
  tokenUsage.addUsage(estimatedPromptTokens, estimatedCompletionTokens);

  // Response already parsed; still be defensive if backend evolves
  const parsedPayload = parseJson<ScenarioPayload>(response.data as any) ?? (response.data as any);
  const payload: ScenarioPayload = typeof parsedPayload === 'object' && parsedPayload ? parsedPayload : {};

  let agentPayloads = asArray<any>(payload.agents ?? payload.Agents ?? payload.personas);
  let locationPayloads = asArray<any>(payload.locations ?? payload.Locations ?? payload.spaces);
  let narrativePayloads = includeNarrative
    ? asArray<any>(payload.narrative ?? payload.story ?? payload.beats)
    : [];

  // Pad agents if LLM underdelivered
  if (agentPayloads.length < agentCount) {
    console.warn(`LLM returned ${agentPayloads.length} agents but ${agentCount} were requested. Padding with placeholders.`);
    const shortfall = agentCount - agentPayloads.length;
    for (let i = 0; i < shortfall; i++) {
      agentPayloads.push({
        name: `Agent ${agentPayloads.length + i + 1}`,
        age: 30,
        occupation: 'Participant',
        occupation_description: 'General participant in the scenario',
        nationality: 'Unknown',
        country_of_residence: 'Unknown',
        personality_traits: ['adaptable'],
        professional_interests: ['general work'],
        personal_interests: ['various hobbies'],
        skills: [{ name: 'general_skills', level: 3 }],
        backstory: 'A participant in this scenario.',
        emoji: '👤'
      });
    }
  }

  // Pad locations if LLM underdelivered
  if (locationPayloads.length < locationCount) {
    console.warn(`LLM returned ${locationPayloads.length} locations but ${locationCount} were requested. Padding with placeholders.`);
    const shortfall = locationCount - locationPayloads.length;
    for (let i = 0; i < shortfall; i++) {
      locationPayloads.push({
        name: `Location ${locationPayloads.length + i + 1}`,
        description: 'A place in this scenario',
        type: 'room',
        x: 100 + (i * 150),
        y: 100 + (i * 100),
        width: 120,
        height: 100
      });
    }
  }

  // Pad narrative beats if requested but LLM didn't deliver
  if (includeNarrative && narrativePayloads.length === 0) {
    console.warn('LLM returned no narrative beats. Creating default story arc.');
    narrativePayloads = [
      {
        id: 'beat-1',
        title: 'Setup',
        description: 'The scenario begins. Agents are introduced, goals are established, and the initial situation is revealed.',
        trigger: 'simulation_start',
        blocking: false
      },
      {
        id: 'beat-2',
        title: 'Rising Action',
        description: 'Complications emerge as agents pursue conflicting objectives. Tensions escalate.',
        trigger: 'after:beat-1',
        blocking: false
      },
      {
        id: 'beat-3',
        title: 'Climax',
        description: 'The central conflict reaches its peak. A critical decision or confrontation occurs.',
        trigger: 'after:beat-2',
        blocking: true
      },
      {
        id: 'beat-4',
        title: 'Resolution',
        description: 'The outcome of the climax unfolds. Consequences are revealed and loose ends are tied up.',
        trigger: 'after:beat-3',
        blocking: false
      }
    ];
  }

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
