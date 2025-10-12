import { describe, it, expect } from 'vitest';
import { evaluateTrigger, evaluatePendingBeats } from './beatTriggers';
import type { StoryBeat } from '../stores/timeline';
import type { SimulationState } from './beatTriggers';

describe('beatTriggers', () => {
  describe('evaluateTrigger', () => {
    it('should activate simulation_start trigger at step 0', () => {
      const beat: StoryBeat = {
        id: 'beat-1',
        title: 'Start',
        description: 'Beginning',
        status: 'pending',
        trigger: 'simulation_start'
      };
      
      const state: SimulationState = { step: 0, agents: [] };
      const result = evaluateTrigger(beat, state, new Set());
      
      expect(result.shouldActivate).toBe(true);
    });

    it('should not activate manual triggers', () => {
      const beat: StoryBeat = {
        id: 'beat-1',
        title: 'Manual',
        description: 'Requires user action',
        status: 'pending',
        trigger: 'manual'
      };
      
      const state: SimulationState = { step: 5, agents: [] };
      const result = evaluateTrigger(beat, state, new Set());
      
      expect(result.shouldActivate).toBe(false);
      expect(result.reason).toBe('Manual trigger');
    });

    it('should activate after:beat-id when referenced beat completes', () => {
      const beat: StoryBeat = {
        id: 'beat-2',
        title: 'Second',
        description: 'Follows first',
        status: 'pending',
        trigger: 'after:beat-1'
      };
      
      const state: SimulationState = { step: 5, agents: [] };
      const completedBeats = new Set(['beat-1']);
      const result = evaluateTrigger(beat, state, completedBeats);
      
      expect(result.shouldActivate).toBe(true);
    });

    it('should not activate after:beat-id when referenced beat not complete', () => {
      const beat: StoryBeat = {
        id: 'beat-2',
        title: 'Second',
        description: 'Follows first',
        status: 'pending',
        trigger: 'after:beat-1'
      };
      
      const state: SimulationState = { step: 5, agents: [] };
      const completedBeats = new Set<string>();
      const result = evaluateTrigger(beat, state, completedBeats);
      
      expect(result.shouldActivate).toBe(false);
    });

    it('should activate step:N trigger when step reached', () => {
      const beat: StoryBeat = {
        id: 'beat-1',
        title: 'Midpoint',
        description: 'Happens at step 10',
        status: 'pending',
        trigger: 'step:10'
      };
      
      const state: SimulationState = { step: 10, agents: [] };
      const result = evaluateTrigger(beat, state, new Set());
      
      expect(result.shouldActivate).toBe(true);
    });

    it('should not activate step:N trigger before step reached', () => {
      const beat: StoryBeat = {
        id: 'beat-1',
        title: 'Midpoint',
        description: 'Happens at step 10',
        status: 'pending',
        trigger: 'step:10'
      };
      
      const state: SimulationState = { step: 5, agents: [] };
      const result = evaluateTrigger(beat, state, new Set());
      
      expect(result.shouldActivate).toBe(false);
    });

    it('should activate agent:Name:action trigger when agent performs action', () => {
      const beat: StoryBeat = {
        id: 'beat-1',
        title: 'Call Made',
        description: 'Max makes a call',
        status: 'pending',
        trigger: 'agent:Max:make_call'
      };
      
      const state: SimulationState = {
        step: 5,
        agents: [],
        lastAction: {
          agentName: 'Max',
          action: 'make_call',
          timestamp: Date.now()
        }
      };
      
      const result = evaluateTrigger(beat, state, new Set());
      
      expect(result.shouldActivate).toBe(true);
    });

    it('should handle partial action matching', () => {
      const beat: StoryBeat = {
        id: 'beat-1',
        title: 'Call Made',
        description: 'Max makes a call',
        status: 'pending',
        trigger: 'agent:Max:call'
      };
      
      const state: SimulationState = {
        step: 5,
        agents: [],
        lastAction: {
          agentName: 'Max',
          action: 'make_phone_call',
          timestamp: Date.now()
        }
      };
      
      const result = evaluateTrigger(beat, state, new Set());
      
      expect(result.shouldActivate).toBe(true);
    });

    it('should not activate agent:Name:action when wrong agent', () => {
      const beat: StoryBeat = {
        id: 'beat-1',
        title: 'Call Made',
        description: 'Max makes a call',
        status: 'pending',
        trigger: 'agent:Max:make_call'
      };
      
      const state: SimulationState = {
        step: 5,
        agents: [],
        lastAction: {
          agentName: 'Alice',
          action: 'make_call',
          timestamp: Date.now()
        }
      };
      
      const result = evaluateTrigger(beat, state, new Set());
      
      expect(result.shouldActivate).toBe(false);
    });
  });

  describe('evaluatePendingBeats', () => {
    it('should return IDs of all beats that should activate', () => {
      const beats: StoryBeat[] = [
        {
          id: 'beat-1',
          title: 'Start',
          description: 'Beginning',
          status: 'complete',
          trigger: 'simulation_start'
        },
        {
          id: 'beat-2',
          title: 'Second',
          description: 'After first',
          status: 'pending',
          trigger: 'after:beat-1'
        },
        {
          id: 'beat-3',
          title: 'Third',
          description: 'At step 10',
          status: 'pending',
          trigger: 'step:10'
        }
      ];
      
      const state: SimulationState = { step: 10, agents: [] };
      const toActivate = evaluatePendingBeats(beats, state);
      
      expect(toActivate).toContain('beat-2');
      expect(toActivate).toContain('beat-3');
      expect(toActivate).not.toContain('beat-1'); // Already complete
    });

    it('should only evaluate pending beats', () => {
      const beats: StoryBeat[] = [
        {
          id: 'beat-1',
          title: 'Active',
          description: 'Currently active',
          status: 'active',
          trigger: 'step:5'
        },
        {
          id: 'beat-2',
          title: 'Pending',
          description: 'Should trigger',
          status: 'pending',
          trigger: 'step:5'
        }
      ];
      
      const state: SimulationState = { step: 5, agents: [] };
      const toActivate = evaluatePendingBeats(beats, state);
      
      expect(toActivate).toEqual(['beat-2']);
    });
  });
});
