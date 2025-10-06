import { writable } from 'svelte/store';
import type { MentalFaculty } from './types';

export type { MentalFaculty } from './types';

function createFacultyStore() {
  const { subscribe, set, update } = writable<MentalFaculty[]>([]);

  return {
    subscribe,
    addFaculty: (faculty: MentalFaculty) => update(faculties => [...faculties, faculty]),
    updateFaculty: (faculty: MentalFaculty) => update(faculties =>
      faculties.map(f => f.id === faculty.id ? faculty : f)
    ),
    removeFaculty: (id: string) => update(faculties =>
      faculties.filter(f => f.id !== id)
    ),
    toggleActive: (id: string) => update(faculties =>
      faculties.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f)
    ),
    updateParameter: (facultyId: string, parameterId: string, value: number | boolean) => update(faculties =>
      faculties.map(f => f.id === facultyId ? {
        ...f,
        parameters: f.parameters.map(p => p.id === parameterId ? { ...p, value } : p)
      } : f)
    )
  };
}

export const facultyStore = createFacultyStore();