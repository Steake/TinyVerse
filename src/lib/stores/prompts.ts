import { writable, derived, get } from 'svelte/store';
import type { AutofillScope } from './autofill';

type PromptScope = AutofillScope | 'simulation';

export interface PromptNode {
  id: string;
  label: string;
  description?: string;
  scope: PromptScope;
  prompt: string;
  children?: PromptNode[];
}

export interface PromptState {
  master: PromptNode;
  sections: PromptNode[];
}

const defaultState: PromptState = {
  master: {
    id: 'master',
    label: 'Simulation Blueprint',
    scope: 'simulation',
    prompt: [
      'Design an entire TinyVerse simulation in one pass.',
      'Include overarching goals, narrative tone, operational constraints, and desired emergent behaviors.',
      'Ensure every generated element is internally consistent and grounded in this blueprint.'
    ].join(' '),
    description: 'High-level direction that every other prompt inherits from.'
  },
  sections: [
    {
      id: 'agents',
      label: 'Agents',
      scope: 'agent',
      prompt: [
        'Create diverse, believable personas that can drive the simulation forward.',
        'Return a metadata object alongside core fields describing primary location, preferences, and likely actions/movements during the scenario.',
        'Metadata fields: location, preferences (top 3), likely_actions (top 3), movement_pattern.'
      ].join(' '),
      children: [
        {
          id: 'agent-roles',
          label: 'Agent Roles',
          scope: 'agent',
          prompt: 'Outline each agent\'s role in the broader operation and how they interact with others.'
        },
        {
          id: 'agent-relationships',
          label: 'Relationships',
          scope: 'agent',
          prompt: 'Describe key relationship hooks, alliances, rivalries, and communication dynamics.'
        }
      ]
    },
    {
      id: 'locations',
      label: 'Locations',
      scope: 'location',
      prompt: [
        'Map compelling locations with actionable descriptions and purpose.',
        'Include metadata object: zone, vibe, resources, key_interactions, operational_hours.'
      ].join(' ')
    },
    {
      id: 'environment',
      label: 'Environment & Events',
      scope: 'environment',
      prompt: 'Summarize overarching environmental factors, scheduled events, and triggers that influence agents.'
    },
    {
      id: 'story',
      label: 'Narrative Threads',
      scope: 'story',
      prompt: 'Capture story beats, tension arcs, and resolution possibilities for downstream storytelling tools.'
    }
  ]
};

const promptStoreInternal = writable<PromptState>(defaultState);

export const promptStore = {
  subscribe: promptStoreInternal.subscribe,
  update: promptStoreInternal.update
};

export function setMasterPrompt(value: string) {
  promptStoreInternal.update((state) => ({
    ...state,
    master: { ...state.master, prompt: value }
  }));
}

export function setPromptById(id: string, value: string) {
  promptStoreInternal.update((state) => ({
    ...state,
    sections: state.sections.map((section) =>
      section.id === id
        ? { ...section, prompt: value }
        : {
            ...section,
            children: section.children?.map((child) =>
              child.id === id ? { ...child, prompt: value } : child
            )
          }
    )
  }));
}

export const flatPromptList = derived(promptStoreInternal, ($state) => {
  const nodes: PromptNode[] = [$state.master];
  for (const section of $state.sections) {
    nodes.push(section);
    if (section.children) {
      nodes.push(...section.children);
    }
  }
  return nodes;
});

export function getPromptNode(id: string): PromptNode | undefined {
  const state = get(promptStoreInternal);
  if (state.master.id === id) return state.master;
  for (const section of state.sections) {
    if (section.id === id) return section;
    const foundChild = section.children?.find((child) => child.id === id);
    if (foundChild) return foundChild;
  }
  return undefined;
}

export function getScopePrompts(scope: PromptScope): PromptNode[] {
  return get(flatPromptList).filter((node) => node.scope === scope);
}

export function buildPromptForScope(scope: AutofillScope, seed?: Record<string, unknown>): string {
  const state = get(promptStoreInternal);
  const master = state.master.prompt.trim();
  const scopePrompts = getScopePrompts(scope).map((node) => node.prompt.trim()).filter(Boolean);
  const segments = [
    master && `SIMULATION BLUEPRINT\n${master}`,
    scopePrompts.length > 0 && `FOCUS: ${scope.toUpperCase()}\n${scopePrompts.join('\n\n')}`,
    seed && Object.keys(seed).length ? `REFERENCE SEED\n${JSON.stringify(seed, null, 2)}` : undefined
  ].filter(Boolean) as string[];
  return segments.join('\n\n');
}

export function getPromptHierarchy(): PromptNode {
  const state = get(promptStoreInternal);
  return {
    ...state.master,
    children: state.sections
  };
}
