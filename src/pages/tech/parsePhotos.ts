export function parsePhotos(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((p: string | { base64: string }) =>
      typeof p === 'string' ? p : p.base64
    );
  }
  try {
    const arr = raw ? JSON.parse(raw as string) : [];
    return arr.map((p: string | { base64: string }) =>
      typeof p === 'string' ? p : p.base64
    );
  } catch { return []; }
}