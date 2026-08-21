import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../lib/errors.js';
import { isOriginAllowed } from '../lib/cors.js';
import { SESSION_COOKIES } from '../lib/session-security.js';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

interface CsrfProtectionOptions {
  nodeEnv?: string;
  appUrl?: string;
  additionalOrigins?: string;
}

function hasSessionCookie(req: Request): boolean {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  return Boolean(cookies?.[SESSION_COOKIES.access] || cookies?.[SESSION_COOKIES.refresh]);
}

function reject(next: NextFunction): void {
  next(new AppError('Origem da requisição não autorizada', 403));
}

/**
 * Defesa CSRF para comandos autenticados por cookie.
 *
 * - Origin, quando presente, precisa pertencer à allowlist exata do CORS.
 * - Sec-Fetch-Site=cross-site é bloqueado mesmo sem Origin.
 * - Sem Origin, somente Sec-Fetch-Site=same-origin é aceito.
 * - Bearer-only não depende de cookie e não precisa desta proteção CSRF.
 */
export function createCsrfProtection(options: CsrfProtectionOptions = {}): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!MUTATING_METHODS.has(req.method) || !hasSessionCookie(req)) {
      next();
      return;
    }

    const fetchSite = req.get('Sec-Fetch-Site')?.toLowerCase();
    if (fetchSite === 'cross-site') {
      reject(next);
      return;
    }

    const origin = req.get('Origin');
    if (origin) {
      if (isOriginAllowed(
        origin,
        options.nodeEnv,
        options.appUrl,
        options.additionalOrigins,
      )) {
        next();
        return;
      }

      reject(next);
      return;
    }

    if (fetchSite === 'same-origin') {
      next();
      return;
    }

    reject(next);
  };
}

export const csrfProtection = createCsrfProtection();
