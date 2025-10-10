import { writable } from 'svelte/store';
import type { StageState, Interaction } from '../utils/mock-data/grand-stage';
import { initialStageState } from '../utils/mock-data/grand-stage';

function createStageStore() {
  const { subscribe, set, update } = writable<StageState>(initialStageState);

  return {
    subscribe,
    updateTime: (newTime: Date) => update(state => ({ ...state, time: newTime })),
    updateWeather: (weather: StageState['weather']) => 
      update(state => ({ ...state, weather })),
    updateAgentPosition: (agentId: string, x: number, y: number) =>
      update(state => ({
        ...state,
        agentPositions: {
          ...state.agentPositions,
          [agentId]: { x, y }
        }
      })),
    addInteraction: (interaction: Interaction) =>
      update(state => ({
        ...state,
        currentInteractions: [...state.currentInteractions, interaction]
      })),
    removeInteraction: (interactionId: string) =>
      update(state => ({
        ...state,
        currentInteractions: state.currentInteractions.filter(
          i => i.id !== interactionId
        )
      })),
    addAgent: (agentId: string, position: { x: number; y: number }) =>
      update(state => ({
        ...state,
        activeAgents: [...state.activeAgents, agentId],
        agentPositions: {
          ...state.agentPositions,
          [agentId]: position
        }
      })),
    removeAgent: (agentId: string) =>
      update(state => ({
        ...state,
        activeAgents: state.activeAgents.filter(id => id !== agentId),
        agentPositions: Object.fromEntries(
          Object.entries(state.agentPositions).filter(([id]) => id !== agentId)
        )
      })),

    seedScene: (agentIds: string[], positions: Record<string, { x: number; y: number }>) =>
      update(state => ({
        ...state,
        activeAgents: Array.isArray(agentIds) ? agentIds : [],
        agentPositions: {
          ...state.agentPositions,
          ...(positions ?? {})
        }
      })),
    seedFromAgents: (agents: { id: string }[]) =>
      update(state => {
        const ids = Array.isArray(agents) ? agents.map(a => a.id) : [];
        const positions = ids.reduce<Record<string, { x: number; y: number }>>((acc, id) => {
          acc[id] = {
            x: 100 + Math.random() * 600,
            y: 100 + Math.random() * 400
          };
          return acc;
        }, {});
        return {
          ...state,
          activeAgents: ids,
          agentPositions: {
            ...state.agentPositions,
            ...positions
          }
        };
      })
  };
}

export const stageStore = createStageStore();