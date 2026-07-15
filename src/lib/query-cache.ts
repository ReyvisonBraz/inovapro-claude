type CacheRecord = Record<string, unknown> & { id?: number };

interface PaginatedCache {
  data: CacheRecord[];
  meta?: Record<string, unknown> & { total?: number };
  [key: string]: unknown;
}

export function mergeSavedRecord(
  submitted: unknown,
  response: unknown,
  fallbackId?: number,
): CacheRecord | null {
  if (!submitted || typeof submitted !== 'object') return null;

  const responseRecord = response && typeof response === 'object'
    ? response as Record<string, unknown>
    : {};
  const returnedRecord = responseRecord.data && typeof responseRecord.data === 'object'
    ? responseRecord.data as Record<string, unknown>
    : responseRecord;
  const submittedRecord = submitted as Record<string, unknown>;
  const id = Number(returnedRecord.id ?? fallbackId ?? submittedRecord.id);

  if (!Number.isFinite(id) || id <= 0) return null;

  const saved = {
    ...submittedRecord,
    ...returnedRecord,
    id,
  } as CacheRecord;

  return saved;
}

export function upsertCachedRecord(
  current: unknown,
  saved: CacheRecord | null,
  prepend = true,
): unknown {
  if (!saved?.id || current == null) return current;

  const upsert = (records: CacheRecord[]) => {
    const existingIndex = records.findIndex(record => record.id === saved.id);
    if (existingIndex >= 0) {
      return records.map((record, index) => index === existingIndex ? { ...record, ...saved } : record);
    }
    return prepend ? [saved, ...records] : [...records, saved];
  };

  if (Array.isArray(current)) return upsert(current as CacheRecord[]);

  if (typeof current === 'object' && Array.isArray((current as PaginatedCache).data)) {
    const cache = current as PaginatedCache;
    const existed = cache.data.some(record => record.id === saved.id);
    return {
      ...cache,
      data: upsert(cache.data),
      meta: cache.meta
        ? { ...cache.meta, total: existed ? cache.meta.total : Number(cache.meta.total ?? cache.data.length) + 1 }
        : cache.meta,
    };
  }

  return current;
}
