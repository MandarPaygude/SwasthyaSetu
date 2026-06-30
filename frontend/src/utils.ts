function isTranslationKey(value: string): boolean {
  return value.includes('.') && isNaN(Number(value));
}

function cleanString(value: string): string {
  if (isTranslationKey(value)) {
    return value.split('.').pop()!;
  }
  return value;
}

function cleanJson(value: string): string {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) || (parsed && typeof parsed === 'object')) {
      return JSON.stringify(cleanValue(parsed));
    }
  } catch {}
  return value;
}

export function cleanValue(value: unknown): unknown {
  if (typeof value === 'string') {
    if ((value.startsWith('[') || value.startsWith('{'))) {
      return cleanJson(value);
    }
    return cleanString(value);
  }
  if (Array.isArray(value)) {
    return value.map(cleanValue);
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = cleanValue(v);
    }
    return result;
  }
  return value;
}
