import { writable, get } from 'svelte/store';
import { agentStore } from './agents';
import { worldStore } from './world';
import { setMasterPrompt } from './prompts';
import { runScenarioBootstrap, type ScenarioBootstrapResult, type ScenarioBootstrapHooks } from './wizardOrchestrator';
import { ApiError } from '../api/errors';
import { api } from '../api';

export type WizardStep = 'welcome' | 'prompt' | 'progress' | 'summary';

export interface WizardProgress {
  stage: 'idle' | 'agents' | 'locations' | 'narrative' | 'complete';
  agentsCompleted: number;
  agentsTotal: number;
  locationsCompleted: number;
  locationsTotal: number;
  beatsCompleted: number;
  beatsTotal: number;
}

export interface SetupWizardState {
  isOpen: boolean;
  step: WizardStep;
  prompt: string;
  agentCount: number;
  locationCount: number;
  includeNarrative: boolean;
  status: 'idle' | 'running' | 'complete' | 'error';
  error?: string;
  result?: ScenarioBootstrapResult;
  progress: WizardProgress;
}

const emptyProgress: WizardProgress = {
  stage: 'idle',
  agentsCompleted: 0,
  agentsTotal: 0,
  locationsCompleted: 0,
  locationsTotal: 0,
  beatsCompleted: 0,
  beatsTotal: 0
};

const initialState: SetupWizardState = {
  isOpen: false,
  step: 'welcome',
  prompt: '',
  agentCount: 4,
  locationCount: 3,
  includeNarrative: true,
  status: 'idle',
  progress: { ...emptyProgress }
};

export const setupWizardStore = writable<SetupWizardState>({ ...initialState });

export function openWizard() {
  setupWizardStore.update((state) => ({
    ...state,
    isOpen: true,
    step: 'welcome',
    status: 'idle',
    error: undefined,
    result: undefined,
    progress: { ...emptyProgress }
  }));
}

export function closeWizard() {
  setupWizardStore.set({ ...initialState, progress: { ...emptyProgress } });
}

export function setWizardPrompt(prompt: string) {
  setupWizardStore.update((state) => ({ ...state, prompt }));
}

export function setWizardCounts({ agents, locations }: { agents?: number; locations?: number }) {
  setupWizardStore.update((state) => ({
    ...state,
    agentCount: agents !== undefined ? Math.max(1, Math.min(20, Math.round(agents))) : state.agentCount,
    locationCount: locations !== undefined ? Math.max(1, Math.min(15, Math.round(locations))) : state.locationCount
  }));
}

export function setWizardNarrative(value: boolean) {
  setupWizardStore.update((state) => ({ ...state, includeNarrative: value }));
}

export function advanceWizard(step: WizardStep) {
  setupWizardStore.update((state) => ({ ...state, step }));
}

export async function startWizardGeneration() {
  const state = get(setupWizardStore);
  if (!state.prompt.trim()) {
    setupWizardStore.update((s) => ({ ...s, error: 'Please provide a simulation prompt.' }));
    return;
  }

  setupWizardStore.update((s) => ({
    ...s,
    status: 'running',
    step: 'progress',
    error: undefined,
    progress: {
      stage: 'agents',
      agentsCompleted: 0,
      agentsTotal: state.agentCount,
      locationsCompleted: 0,
      locationsTotal: state.locationCount,
      beatsCompleted: 0,
      beatsTotal: state.includeNarrative ? Math.max(1, state.locationCount) : 0
    }
  }));

  const hooks: ScenarioBootstrapHooks = {
    onStageUpdate(stage, detail) {
      setupWizardStore.update((s) => {
        const next = { ...s.progress };
        if (stage === 'agents') {
          next.stage = 'agents';
          next.agentsCompleted = detail.completed;
          next.agentsTotal = detail.total;
        } else if (stage === 'locations') {
          next.stage = 'locations';
          next.locationsCompleted = detail.completed;
          next.locationsTotal = detail.total;
        } else if (stage === 'narrative') {
          next.stage = 'narrative';
          next.beatsCompleted = detail.completed;
          next.beatsTotal = detail.total;
        }
        return { ...s, progress: next };
      });
    }
  };

  try {
    setMasterPrompt(state.prompt.trim());
    const result = await runScenarioBootstrap({
      prompt: state.prompt.trim(),
      agentCount: state.agentCount,
      locationCount: state.locationCount,
      includeNarrative: state.includeNarrative
    }, hooks);
    setupWizardStore.update((s) => ({
      ...s,
      status: 'complete',
      step: 'summary',
      result,
      progress: { ...s.progress, stage: 'complete' }
    }));
  } catch (error: any) {
    console.error('Wizard generation failed', error);
    let message = 'Generation failed. Please adjust your prompt and try again.';

    if (error instanceof ApiError && error.code === 'TIMEOUT') {
      const budget = error.details?.timeoutMs ?? error.details?.durationMs;
      const hint = budget ? `${budget}ms` : 'the configured limit';
      message = `Wizard request timed out after ${hint}. The backend may finish shortly—consider retrying or increasing the autofill timeout.`;
    } else if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
      const target = api.getConfig().baseUrl.replace(/\/?$/, '');
      const original = typeof error.details?.originalError === 'string' ? error.details.originalError : undefined;
      message = `Wizard couldn't reach the backend at ${target}.${original ? ` Network layer reported: ${original}.` : ''} Confirm the server is running, accessible from the browser, and not blocked by CORS.`;
    } else if (error instanceof ApiError || error?.code || error?.status) {
      const status = error.status ?? (typeof error.code === 'string' && error.code.startsWith('HTTP_')
        ? Number.parseInt(error.code.replace('HTTP_', ''), 10)
        : undefined);

      if (status === 405) {
        message = 'Backend rejected the wizard request because it received GET /autofill. Confirm the API is reachable and accepts POST /autofill calls.';
      } else if (status === 502) {
        message = 'Wizard request failed while the LLM adapter was processing. Try again in a moment.';
      } else if (status === 500) {
        message = 'Wizard request failed on the server. Check backend logs for autofill errors.';
      } else if (status) {
        message = `Wizard request failed with HTTP ${status}.`;
      }
    } else if (error?.message) {
      message = error.message;
    }

    setupWizardStore.update((s) => ({
      ...s,
      status: 'error',
      error: message
    }));
  }
}

export function maybeLaunchWizard() {
  const agents = get(agentStore);
  const world = get(worldStore);
  if ((agents?.length ?? 0) === 0 && (world?.locations?.length ?? 0) === 0) {
    openWizard();
  }
}
