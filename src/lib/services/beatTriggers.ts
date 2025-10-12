/**
 * Beat trigger evaluation engine.
 * Automatically activates story beats based on simulation state changes.
 */

import type { StoryBeat } from '../stores/timeline';
import type { Agent } from '../stores/types';

export interface SimulationState {
  step: number;
  agents: Agent[];
  lastAction?: {
    agentName: string;
    action: string;
    timestamp: number;
  };
}

export interface TriggerEvaluation {
  shouldActivate: boolean;
  reason?: string;
}

/**
 * Evaluates whether a beat's trigger condition is met.
 */
export function evaluateTrigger(
  beat: StoryBeat,
  state: SimulationState,
  completedBeatIds: Set<string>
): TriggerEvaluation {
  if (!beat.trigger) {
    return { shouldActivate: false, reason: 'No trigger defined' };
  }

  const trigger = beat.trigger.trim();

  // simulation_start - handled at initialization
  if (trigger === 'simulation_start') {
    return { shouldActivate: state.step === 0 };
  }

  // manual - never auto-activate
  if (trigger === 'manual') {
    return { shouldActivate: false, reason: 'Manual trigger' };
  }

  // after:beat-id - activate when referenced beat completes
  if (trigger.startsWith('after:')) {
    const requiredBeatId = trigger.substring(6);
    if (completedBeatIds.has(requiredBeatId)) {
      return { shouldActivate: true, reason: `Beat ${requiredBeatId} completed` };
    }
    return { shouldActivate: false, reason: `Waiting for beat ${requiredBeatId}` };
  }

  // step:N - activate at specific simulation step
  if (trigger.startsWith('step:')) {
    const targetStep = parseInt(trigger.substring(5), 10);
    if (isNaN(targetStep)) {
      return { shouldActivate: false, reason: `Invalid step number: ${trigger}` };
    }
    if (state.step >= targetStep) {
      return { shouldActivate: true, reason: `Step ${state.step} >= ${targetStep}` };
    }
    return { shouldActivate: false, reason: `Waiting for step ${targetStep}` };
  }

  // agent:AgentName:action - activate when specific agent performs action
  if (trigger.startsWith('agent:')) {
    const parts = trigger.split(':');
    if (parts.length < 3) {
      return { shouldActivate: false, reason: `Invalid agent trigger format: ${trigger}` };
    }
    
    const targetAgentName = parts[1];
    const targetAction = parts.slice(2).join(':'); // Handle actions with colons
    
    if (!state.lastAction) {
      return { shouldActivate: false, reason: 'No recent action' };
    }
    
    // Check if the last action matches
    const agentMatches = state.lastAction.agentName.toLowerCase() === targetAgentName.toLowerCase();
    const actionMatches = state.lastAction.action.toLowerCase().includes(targetAction.toLowerCase());
    
    if (agentMatches && actionMatches) {
      return { 
        shouldActivate: true, 
        reason: `${state.lastAction.agentName} performed ${state.lastAction.action}` 
      };
    }
    
    return { shouldActivate: false, reason: `Waiting for ${targetAgentName} to ${targetAction}` };
  }

  // condition:expression - evaluate arbitrary condition (advanced)
  if (trigger.startsWith('condition:')) {
    const expression = trigger.substring(10);
    // For now, just log and skip - this would need a safe expression evaluator
    console.warn(`Condition triggers not yet implemented: ${expression}`);
    return { shouldActivate: false, reason: 'Condition evaluation not implemented' };
  }

  // Unknown trigger pattern
  return { shouldActivate: false, reason: `Unknown trigger pattern: ${trigger}` };
}

/**
 * Evaluates all pending beats and returns IDs that should be activated.
 */
export function evaluatePendingBeats(
  beats: StoryBeat[],
  state: SimulationState
): string[] {
  const completedBeatIds = new Set(
    beats.filter(b => b.status === 'complete').map(b => b.id)
  );
  
  const toActivate: string[] = [];
  
  for (const beat of beats) {
    if (beat.status !== 'pending') continue;
    
    const evaluation = evaluateTrigger(beat, state, completedBeatIds);
    
    if (evaluation.shouldActivate) {
      toActivate.push(beat.id);
      if (evaluation.reason) {
        console.log(`[Beat Trigger] Activating "${beat.title}": ${evaluation.reason}`);
      }
    }
  }
  
  return toActivate;
}

/**
 * Processes simulation event and updates beat states accordingly.
 */
export function processSimulationEvent(
  eventType: 'step' | 'action' | 'start',
  eventData: {
    step?: number;
    agentName?: string;
    action?: string;
  },
  beats: StoryBeat[]
): { beatsToActivate: string[]; state: SimulationState } {
  // Build simulation state from event
  const state: SimulationState = {
    step: eventData.step ?? 0,
    agents: [], // Would be populated from agentStore in real usage
    lastAction: eventData.agentName && eventData.action
      ? {
          agentName: eventData.agentName,
          action: eventData.action,
          timestamp: Date.now()
        }
      : undefined
  };
  
  const beatsToActivate = evaluatePendingBeats(beats, state);
  
  return { beatsToActivate, state };
}
