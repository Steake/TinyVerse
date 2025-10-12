import { writable, get } from 'svelte/store';
import { api } from '../api';
import type { AutofillRequestPayload, AutofillResponsePayload } from '../api/types';
import { buildPromptForScope } from './prompts';
import { tokenUsage } from './tokenUsage';

// Rough estimate: ~4 chars per token (typical for English)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function trackTokenUsage(prompt: string, response: any) {
  const promptTokens = estimateTokens(prompt);
  const responseStr = JSON.stringify(response);
  const completionTokens = estimateTokens(responseStr);
  tokenUsage.addUsage(promptTokens, completionTokens);
}

export type AutofillScope = 'agent' | 'location' | 'environment' | 'story' | 'generic';

export interface AutofillState {
  isApplying: boolean;
  error?: string;
  lastResults: Partial<Record<AutofillScope | 'simulation', AutofillResponsePayload | Record<string, unknown>>>;
  batchCounts: Partial<Record<AutofillScope, number>>;
}

const initial: AutofillState = {
  isApplying: false,
  lastResults: {},
  batchCounts: { agent: 1, location: 1 },
};

export const autofillStore = writable<AutofillState>(initial);

export function setBatchCount(scope: AutofillScope, count: number) {
  const safe = Math.max(1, Math.min(10, Math.round(count)));
  autofillStore.update((state) => ({
    ...state,
    batchCounts: { ...state.batchCounts, [scope]: safe }
  }));
}

// Field mapping per scope: maps backend model to UI field names
export const fieldMaps: Record<AutofillScope, Record<string, string>> = {
  agent: {
    name: 'name',
    age: 'age',
    occupation: 'occupation',
    occupation_description: 'occupation_description',
    nationality: 'nationality',
    country_of_residence: 'country_of_residence',
    personality_traits: 'personality_traits',
    professional_interests: 'professional_interests',
    personal_interests: 'personal_interests',
    skills: 'skills',
    backstory: 'backstory',
    backstory_html: 'backstory',
    // common synonyms from LLMs/backends
    background: 'backstory',
    biography: 'backstory',
    bio: 'backstory',
    emoji: 'emoji',
  },
  location: {
    name: 'name',
    description: 'description',
    type: 'type',
  },
  environment: {},
  story: {},
  generic: {},
};

function coerceToJson(payload: unknown): any {
  if (payload === undefined || payload === null) return undefined;
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (error) {
      console.warn('Unable to parse autofill payload as JSON', error);
      return undefined;
    }
  }
  return payload;
}

function normalizeAutofillItems(raw: any): any[] {
  if (raw === undefined || raw === null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object') {
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.form && raw.data) return [raw];
    const values = Object.values(raw);
    if (values.every((value) => typeof value !== 'function')) {
      return values;
    }
  }
  return [raw];
}

export async function runGlobalAutofill(
  scope: AutofillScope,
  seed?: Record<string, unknown>,
  options?: { overridePrompt?: string; count?: number }
): Promise<(AutofillResponsePayload | Record<string, unknown>)[] | (AutofillResponsePayload | Record<string, unknown>) | undefined> {
  const state = get(autofillStore);
  const requestedCount = options?.count ?? state.batchCounts[scope] ?? 1;
  const scopeName = scope === 'agent' ? 'agents' : scope === 'location' ? 'locations' : 'entities';

  autofillStore.update((s) => ({ ...s, isApplying: true, error: undefined }));

  try {
    const basePrompt = options?.overridePrompt?.trim().length
      ? options.overridePrompt.trim()
      : buildPromptForScope(scope, seed);

    const instructionSegments = [
      `You are TinyVerse's structured generator for ${scopeName}.`,
      requestedCount > 1
        ? `Return strict JSON with a top-level array named "items" containing exactly ${requestedCount} ${scopeName}.`
        : 'Return strict JSON for a single entity.',
      'Every entity must include all fields referenced in the blueprint. Do not add commentary.'
    ];

    const context = [instructionSegments.join('\n'), basePrompt].filter(Boolean).join('\n\n');

    const payload: AutofillRequestPayload = {
      form: scope === 'agent' || scope === 'location' ? scope : 'agent',
      context,
      seed,
    } as AutofillRequestPayload;

    const res = await api.autofill(payload);
    
    // Track estimated token usage
    trackTokenUsage(context, res);
    
    const parsed = coerceToJson(res.data ?? res);
    const items = normalizeAutofillItems(parsed);

    if (!items.length) {
      throw new Error('No autofill items returned');
    }

    if (requestedCount > 1 && items.length !== requestedCount) {
      console.warn(`Expected ${requestedCount} ${scopeName}, received ${items.length}.`);
    }

    const lastResult = items[items.length - 1];
    autofillStore.update((s) => ({
      ...s,
      lastResults: { ...s.lastResults, [scope]: lastResult }
    }));

    return requestedCount === 1 ? items[0] : items;
  } catch (err: any) {
    const msg = err?.message ?? 'Autofill failed';
    autofillStore.update((s) => ({ ...s, error: msg }));
  } finally {
    autofillStore.update((s) => ({ ...s, isApplying: false }));
  }
}

export function applyFields<T extends Record<string, any>>(target: T, scope: AutofillScope, result: any): T {
  if (!result) return target;
  const data = result?.data ?? result; // handle {form, data} or plain
  const map = fieldMaps[scope] || {};
  const merged: T = { ...target };
  for (const [k, v] of Object.entries(data)) {
    const key = map[k] || k;
    // Shallow assign; callers can postprocess arrays/objects
    (merged as any)[key] = v;
  }
  return merged;
}

// Helper to extract a single field's value from a response, trying scope-specific
// mappings and common synonyms when needed.
function resolveFieldValue(scope: AutofillScope, field: string, payload: any) {
  const data = payload?.data ?? payload ?? {};
  // 1) exact match
  if (field in data) return data[field];
  // 2) scope map reverse lookup: find any backend key that maps to this UI field
  const map = fieldMaps[scope] || {};
  const candidates: string[] = [];
  for (const [backendKey, uiKey] of Object.entries(map)) {
    if (uiKey === field) candidates.push(backendKey);
  }
  for (const k of candidates) {
    if (k in data) return (data as any)[k];
  }
  // 3) special-case synonyms for common fields
  const synonymSets: Record<string, string[]> = {
    backstory: ['background', 'biography', 'bio', 'backstory_html'],
    age: ['years', 'years_old'],
    name: ['full_name', 'display_name'],
    occupation_description: ['role_description', 'job_description'],
  };
  const syns = synonymSets[field] || [];
  for (const k of syns) {
    if (k in data) return (data as any)[k];
  }
  // 4) Fallback: if only one key was returned, use its value
  const keys = Object.keys(data);
  if (keys.length === 1) return (data as any)[keys[0]];
  return undefined;
}

// Generate a single field value using the global prompt if present, else backend fallback.
export async function runFieldAutofill(
  scope: AutofillScope,
  field: string,
  seed?: Record<string, unknown>,
  overridePrompt?: string
): Promise<any> {
  const top = (overridePrompt ?? buildPromptForScope(scope, seed)).trim();
  const singleFieldInstruction = `Return strict JSON with exactly one key: \"${field}\". Do not include any other keys.`;
  const seedLine = seed && Object.keys(seed).length ? `Use these hints: ${JSON.stringify(seed)}` : '';

  // Prefer the global pipeline context for consistency
  if (top) {
    const prompt = [
      `You are TinyVerse's structured UI filler.`,
      `Task: Populate the field \"${field}\" for ${scope}. Use concise, realistic values. Avoid placeholders.`,
      singleFieldInstruction,
      seedLine,
      `User goal: ${top}`,
    ].filter(Boolean).join('\n');

    const res = await api.autofill({
      form: scope === 'agent' || scope === 'location' ? scope : 'agent',
      context: prompt,
      seed,
    } as AutofillRequestPayload);
    return resolveFieldValue(scope, field, res.data);
  }

  // Fallback to a tighter backend prompt
  const base = scope === 'agent' ? 'Agent' : scope === 'location' ? 'Location' : 'Entity';
  const context = `${base} field: ${field}. ${singleFieldInstruction}`;
  const res = await api.autofill({ form: scope === 'agent' || scope === 'location' ? scope : 'agent', context, seed } as AutofillRequestPayload);
  return resolveFieldValue(scope, field, res.data);
}
