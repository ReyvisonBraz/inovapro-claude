import type { Prisma } from '@prisma/client';
import type { AuthRequest } from '../middleware/auth.js';

const SENSITIVE_PARTS = ['password', 'senha', 'token', 'secret', 'authorization', 'base64', 'photo', 'cpf'];

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 3) return '[TRUNCATED]';
  if (Array.isArray(value)) return value.slice(0, 20).map(item => sanitize(item, depth + 1));
  if (!value || typeof value !== 'object') {
    return typeof value === 'string' && value.length > 500 ? `${value.slice(0, 500)}…` : value;
  }

  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
    key,
    SENSITIVE_PARTS.some(part => key.toLowerCase().includes(part)) ? '[REDACTED]' : sanitize(entry, depth + 1),
  ]));
}

export async function writeAudit(
  req: AuthRequest,
  action: 'create' | 'update' | 'delete' | 'payment' | 'stock-adjust' | 'settings-update',
  entity: string,
  entityId?: number,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    const { prisma } = await import('./prisma.js');
    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId,
        action,
        entity,
        entityId,
        details: JSON.stringify(sanitize({
          ...details,
          requestId: req.requestId,
          route: req.originalUrl,
        })),
      },
    });
  } catch (error) {
    // Auditoria nunca deve transformar uma operação já concluída em falso erro.
    console.error('[AUDIT] Falha ao persistir evento', { action, entity, entityId, error });
  }
}

export function sanitizeDiagnosticDetails(value: unknown): Prisma.InputJsonValue {
  return sanitize(value) as Prisma.InputJsonValue;
}
