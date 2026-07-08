import { describe, it, expect } from 'vitest';
import { isOriginAllowed } from '../lib/cors';

describe('isOriginAllowed', () => {
  it('permite requisição sem origin (curl/server-to-server)', () => {
    expect(isOriginAllowed(undefined, 'production')).toBe(true);
  });

  it('permite origem explicitamente listada', () => {
    expect(isOriginAllowed('https://inovapro-theta.vercel.app', 'production')).toBe(true);
  });

  it('permite qualquer subdomínio *.vercel.app', () => {
    expect(isOriginAllowed('https://inovapro-pr-42.vercel.app', 'production')).toBe(true);
  });

  it('permite localhost de desenvolvimento', () => {
    expect(isOriginAllowed('http://localhost:5173', 'production')).toBe(true);
  });

  it('NEGA origem desconhecida em produção', () => {
    expect(isOriginAllowed('https://evil.example.com', 'production')).toBe(false);
  });

  it('NEGA origem desconhecida também fora de produção (sem vazar por padrão)', () => {
    expect(isOriginAllowed('https://evil.example.com', 'development')).toBe(false);
  });
});
