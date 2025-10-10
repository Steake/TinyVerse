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
    return jsonrepair(unwrapped);
  } catch (error) {
    console.warn('Failed to repair JSON payload', error);
    return unwrapped;
  }
}

export function parseJson<T>(input: any): T | undefined {
  if (input === undefined || input === null) return undefined;
  if (typeof input === 'string') {
    try {
      const normalized = normalizeJsonInput(input);
      return JSON.parse(normalized) as T;
    } catch (error) {
      console.warn('Failed to parse JSON payload', error);
      return undefined;
    }
  }
  return input as T;
}
