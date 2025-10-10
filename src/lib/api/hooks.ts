import { derived, writable, type Readable } from 'svelte/store';
import type { ApiResponse, QueryParams } from './types';
import { api } from './client';
import type { Agent, Location, SimulationLog } from '../stores/types';
import type { SimulationStateDTO } from './types';
import { normalizeSimulationLog } from '../utils/simulation';

interface QueryState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function createQuery<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: {
    enabled?: boolean;
    initialData?: T;
  } = {}
): Readable<QueryState<T>> {
  const { enabled = true, initialData = null } = options;
  
  const state = writable<QueryState<T>>({
    data: initialData,
    error: null,
    loading: enabled
  });

  async function execute() {
    if (!enabled) return;

    state.update(s => ({ ...s, loading: true, error: null }));

    try {
      const response = await fetcher();
      state.update(s => ({ ...s, data: response.data, loading: false }));
    } catch (error: any) {
      state.update(s => ({ ...s, error, loading: false }));
    }
  }

  if (enabled) {
    execute();
  }

  return {
    subscribe: state.subscribe
  };
}

export function useAgents(params?: QueryParams) {
  return createQuery<Agent[]>(() => api.getAgents(params));
}

export function useAgent(id: string) {
  return createQuery<Agent>(() => api.getAgent(id));
}

export function useLocations(params?: QueryParams) {
  return createQuery<Location[]>(() => api.getLocations(params));
}

export function useLogs(filters?: Parameters<typeof api.getLogs>[0]) {
  return createQuery<SimulationLog[]>(async () => {
    const response = await api.getLogs(filters);

    return {
      ...response,
      data: (response.data ?? []).map((log, index) =>
        normalizeSimulationLog(log, index)
      )
    };
  });
}

export function useSimulationStatus() {
  const status = createQuery<SimulationStateDTO>(() => api.getSimulationState());

  return derived(status, $status => ({
    ...$status,
    data: $status.data
      ? {
          isRunning: $status.data.is_running,
          currentStep: $status.data.current_step,
          agentCount: $status.data.agents_count,
          worldName: $status.data.world_name
        }
      : null
  }));
}