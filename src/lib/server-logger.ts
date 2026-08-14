import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';
import { sanitizeDiagnosticDetails } from './audit.js';

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

/**
 * Descreve um erro para registro persistido/visualização.
 *
 * Além de nome/mensagem, captura o `code` (ex.: P2002 do Prisma) e a cadeia de
 * causas (`cause chain`) — útil quando um erro envolve outro (Prisma -> driver ->
 * rede/banco). É isso que explica o "porquê" de uma falha, não só a mensagem final.
 */
function describeError(err: unknown, causeDepth = 3): Record<string, unknown> {
  if (!(err instanceof Error)) return { raw: String(err) };

  const description: Record<string, unknown> = { name: err.name, message: err.message };
  const code = (err as Error & { code?: unknown }).code;
  if (typeof code === 'string' && code) description.code = code;

  const causes: Array<{ name: string; message: string }> = [];
  let current: unknown = err;
  for (let depth = 0; depth < causeDepth; depth++) {
    const cause = (current as Error & { cause?: unknown }).cause;
    if (!(cause instanceof Error)) break;
    causes.push({ name: cause.name, message: cause.message });
    current = cause;
  }
  if (causes.length > 0) description.cause = causes;

  return description;
}

export function error(message: string, err?: unknown, meta?: Partial<ServerLogEntry>): void {
  const stack = err instanceof Error ? err.stack : undefined;
  const details = describeError(err);

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

export async function persistFatalError(message: string, err: unknown): Promise<void> {
  try {
    const { prisma } = await import('./prisma.js');
    await prisma.systemError.create({
      data: {
        source: 'server',
        severity: 'critical',
        operation: 'process.fatal',
        message,
        stack: err instanceof Error ? err.stack?.slice(0, 20_000) : undefined,
        details: sanitizeDiagnosticDetails({ reason: err instanceof Error ? err.message : String(err) }),
      },
    });
  } catch (persistenceError) {
    console.error('[OBSERVABILITY] Falha ao persistir erro fatal', persistenceError);
  }
}

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const requestId = randomUUID().slice(0, 8);
  (req as Request & { requestId?: string }).requestId = requestId;
  const startedAt = Date.now();
  _res.setHeader('X-Request-Id', requestId);
  _res.on('finish', () => info(`${req.method} ${req.path}`, {
    requestId,
    route: req.path,
    method: req.method,
    statusCode: _res.statusCode,
    duration: Date.now() - startedAt,
  }));
  next();
}

export async function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): Promise<void> {
  const requestId = (req as Request & { requestId?: string }).requestId || randomUUID().slice(0, 8);
  const userId = (req as any).user?.userId;
  const username = (req as any).user?.username;

  const statusCode = (err as any).statusCode || 500;
  const isAppError = err instanceof AppError;

  error(err.message, err, {
    requestId,
    route: req.path,
    method: req.method,
    userId,
    username,
    statusCode,
    details: {
      body: sanitizeBody(req.body),
      query: req.query as Record<string, unknown>,
      params: req.params,
    },
  });

  if (statusCode >= 500 || statusCode === 409) {
    try {
      const { prisma } = await import('./prisma.js');
      await prisma.systemError.create({
        data: {
          source: 'server',
          severity: statusCode >= 500 ? 'critical' : 'error',
          operation: `${req.method.toLowerCase()} ${req.path}`,
          message: err.message,
          requestId,
          route: req.originalUrl,
          method: req.method,
          userId,
          username,
          statusCode,
          stack: err.stack?.slice(0, 20_000),
          details: sanitizeDiagnosticDetails({
            description: describeError(err),
            body: req.body,
            query: req.query,
            params: req.params,
          }),
        },
      });
    } catch (persistenceError) {
      console.error('[OBSERVABILITY] Falha ao persistir erro', persistenceError);
    }
  }

  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' && !isAppError
      ? 'Erro interno do servidor'
      : err.message,
    requestId,
  });
}

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const sensitiveKeys = ['password', 'senha', 'token', 'authorization', 'secret', 'key', 'base64', 'photo', 'cpf'];
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    sanitized[key] = sensitiveKeys.some(sk => key.toLowerCase().includes(sk))
      ? '[REDACTED]'
      : value;
  }
  return sanitized;
}
