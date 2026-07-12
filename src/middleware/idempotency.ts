import { Request, Response, NextFunction } from 'express';

const idempotencyStore = new Map<string, { status: number; body: unknown; timestamp: number }>();

const TTL_MS = 24 * 60 * 60 * 1000;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of idempotencyStore) {
    if (now - entry.timestamp > TTL_MS) {
      idempotencyStore.delete(key);
    }
  }
}

setInterval(cleanup, 60 * 60 * 1000);

export function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'POST') return next();

  const key = req.headers['x-idempotency-key'] as string | undefined;
  if (!key) return next();

  const existing = idempotencyStore.get(key);
  if (existing) {
    res.status(existing.status).json(existing.body);
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyStore.set(key, {
        status: res.statusCode,
        body,
        timestamp: Date.now(),
      });
    }
    return originalJson(body);
  }) as typeof res.json;

  next();
}
