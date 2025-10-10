import { writable } from 'svelte/store';
import { api } from '../api';
import type { SimulationLog } from './types';
import type {
  SimulationControlResponseDTO,
} from '../api/types';
import { toastStore } from './toast';
import { normalizeSimulationLog } from '../utils/simulation';

export type { SimulationLog } from './types';

interface SimulationState {
  isRunning: boolean;
  currentTime: Date;
  speed: number;
  logs: SimulationLog[];
  currentStep: number;
  agentCount: number;
  worldName?: string;
  lastFetchedAt?: string;
  isBusy: boolean;
}

const DEFAULT_STATE: SimulationState = {
  isRunning: false,
  currentTime: new Date('2024-02-20T09:00:00'),
  speed: 1,
  logs: [],
  currentStep: 0,
  agentCount: 0,
  worldName: undefined,
  lastFetchedAt: undefined,
  isBusy: false
};

function createSimulationStore() {
  const { subscribe, set, update } = writable<SimulationState>(DEFAULT_STATE);

  let lastUpdateTime = Date.now();

  function updateSimulationTime(state: SimulationState): SimulationState {
    const now = Date.now();
    const elapsed = now - lastUpdateTime;
    lastUpdateTime = now;

    const newTime = new Date(
      state.currentTime.getTime() + elapsed * state.speed * 60
    );

    return {
      ...state,
      currentTime: newTime
    };
  }

  function mergeLogs(existing: SimulationLog[], incoming: SimulationLog[]): SimulationLog[] {
    const map = new Map(existing.map(log => [log.id, log] as const));
    for (const log of incoming) {
      map.set(log.id, log);
    }
    return Array.from(map.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  function applyControlResponse(response?: SimulationControlResponseDTO) {
    if (!response?.state) {
      return;
    }

    const state = response.state;
    update(current => ({
      ...current,
      isRunning: state.is_running,
      currentStep: state.current_step,
      agentCount: state.agents_count,
      worldName: state.world_name
    }));
  }

  async function fetchLogs(limit = 100) {
    try {
      const response = await api.getLogs({ limit });
      const logs = (response.data ?? []).map((log, index) =>
        normalizeSimulationLog(log, index)
      );

      update(state => ({
        ...state,
        logs: mergeLogs(state.logs, logs),
        lastFetchedAt: new Date().toISOString()
      }));

      return logs;
    } catch (error) {
      console.error('Failed to fetch simulation logs', error);
      toastStore.error('Unable to load simulation logs');
      throw error;
    }
  }

  async function fetchState() {
    try {
      const response = await api.getSimulationState();
      const dto = response.data;

      if (!dto) {
        return dto;
      }

      update(state => ({
        ...state,
        isRunning: dto.is_running,
        currentStep: dto.current_step,
        agentCount: dto.agents_count,
        worldName: dto.world_name
      }));

      return dto;
    } catch (error) {
      console.error('Failed to fetch simulation state', error);
      toastStore.error('Unable to load simulation state');
      throw error;
    }
  }

  return {
    subscribe,

    start: async (steps = 5) => {
      lastUpdateTime = Date.now();
      update(state => ({ ...state, isBusy: true, isRunning: true }));

      try {
        const response = await api.controlSimulation('start', steps);
        applyControlResponse(response.data);
        await fetchLogs();
      } catch (error) {
        update(state => ({ ...state, isRunning: false }));
        console.error('Failed to start simulation', error);
        toastStore.error('Failed to start simulation');
        throw error;
      } finally {
        update(state => ({ ...state, isBusy: false }));
      }
    },

    pause: async () => {
      update(state => ({ ...state, isBusy: true }));
      try {
        const response = await api.controlSimulation('pause');
        applyControlResponse(response.data);
      } catch (error) {
        console.error('Failed to pause simulation', error);
        toastStore.error('Failed to pause simulation');
        throw error;
      } finally {
        update(state => ({ ...state, isRunning: false, isBusy: false }));
      }
    },

    step: async (steps = 1) => {
      lastUpdateTime = Date.now();
      update(state => ({ ...state, isBusy: true }));
      try {
        const response = await api.controlSimulation('step', steps);
        applyControlResponse(response.data);
        await fetchLogs();
      } catch (error) {
        console.error('Failed to step simulation', error);
        toastStore.error('Failed to advance simulation');
        throw error;
      } finally {
        update(state => ({ ...state, isBusy: false }));
      }
    },

    setSpeed: (speed: number) => {
      lastUpdateTime = Date.now();
      update(state => ({ ...state, speed }));
    },

    addLog: (log: SimulationLog) => update(state => {
      const normalized = normalizeSimulationLog({
        timestamp: log.timestamp,
        agent_id: log.agentId,
        agent_name: log.agentName,
        action_type: log.action,
        content: log.content,
        metadata: log.metadata as Record<string, unknown> | undefined
      });

      const finalLog = log.id ? { ...normalized, id: log.id } : normalized;

      return {
        ...state,
        logs: mergeLogs(state.logs, [finalLog])
      };
    }),

    seedLogs: (logs: SimulationLog[]) => {
      if (!logs || logs.length === 0) {
        return;
      }

      update(state => {
        const normalized = logs.map((log, index) => {
          const dto = {
            timestamp: log.timestamp,
            agent_id: log.agentId,
            agent_name: log.agentName,
            action_type: log.action,
            content: log.content,
            metadata: log.metadata as Record<string, unknown> | undefined
          };

          const normalizedLog = normalizeSimulationLog(dto, index);
          return log.id ? { ...normalizedLog, id: log.id } : normalizedLog;
        });

        const merged = mergeLogs(state.logs, normalized);
        const agentIds = new Set(merged.map(log => log.agentId).filter((id): id is string => Boolean(id)));
        const lastLog = merged[merged.length - 1];

        return {
          ...state,
          logs: merged,
          agentCount: agentIds.size > 0 ? agentIds.size : state.agentCount,
          currentTime: lastLog ? new Date(lastLog.timestamp) : state.currentTime,
          currentStep: Math.max(state.currentStep, merged.length),
          lastFetchedAt: new Date().toISOString()
        };
      });
    },

    reset: () => {
      lastUpdateTime = Date.now();
      set(DEFAULT_STATE);
    },

    tick: () => update(updateSimulationTime),

    fetchLogs,
    fetchState,

    refresh: async () => {
      await Promise.all([fetchState(), fetchLogs()]);
    }
  };
}

export const simulationStore = createSimulationStore();