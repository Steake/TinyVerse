import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get, writable, type Writable } from 'svelte/store';

var agentStoreRef: Writable<any[]> | undefined;
var worldStoreRef: Writable<any> | undefined;

if (typeof globalThis.SharedArrayBuffer === 'undefined') {
  Object.defineProperty(globalThis, 'SharedArrayBuffer', {
    value: ArrayBuffer,
    configurable: true,
    writable: true
  });
}

vi.mock('../lib/stores/agents', () => {
  const store = writable<any[]>([]);
  agentStoreRef = store;
  return {
    agentStore: store
  };
});

vi.mock('../lib/stores/world', () => {
  const store = writable<any>({ locations: [] });
  worldStoreRef = store;
  return {
    worldStore: store
  };
});

vi.mock('../lib/stores/prompts', () => ({
  setMasterPrompt: vi.fn()
}));
import {
  setupWizardStore,
  openWizard,
  closeWizard,
  setWizardPrompt,
  setWizardCounts,
  setWizardNarrative,
  startWizardGeneration
} from '../lib/stores/setupWizard';
import type { ScenarioBootstrapHooks, ScenarioBootstrapResult } from '../lib/stores/wizardOrchestrator';
import { runScenarioBootstrap } from '../lib/stores/wizardOrchestrator';

vi.mock('../lib/stores/wizardOrchestrator', () => ({
  runScenarioBootstrap: vi.fn()
}));

describe('setupWizardStore', () => {
  const runScenarioBootstrapMock = vi.mocked(runScenarioBootstrap);

  beforeEach(() => {
    vi.clearAllMocks();
    if (!agentStoreRef || !worldStoreRef) {
      throw new Error('Mock stores failed to initialize');
    }
    agentStoreRef.set([]);
    worldStoreRef.set({ locations: [] });
    closeWizard();
    openWizard();
    setWizardPrompt('Test blueprint');
    setWizardCounts({ agents: 3, locations: 2 });
    setWizardNarrative(true);
  });

  afterEach(() => {
    closeWizard();
  });

  it('initializes progress totals and responds to stage hooks', async () => {
    let capturedHooks: ScenarioBootstrapHooks | undefined;
    let resolveBootstrap: ((result: ScenarioBootstrapResult) => void) | undefined;

    runScenarioBootstrapMock.mockImplementationOnce((_params, hooks) => {
      capturedHooks = hooks;
      return new Promise<ScenarioBootstrapResult>((resolve) => {
        resolveBootstrap = resolve;
      });
    });

    const generationPromise = startWizardGeneration();

    const interimState = get(setupWizardStore);
    expect(interimState.status).toBe('running');
    expect(interimState.step).toBe('progress');
    expect(interimState.progress.stage).toBe('agents');
    expect(interimState.progress.agentsTotal).toBe(3);
    expect(interimState.progress.locationsTotal).toBe(2);
    expect(interimState.progress.beatsTotal).toBe(2);
    expect(interimState.progress.agentsCompleted).toBe(0);
    expect(interimState.progress.locationsCompleted).toBe(0);
    expect(interimState.progress.beatsCompleted).toBe(0);

    expect(capturedHooks).toBeDefined();
    const hooks = capturedHooks!;

    hooks.onStageUpdate?.('agents', { completed: 3, total: 3 });
    const afterAgents = get(setupWizardStore).progress;
    expect(afterAgents.agentsCompleted).toBe(3);
    expect(afterAgents.agentsTotal).toBe(3);

    hooks.onStageUpdate?.('locations', { completed: 2, total: 2 });
    const afterLocations = get(setupWizardStore).progress;
    expect(afterLocations.stage).toBe('locations');
    expect(afterLocations.locationsCompleted).toBe(2);

    hooks.onStageUpdate?.('narrative', { completed: 2, total: 2 });
    const afterNarrative = get(setupWizardStore).progress;
    expect(afterNarrative.stage).toBe('narrative');
    expect(afterNarrative.beatsCompleted).toBe(2);
    expect(afterNarrative.beatsTotal).toBe(2);

    resolveBootstrap?.({ agentsCreated: 3, locationsCreated: 2, beatsCreated: 2 });
    await generationPromise;

    expect(runScenarioBootstrapMock).toHaveBeenCalledTimes(1);
    expect(runScenarioBootstrapMock).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'Test blueprint', agentCount: 3, locationCount: 2, includeNarrative: true }),
      expect.any(Object)
    );

    const finalState = get(setupWizardStore);
    expect(finalState.status).toBe('complete');
    expect(finalState.step).toBe('summary');
    expect(finalState.progress.stage).toBe('complete');
    expect(finalState.progress.agentsCompleted).toBe(3);
    expect(finalState.progress.locationsCompleted).toBe(2);
    expect(finalState.progress.beatsCompleted).toBe(2);
  });
});
