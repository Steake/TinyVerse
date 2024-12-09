import { writable } from 'svelte/store';
import type { SimulationLog } from './types';

interface SimulationState {
  isRunning: boolean;
  currentTime: Date;
  speed: number;
  logs: SimulationLog[];
}

const DEFAULT_STATE: SimulationState = {
  isRunning: false,
  currentTime: new Date('2024-02-20T09:00:00'),
  speed: 1,
  logs: []
};

function createSimulationStore() {
  const { subscribe, set, update } = writable<SimulationState>(DEFAULT_STATE);

  let lastUpdateTime = Date.now();
  let intervalId: number | null = null;

  function updateSimulationTime(state: SimulationState): SimulationState {
    const now = Date.now();
    const elapsed = now - lastUpdateTime;
    lastUpdateTime = now;

    const newTime = new Date(
      state.currentTime.getTime() + (elapsed * state.speed * 60)
    );

    return {
      ...state,
      currentTime: newTime
    };
  }

  return {
    subscribe,
    start: () => {
      lastUpdateTime = Date.now();
      update(state => ({ ...state, isRunning: true }));
    },
    pause: () => update(state => ({ ...state, isRunning: false })),
    step: () => {
      lastUpdateTime = Date.now();
      update(state => ({
        ...state,
        currentTime: new Date(state.currentTime.getTime() + (60000 * state.speed))
      }));
    },
    setSpeed: (speed: number) => {
      lastUpdateTime = Date.now();
      update(state => ({ ...state, speed }));
    },
    addLog: (log: SimulationLog) => update(state => ({
      ...state,
      logs: [...state.logs, log]
    })),
    reset: () => {
      lastUpdateTime = Date.now();
      set(DEFAULT_STATE);
    },
    tick: () => update(updateSimulationTime)
  };
}

export const simulationStore = createSimulationStore();