export function parseQueryParam(
  value: unknown,
  defaultValue?: string
): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  return defaultValue;
}

export function parseQueryInt(
  value: unknown,
  defaultValue?: number
): number | undefined {
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return defaultValue;
}

export function parseQueryFloat(
  value: unknown,
  defaultValue?: number
): number | undefined {
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
  }
  return defaultValue;
}

export function parseQueryBool(
  value: unknown,
  defaultValue?: boolean
): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

export function parseQueryEnum<T extends string>(
  value: unknown,
  validValues: readonly T[],
  defaultValue?: T
): T | undefined {
  if (typeof value === 'string' && validValues.includes(value as T)) {
    return value as T;
  }
  return defaultValue;
}
