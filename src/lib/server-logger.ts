import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface ServerLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  route?: string;
  method?: string;
  userId?: number;
  username?: string;
  requestId?: string;
  statusCode?: number;
  duration?: number;
  stack?: string;
  details?: Record<string, unknown>;
}

const MAX_LOG_ENTRIES = 5000;
const logs: ServerLogEntry[] = [];
const ERROR_RETENTION = 500;

function addEntry(entry: ServerLogEntry): void {
  logs.push(entry);
  if (logs.length > MAX_LOG_ENTRIES) {
    logs.splice(0, logs.length - ERROR_RETENTION);
  }
}

export function info(message: string, meta?: Partial<ServerLogEntry>): void {
  const entry: ServerLogEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    level: 'info',
    message,
    ...meta,
  };
  addEntry(entry);
  console.log(`[INFO] [${entry.requestId || '-'}] ${message}`);
}

export function warn(message: string, meta?: Partial<ServerLogEntry>): void {
  const entry: ServerLogEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    level: 'warn',
    message,
    ...meta,
  };
  addEntry(entry);
  console.warn(`[WARN] [${entry.requestId || '-'}] ${message}${meta?.details ? ' ' + JSON.stringify(meta.details) : ''}`);
}

export function error(message: string, err?: unknown, meta?: Partial<ServerLogEntry>): void {
  const stack = err instanceof Error ? err.stack : undefined;
  const details = err instanceof Error
    ? { name: err.name, message: err.message }
    : { raw: String(err) };

  const entry: ServerLogEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    level: 'error',
    message,
    stack,
    details: { ...details, ...(meta?.details as Record<string, unknown>) },
    ...meta,
  };
  addEntry(entry);
  console.error(`[ERROR] [${entry.requestId || '-'}] ${message}`, err || '');
}

export function debug(message: string, meta?: Partial<ServerLogEntry>): void {
  if (process.env.NODE_ENV === 'production') return;
  const entry: ServerLogEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    level: 'debug',
    message,
    ...meta,
  };
  addEntry(entry);
  console.debug(`[DEBUG] [${entry.requestId || '-'}] ${message}`);
}

export function getLogs(level?: LogLevel, limit = 200): ServerLogEntry[] {
  const filtered = level ? logs.filter(l => l.level === level) : logs;
  return filtered.slice(-limit).reverse();
}

export function getErrors(limit = 100): ServerLogEntry[] {
  return getLogs('error', limit);
}

export function clearLogs(): void {
  logs.length = 0;
}

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const requestId = randomUUID().slice(0, 8);
  (req as any).requestId = requestId;
  info(`${req.method} ${req.path}`, {
    requestId,
    route: req.path,
    method: req.method,
  });
  next();
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = (req as any).requestId || randomUUID().slice(0, 8);
  const userId = (req as any).user?.userId;
  const username = (req as any).user?.username;

  error(err.message, err, {
    requestId,
    route: req.path,
    method: req.method,
    userId,
    username,
    statusCode: 500,
    details: {
      body: sanitizeBody(req.body),
      query: req.query as Record<string, unknown>,
      params: req.params,
    },
  });

  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : err.message,
    requestId,
  });
}

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'key'];
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    sanitized[key] = sensitiveKeys.some(sk => key.toLowerCase().includes(sk))
      ? '[REDACTED]'
      : value;
  }
  return sanitized;
}
