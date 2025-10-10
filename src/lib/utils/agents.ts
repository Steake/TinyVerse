import type { Agent } from '../stores/agents';
import { createNewAgent } from './agent';

function coerceStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? '').trim())
      .filter((item) => item.length > 0);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
      .split(/[,;\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeSkills(value: unknown): { name: string; level: number }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        const name = entry.trim();
        return name ? { name, level: 3 } : null;
      }
      if (!entry || typeof entry !== 'object') return null;
      const name = 'name' in entry ? String((entry as any).name ?? '').trim() : '';
      if (!name) return null;
      const levelValue = Number((entry as any).level);
      const level = Number.isFinite(levelValue) ? Math.max(1, Math.min(5, Math.round(levelValue))) : 3;
      return { name, level };
    })
    .filter((entry): entry is { name: string; level: number } => Boolean(entry));
}

function coerceNumber(value: unknown, fallback: number): number {
  const candidate = Number(value);
  if (Number.isFinite(candidate)) {
    return Math.max(0, Math.round(candidate));
  }
  return fallback;
}

export function normalizeAgentPayload(payload: any): Omit<Agent, 'id' | 'created_at'> {
  const template = createNewAgent();

  const raw = payload?.data ?? payload;
  const agent: Omit<Agent, 'id' | 'created_at'> = {
    name: String(raw?.name ?? template.name ?? '').trim(),
    age: coerceNumber(raw?.age, coerceNumber(template.age, 30)),
    occupation: String(raw?.occupation ?? template.occupation ?? '').trim() || 'Specialist',
    occupation_description: String(raw?.occupation_description ?? template.occupation_description ?? ''),
    nationality: String(raw?.nationality ?? template.nationality ?? ''),
    country_of_residence: String(raw?.country_of_residence ?? template.country_of_residence ?? ''),
    personality_traits: coerceStringArray(raw?.personality_traits ?? template.personality_traits),
    professional_interests: coerceStringArray(raw?.professional_interests ?? template.professional_interests),
    personal_interests: coerceStringArray(raw?.personal_interests ?? template.personal_interests),
    skills: normalizeSkills(raw?.skills ?? template.skills),
    backstory: String(raw?.backstory ?? raw?.backstory_html ?? template.backstory ?? ''),
    routines: Array.isArray(raw?.routines) ? raw.routines : (template.routines ?? []),
    relationships: Array.isArray(raw?.relationships) ? raw.relationships : (template.relationships ?? []),
    emoji: String(raw?.emoji ?? template.emoji ?? '👤'),
    group: raw?.group ?? template.group ?? null,
    profilePicture: raw?.profilePicture ?? template.profilePicture
  };

  return agent;
}
