import type { CookieOptions } from 'express';

export const SESSION_COOKIES = {
  access: 'token',
  refresh: 'refreshToken',
} as const;

/**
 * Frontend e API compartilham o mesmo site. SameSite=Lax bloqueia o envio dos
 * cookies em POSTs cross-site, enquanto Secure permanece obrigatório em prod.
 */
export function getSessionCookieOptions(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): CookieOptions {
  return {
    httpOnly: true,
    secure: nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
  };
}
