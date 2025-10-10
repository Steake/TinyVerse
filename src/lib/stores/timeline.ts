import { writable } from 'svelte/store';

export type StoryBeatStatus = 'pending' | 'active' | 'complete';

export interface StoryBeat {
  id: string;
  title: string;
  description: string;
  status: StoryBeatStatus;
  trigger?: string;
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

export const timelineStore = {
  subscribe,
  reset() {
    set(initialState);
  },
  setBeats(beats: StoryBeat[]) {
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
    update((state) => ({
      beats: state.beats.map((beat) =>
        beat.id === id ? { ...beat, status: 'complete' } : beat
      )
    }));
  }
};
