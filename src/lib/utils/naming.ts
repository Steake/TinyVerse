export function canonicalNameKey(name: string | undefined | null): string {
  if (!name) return '';
  return name.trim().toLowerCase();
}

export function ensureUniqueName(
  desiredName: string,
  occupied: Set<string>,
  options?: { fallback?: string; separator?: string }
): string {
  const trimmed = desiredName?.toString().trim();
  const fallback = options?.fallback ?? 'Entity';
  const separator = options?.separator ?? ' ';

  const base = trimmed && trimmed.length > 0 ? trimmed : fallback;
  let candidate = base;
  let key = canonicalNameKey(candidate);
  let counter = 2;

  while (key && occupied.has(key)) {
    candidate = `${base}${separator}(${counter})`;
    key = canonicalNameKey(candidate);
    counter += 1;
  }

  if (key) {
    occupied.add(key);
  }

  return candidate;
}

export function buildOccupiedNameSet(names: Array<string | undefined | null>): Set<string> {
  const set = new Set<string>();
  for (const name of names) {
    const key = canonicalNameKey(name);
    if (key) {
      set.add(key);
    }
  }
  return set;
}
