import { writable } from 'svelte/store';
import { evaluatePendingBeats, type SimulationState } from '../services/beatTriggers';

export type StoryBeatStatus = 'pending' | 'active' | 'complete';

export interface StoryBeat {
  id: string;
  title: string;
  description: string;
  status: StoryBeatStatus;
  /**
   * Trigger condition for activating this beat.
   * 
   * Supported patterns (ALL AUTOMATICALLY EVALUATED):
   * - "simulation_start": Activates when simulation begins (use for first beat)
   * - "after:beat-id": Auto-activates when specified beat completes
   * - "step:N": Activates after N simulation steps (e.g., "step:20" for midpoint)
   * - "agent:Name:action": Activates when agent performs action (partial action matching)
   * - "manual": Requires manual activation via UI
   * 
   * Triggers are evaluated automatically during:
   * - Simulation start (simulation_start)
   * - Each simulation step (step:N)
   * - Beat completion (after:beat-id)
   * - Agent action logs (agent:Name:action)
   */
  trigger?: string;
  /**
   * If true, this beat represents a critical decision point.
   * In future implementations, blocking beats may pause simulation until resolved.
   * Currently used as a visual indicator in the UI.
   */
  blocking?: boolean;
  metadata?: Record<string, unknown>;
}

interface TimelineState {
  beats: StoryBeat[];
}

const initialState: TimelineState = {
  beats: []
};

const { subscribe, set, update } = writable<TimelineState>(initialState);

/**
 * Validates story beats for common issues.
 * Returns array of warning messages (empty if no issues).
 */
function validateBeats(beats: StoryBeat[]): string[] {
  const warnings: string[] = [];
  
  if (beats.length === 0) return warnings;
  
  // Check for duplicate IDs
  const ids = new Set<string>();
  const duplicates = new Set<string>();
  beats.forEach(beat => {
    if (ids.has(beat.id)) {
      duplicates.add(beat.id);
    }
    ids.add(beat.id);
  });
  if (duplicates.size > 0) {
    warnings.push(`Duplicate beat IDs: ${Array.from(duplicates).join(', ')}`);
  }
  
  // Check if first beat has simulation_start trigger
  const firstBeat = beats[0];
  if (firstBeat && firstBeat.trigger !== 'simulation_start' && firstBeat.trigger !== 'manual') {
    warnings.push(`First beat "${firstBeat.title}" should have trigger "simulation_start" or "manual"`);
  }
  
  // Check for broken trigger references
  beats.forEach(beat => {
    if (beat.trigger?.startsWith('after:')) {
      const refId = beat.trigger.substring(6);
      if (!ids.has(refId)) {
        const availableIds = Array.from(ids).join(', ');
        warnings.push(`Beat "${beat.title}" references non-existent beat ID: ${refId}. Available IDs: [${availableIds}]`);
      }
    }
  });
  
  // Check if any beat has status 'active' (should start as pending)
  const activeCount = beats.filter(b => b.status === 'active').length;
  if (activeCount > 1) {
    warnings.push(`Multiple beats marked as active (${activeCount}). Only one beat should be active at a time.`);
  }
  
  return warnings;
}

export const timelineStore = {
  subscribe,
  reset() {
    set(initialState);
  },
  setBeats(beats: StoryBeat[]) {
    const warnings = validateBeats(beats);
    if (warnings.length > 0) {
      console.warn('Story beat validation warnings:', warnings);
    }
    set({ beats });
  },
  appendBeats(beats: StoryBeat[]) {
    update((state) => ({ beats: [...state.beats, ...beats] }));
  },
  markActive(id: string) {
    update((state) => ({
      beats: state.beats.map((beat) =>
        beat.id === id
          ? { ...beat, status: 'active' }
          : beat.status === 'active'
            ? { ...beat, status: 'complete' }
            : beat
      )
    }));
  },
  markComplete(id: string) {
    update((state) => {
      const beats = state.beats.map((beat) =>
        beat.id === id ? { ...beat, status: 'complete' as StoryBeatStatus } : beat
      );
      
      // Auto-activate next beat if it has "after:completedId" trigger
      const completedBeatId = id;
      const nextBeat = beats.find(
        (beat) => beat.status === 'pending' && beat.trigger === `after:${completedBeatId}`
      );
      
      if (nextBeat) {
        return {
          beats: beats.map((beat) =>
            beat.id === nextBeat.id ? { ...beat, status: 'active' as StoryBeatStatus } : beat
          )
        };
      }
      
      return { beats };
    });
  },
  /**
   * Evaluate triggers based on current simulation state.
   * Auto-activates beats whose conditions are met.
   */
  evaluateTriggers(state: SimulationState) {
    update((timeline) => {
      const beatsToActivate = evaluatePendingBeats(timeline.beats, state);
      
      if (beatsToActivate.length === 0) {
        return timeline; // No changes
      }
      
      // Deactivate current active beat when activating new one
      const hasActiveBeat = timeline.beats.some(b => b.status === 'active');
      
      return {
        beats: timeline.beats.map((beat) => {
          if (beatsToActivate.includes(beat.id)) {
            return { ...beat, status: 'active' as StoryBeatStatus };
          }
          // Mark current active beat as complete when new beat activates
          if (hasActiveBeat && beat.status === 'active' && beatsToActivate.length > 0) {
            return { ...beat, status: 'complete' as StoryBeatStatus };
          }
          return beat;
        })
      };
    });
  },
  /**
   * Convenience method for simulation step events.
   */
  onSimulationStep(step: number) {
    this.evaluateTriggers({ step, agents: [] });
  },
  /**
   * Convenience method for agent action events.
   */
  onAgentAction(agentName: string, action: string, step: number = 0) {
    this.evaluateTriggers({
      step,
      agents: [],
      lastAction: {
        agentName,
        action,
        timestamp: Date.now()
      }
    });
  }
};
