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
      }))
  };
}

export const stageStore = createStageStore();