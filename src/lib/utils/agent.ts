import type { Agent } from '../stores/agents';

export function createNewAgent(): Partial<Agent> {
  return {
    name: '',
    age: 25,
    occupation: '',
    occupation_description: '',
    nationality: '',
    country_of_residence: '',
    personality_traits: [],
    professional_interests: [],
    personal_interests: [],
    skills: [],
    backstory: '',
    routines: [],
    relationships: [],
    emoji: '👤'
  };
}