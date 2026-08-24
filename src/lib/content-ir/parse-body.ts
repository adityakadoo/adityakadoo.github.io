export function parseKeyValues(text: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    const colon = line.indexOf(':');
    let split = -1;
    if (eq === -1) split = colon;
    else if (colon === -1) split = eq;
    else split = Math.min(eq, colon);
    if (split <= 0) continue;
    const key = line.slice(0, split).trim();
    let value = line.slice(split + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    props[key] = value;
  }
  return props;
}

export function parseMeta(meta?: string): Record<string, string> {
  if (!meta?.trim()) return {};
  const props: Record<string, string> = {};
  const tokenRe = /([a-zA-Z_][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  for (const match of meta.matchAll(tokenRe)) {
    props[match[1]] = match[2] ?? match[3] ?? match[4] ?? 'true';
  }
  return props;
}

export function parseBlockBody(value: string): {
  props: Record<string, string>;
  json: unknown | undefined;
} {
  const trimmed = value.trim();
  if (!trimmed) return { props: {}, json: undefined };
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const json = JSON.parse(trimmed) as unknown;
      if (json && typeof json === 'object' && !Array.isArray(json)) {
        const props: Record<string, string> = {};
        for (const [key, val] of Object.entries(json as Record<string, unknown>)) {
          if (val == null || typeof val === 'object') continue;
          props[key] = String(val);
        }
        return { props, json };
      }
      return { props: {}, json };
    } catch {
      return { props: parseKeyValues(trimmed), json: undefined };
    }
  }
  return { props: parseKeyValues(trimmed), json: undefined };
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function asString(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  return String(value);
}
