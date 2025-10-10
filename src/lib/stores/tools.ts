import { get, writable } from 'svelte/store';
import { api } from '../api';
import { loadingStore } from './loading';
import { toastStore } from './toast';
import type { ToolDefinition, ToolInstance } from './types';

export type { ToolDefinition, ToolInstance };

const toolDefinitionsStore = writable<ToolDefinition[]>([]);

function createToolStore() {
  const tools = writable<ToolInstance[]>([]);

  return {
    subscribe: tools.subscribe,
    definitions: {
      subscribe: toolDefinitionsStore.subscribe,
    },

    async fetchDefinitions() {
      try {
        loadingStore.start('tools:definitions');
        const response = await api.getToolDefinitions();
        toolDefinitionsStore.set(response.data ?? []);
      } catch (error) {
        console.error('Failed to fetch tool definitions:', error);
        toastStore.error('Failed to load tool definitions');
      } finally {
        loadingStore.stop('tools:definitions');
      }
    },

    async fetchTools(agentId: string) {
      try {
        loadingStore.start(`tools:list:${agentId}`);
        const response = await api.getAgentTools(agentId);
        tools.set(response.data ?? []);
      } catch (error) {
        console.error('Failed to fetch tools:', error);
        toastStore.error('Failed to load tools');
        tools.set([]);
      } finally {
        loadingStore.stop(`tools:list:${agentId}`);
      }
    },

    async assign(agentId: string, key: string, parameters: Record<string, unknown> = {}) {
      try {
        loadingStore.start(`tools:assign:${agentId}:${key}`);
        const response = await api.assignTool(agentId, { key, parameters });
        if (response.data) {
          tools.update((items) => [...items, response.data!]);
          toastStore.success(`Assigned ${response.data!.name}`);
        }
      } catch (error) {
        console.error('Failed to assign tool:', error);
        toastStore.error('Failed to assign tool');
        throw error;
      } finally {
        loadingStore.stop(`tools:assign:${agentId}:${key}`);
      }
    },

    async remove(agentId: string, toolId: string) {
      try {
        loadingStore.start(`tools:delete:${toolId}`);
        await api.deleteTool(agentId, toolId);
        tools.update((items) => items.filter((item) => item.id !== toolId));
        toastStore.success('Removed tool');
      } catch (error) {
        console.error('Failed to remove tool:', error);
        toastStore.error('Failed to remove tool');
        throw error;
      } finally {
        loadingStore.stop(`tools:delete:${toolId}`);
      }
    },

    getById(toolId: string): ToolInstance | undefined {
      return get(tools).find((tool) => tool.id === toolId);
    },
  };
}

export const toolStore = createToolStore();
