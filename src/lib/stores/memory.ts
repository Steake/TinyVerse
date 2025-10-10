import { writable } from 'svelte/store';
import { api } from '../api';
import { loadingStore } from './loading';
import { toastStore } from './toast';
import type { MemoryEntry } from './types';

type MemoryState = {
  episodic: MemoryEntry[];
  semantic: MemoryEntry[];
  queryMatches: unknown[];
  summary: string;
};

const initialState: MemoryState = {
  episodic: [],
  semantic: [],
  queryMatches: [],
  summary: '',
};

function createMemoryStore() {
  const { subscribe, update, set } = writable<MemoryState>({ ...initialState });

  return {
    subscribe,

    reset() {
      set({ ...initialState });
    },

    async fetchEpisodic(agentId: string, options: { first_n?: number; last_n?: number; item_type?: string } = {}) {
      try {
        loadingStore.start(`memory:episodic:${agentId}`);
        const response = await api.getEpisodicMemory(agentId, options);
        update((state) => ({ ...state, episodic: response.data ?? [] }));
      } catch (error) {
        console.error('Failed to fetch episodic memory:', error);
        toastStore.error('Failed to load episodic memory');
      } finally {
        loadingStore.stop(`memory:episodic:${agentId}`);
      }
    },

    async fetchSemantic(agentId: string, options: { limit?: number; item_type?: string } = {}) {
      try {
        loadingStore.start(`memory:semantic:${agentId}`);
        const response = await api.getSemanticMemory(agentId, options);
        update((state) => ({ ...state, semantic: response.data ?? [] }));
      } catch (error) {
        console.error('Failed to fetch semantic memory:', error);
        toastStore.error('Failed to load semantic memory');
      } finally {
        loadingStore.stop(`memory:semantic:${agentId}`);
      }
    },

    async querySemantic(agentId: string, query: string, top_k = 5) {
      try {
        loadingStore.start(`memory:semantic:query:${agentId}`);
        const response = await api.querySemanticMemory(agentId, { query, top_k });
        update((state) => ({ ...state, queryMatches: response.data?.matches ?? [] }));
      } catch (error) {
        console.error('Failed to query semantic memory:', error);
        toastStore.error('Failed to query semantic memory');
      } finally {
        loadingStore.stop(`memory:semantic:query:${agentId}`);
      }
    },

    async summarizeSemantic(agentId: string, query: string, batch_size = 20) {
      try {
        loadingStore.start(`memory:semantic:summarize:${agentId}`);
        const response = await api.summarizeSemanticMemory(agentId, { query, batch_size });
        update((state) => ({ ...state, summary: response.data?.summary ?? '' }));
      } catch (error) {
        console.error('Failed to summarize semantic memory:', error);
        toastStore.error('Failed to summarize semantic memory');
      } finally {
        loadingStore.stop(`memory:semantic:summarize:${agentId}`);
      }
    },

    async ingestSemantic(agentId: string, payload: { text?: string; url?: string; document_name?: string }) {
      try {
        loadingStore.start(`memory:semantic:ingest:${agentId}`);
        await api.ingestSemanticMemory(agentId, payload);
        toastStore.success('Added to semantic memory');
      } catch (error) {
        console.error('Failed to ingest semantic memory:', error);
        toastStore.error('Failed to add semantic memory');
        throw error;
      } finally {
        loadingStore.stop(`memory:semantic:ingest:${agentId}`);
      }
    },

    async clearEpisodic(agentId: string, payload: { max_prefix?: number; max_suffix?: number } = {}) {
      try {
        loadingStore.start(`memory:episodic:clear:${agentId}`);
        await api.clearEpisodicMemory(agentId, payload);
        update((state) => ({ ...state, episodic: [] }));
        toastStore.success('Cleared episodic memory');
      } catch (error) {
        console.error('Failed to clear episodic memory:', error);
        toastStore.error('Failed to clear episodic memory');
        throw error;
      } finally {
        loadingStore.stop(`memory:episodic:clear:${agentId}`);
      }
    },
  };
}

export const memoryStore = createMemoryStore();
