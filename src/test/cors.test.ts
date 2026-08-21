import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getAllowedOrigins, isOriginAllowed } from '../lib/cors';
import { createApp } from '../app';

describe('isOriginAllowed', () => {
  it('permite requisição sem origin (curl/server-to-server)', () => {
    expect(isOriginAllowed(undefined, 'production')).toBe(true);
  });

  it('permite origem explicitamente listada', () => {
    expect(isOriginAllowed(
      'https://inovapro-theta.vercel.app',
      'production',
      'https://inovapro-theta.vercel.app',
    )).toBe(true);
  });

  it('nega origem antiga quando production aponta para outro APP_URL', () => {
    expect(isOriginAllowed(
      'https://inovapro-theta.vercel.app',
      'production',
      'https://app.example.com',
      '',
    )).toBe(false);
  });

  it('NEGA preview Vercel não listado explicitamente', () => {
    expect(isOriginAllowed('https://inovapro-pr-42.vercel.app', 'production')).toBe(false);
  });

  it('permite localhost somente fora de produção', () => {
    expect(isOriginAllowed('http://localhost:5173', 'development')).toBe(true);
    expect(isOriginAllowed('http://localhost:5173', 'production')).toBe(false);
    expect(isOriginAllowed(
      'http://localhost:5173',
      'production',
      'http://localhost:5173',
    )).toBe(false);
  });

  it('permite APP_URL e previews configurados como origens exatas', () => {
    expect(isOriginAllowed(
      'https://app.example.com',
      'production',
      'https://app.example.com',
    )).toBe(true);
    expect(isOriginAllowed(
      'https://inovapro-pr-42.vercel.app',
      'production',
      undefined,
      'https://inovapro-pr-42.vercel.app, https://staging.example.com',
    )).toBe(true);
  });

  it('não interpreta wildcard configurado', () => {
    expect(getAllowedOrigins('production', undefined, 'https://*.vercel.app'))
      .not.toContain('https://*.vercel.app');
    expect(isOriginAllowed(
      'https://inovapro-pr-42.vercel.app',
      'production',
      undefined,
      'https://*.vercel.app',
    )).toBe(false);
  });

  it('NEGA origem desconhecida em produção', () => {
    expect(isOriginAllowed('https://evil.example.com', 'production')).toBe(false);
  });

  it('NEGA origem desconhecida também fora de produção (sem vazar por padrão)', () => {
    expect(isOriginAllowed('https://evil.example.com', 'development')).toBe(false);
  });

  it('responde 403 sem refletir CORS a POST cross-origin no app completo', async () => {
    const response = await request(createApp())
      .post('/api/logout')
      .set('Cookie', 'token=victim-session')
      .set('Origin', 'https://evil.example.com')
      .set('Sec-Fetch-Site', 'cross-site');

    expect(response.status).toBe(403);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('nega preflight hostil sem refletir a origem', async () => {
    const response = await request(createApp())
      .options('/api/logout')
      .set('Origin', 'https://evil.example.com')
      .set('Access-Control-Request-Method', 'POST');

    expect(response.status).toBe(403);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('alcança CSRF no app completo quando Origin está ausente', async () => {
    const response = await request(createApp())
      .post('/api/logout')
      .set('Cookie', 'token=victim-session')
      .set('Sec-Fetch-Site', 'cross-site');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Origem da requisição não autorizada');
  });
});
