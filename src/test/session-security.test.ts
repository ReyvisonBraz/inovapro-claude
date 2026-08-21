import { describe, expect, it } from 'vitest';
import { getSessionCookieOptions } from '../lib/session-security';

describe('cookies de sessão', () => {
  it('usa SameSite=Lax e Secure em produção same-origin', () => {
    expect(getSessionCookieOptions('production')).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  });

  it('mantém SameSite=Lax sem Secure no desenvolvimento HTTP', () => {
    expect(getSessionCookieOptions('development')).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
  });
});
