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

/** Remove um registro da lista exibida imediatamente após uma exclusão confirmada. */
export function removeCachedRecord(current: unknown, id: number): unknown {
  if (current == null) return current;

  if (Array.isArray(current)) {
    return current.filter(record => record.id !== id);
  }

  if (typeof current !== 'object' || !Array.isArray((current as PaginatedCache).data)) {
    return current;
  }

  const cache = current as PaginatedCache;
  const removed = cache.data.find(record => record.id === id);
  if (!removed) return current;

  const nextMeta: Record<string, unknown> | undefined = cache.meta
    ? { ...cache.meta, total: Math.max(0, Number(cache.meta.total ?? cache.data.length) - 1) }
    : cache.meta;

  const status = typeof removed.status === 'string' ? removed.status : undefined;
  const statusCounts = nextMeta?.statusCounts;
  if (status && statusCounts && typeof statusCounts === 'object' && !Array.isArray(statusCounts)) {
    const counts = statusCounts as Record<string, unknown>;
    nextMeta.statusCounts = {
      ...counts,
      [status]: Math.max(0, Number(counts[status] ?? 0) - 1),
    };
  }

  return {
    ...cache,
    data: cache.data.filter(record => record.id !== id),
    meta: nextMeta,
  };
}

/**
 * Adia a invalidação de queries após uma escrita. Refetch imediato pode
 * capturar um snapshot anterior à propagação do commit no pooler do Supabase
 * (leitura-após-escrita) e sobrescrever o upsert otimista que acabamos de
 * aplicar — o registro recém-criado/removido some até um F5. O upsert otimista
 * já reflete o dado na hora; esta invalidação adiada apenas reconcilia
 * ordenação/contagens em background depois que o banco alcança consistência.
 */
export function scheduleInvalidate(
  queryClient: { invalidateQueries: (options: { queryKey: string[] }) => unknown },
  key: string | string[],
  delay = 8000,
): void {
  const queryKey = Array.isArray(key) ? key : [key];
  setTimeout(() => queryClient.invalidateQueries({ queryKey }), delay);
}
