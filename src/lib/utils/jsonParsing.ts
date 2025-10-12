import { jsonrepair } from 'jsonrepair';

export function unwrapCodeFence(value: string): string {
  const trimmed = value.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?[ \t]*\n([\s\S]*?)\n```$/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  return trimmed;
}

export function normalizeJsonInput(raw: string): string {
  const unwrapped = unwrapCodeFence(raw);
  try {
    const repaired = jsonrepair(unwrapped);
    return repaired;
  } catch (error) {
    console.warn('[jsonParsing] Failed to repair JSON:', error);
    return unwrapped;
  }
}

export function parseJson<T>(input: any): T | undefined {
  if (input === undefined || input === null) return undefined;
  
  // If already an object, return as-is
  if (typeof input === 'object') {
    return input as T;
  }
  
  if (typeof input === 'string') {
    try {
      const normalized = normalizeJsonInput(input);
      const parsed = JSON.parse(normalized) as T;
      return parsed;
    } catch (error) {
      console.warn('[jsonParsing] Failed to parse:', error);
      return undefined;
    }
  }
  
  return input as T;
}
