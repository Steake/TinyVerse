import { get, writable } from 'svelte/store';
import { api } from '../api';
import { loadingStore } from './loading';
import { toastStore } from './toast';
import type {
  FacultyParameter,
  MentalFaculty,
  MentalFacultyDefinition,
} from './types';

export type { MentalFaculty, MentalFacultyDefinition, FacultyParameter };

const facultyDefinitionsStore = writable<MentalFacultyDefinition[]>([]);

const parametersToRecord = (parameters: FacultyParameter[]): Record<string, unknown> =>
  parameters.reduce<Record<string, unknown>>((acc, parameter) => {
    acc[parameter.id] = parameter.value;
    return acc;
  }, {});

function createFacultyStore() {
  const faculties = writable<MentalFaculty[]>([]);

  return {
    subscribe: faculties.subscribe,

    definitions: {
      subscribe: facultyDefinitionsStore.subscribe,
    },

    async fetchDefinitions() {
      try {
        loadingStore.start('faculties:definitions');
        const response = await api.getFacultyDefinitions();
        if (response.data) {
          facultyDefinitionsStore.set(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch faculty definitions:', error);
        toastStore.error('Failed to load faculty definitions');
      } finally {
        loadingStore.stop('faculties:definitions');
      }
    },

    async fetchFaculties(agentId: string) {
      try {
        loadingStore.start(`faculties:list:${agentId}`);
        const response = await api.getAgentFaculties(agentId);
        faculties.set(response.data ?? []);
      } catch (error) {
        console.error('Failed to fetch faculties:', error);
        toastStore.error('Failed to load faculties');
        faculties.set([]);
      } finally {
        loadingStore.stop(`faculties:list:${agentId}`);
      }
    },

    async assign(agentId: string, key: string, parameters: Record<string, unknown> = {}, activate = true) {
      try {
        loadingStore.start(`faculties:assign:${agentId}:${key}`);
        const response = await api.assignFaculty(agentId, { key, parameters, activate });
        if (response.data) {
          faculties.update((items) => [...items, response.data!]);
          toastStore.success(`Assigned ${response.data!.name}`);
        }
      } catch (error) {
        console.error('Failed to assign faculty:', error);
        toastStore.error('Failed to assign faculty');
        throw error;
      } finally {
        loadingStore.stop(`faculties:assign:${agentId}:${key}`);
      }
    },

    async updateFaculty(agentId: string, facultyId: string, options: { parameters?: FacultyParameter[]; activate?: boolean }) {
      try {
        loadingStore.start(`faculties:update:${facultyId}`);
        const response = await api.updateFaculty(agentId, facultyId, {
          parameters: options.parameters ? parametersToRecord(options.parameters) : undefined,
          activate: options.activate,
        });
        if (response.data) {
          faculties.update((items) =>
            items.map((item) => (item.id === facultyId ? response.data! : item)),
          );
        }
      } catch (error) {
        console.error('Failed to update faculty:', error);
        toastStore.error('Failed to update faculty');
        throw error;
      } finally {
        loadingStore.stop(`faculties:update:${facultyId}`);
      }
    },

    async toggleActive(agentId: string, faculty: MentalFaculty) {
      await this.updateFaculty(agentId, faculty.id, { activate: !faculty.is_active });
    },

    async updateParameter(agentId: string, facultyId: string, parameterId: string, value: unknown) {
      const current = get(faculties);
      const faculty = current.find((item) => item.id === facultyId);
      if (!faculty) {
        return;
      }

      const parameters = faculty.parameters.map((parameter) =>
        parameter.id === parameterId ? { ...parameter, value } : parameter,
      );

      await this.updateFaculty(agentId, facultyId, { parameters });
    },

    async remove(agentId: string, facultyId: string) {
      try {
        loadingStore.start(`faculties:delete:${facultyId}`);
        await api.deleteFaculty(agentId, facultyId);
        faculties.update((items) => items.filter((item) => item.id !== facultyId));
        toastStore.success('Removed faculty');
      } catch (error) {
        console.error('Failed to remove faculty:', error);
        toastStore.error('Failed to remove faculty');
        throw error;
      } finally {
        loadingStore.stop(`faculties:delete:${facultyId}`);
      }
    },
  };
}

export const facultyStore = createFacultyStore();
