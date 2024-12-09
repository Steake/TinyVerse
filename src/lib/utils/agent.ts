import type { Agent } from '../stores/agents';

export function createNewAgent(): Partial<Agent> {
  return {
    id: crypto.randomUUID(),
    name: '',
    age: 25,
    occupation: '',
    occupationDescription: '',
    nationality: '',
    countryOfResidence: '',
    routines: [],
    personalityTraits: [],
    professionalInterests: [],
    personalInterests: [],
    skills: [],
    relationships: [],
    backstory: '',
    emoji: '👤'
  };
}