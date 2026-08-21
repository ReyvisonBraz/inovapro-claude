// @vitest-environment node
import { describe, expect, it } from 'vitest';
import express, { type ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { createCsrfProtection } from '../middleware/csrf';

function makeApp() {
  const app = express();
  app.use(cookieParser());
  app.use(createCsrfProtection({
    nodeEnv: 'production',
    appUrl: 'https://inovapro-theta.vercel.app',
  }));
  app.all('/command', (_req, res) => res.status(204).end());
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const statusCode = (err as Error & { statusCode?: number }).statusCode ?? 500;
    res.status(statusCode).json({ error: (err as Error).message });
  };
  app.use(errorHandler);
  return app;
}

describe('proteção CSRF de autenticação por cookie', () => {
  it('nega POST cross-origin com o cookie da vítima', async () => {
    const response = await request(makeApp())
      .post('/command')
      .set('Cookie', 'token=victim-session')
      .set('Origin', 'https://evil.example.com')
      .set('Sec-Fetch-Site', 'same-site');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Origem da requisição não autorizada');
  });

  it('permite POST cookie-auth da origem exata e same-origin', async () => {
    const response = await request(makeApp())
      .post('/command')
      .set('Cookie', 'token=session')
      .set('Origin', 'https://inovapro-theta.vercel.app')
      .set('Sec-Fetch-Site', 'same-origin');

    expect(response.status).toBe(204);
  });

  it('nega refresh cookie cross-site mesmo quando Origin está ausente', async () => {
    const response = await request(makeApp())
      .post('/command')
      .set('Cookie', 'refreshToken=victim-refresh')
      .set('Sec-Fetch-Site', 'cross-site');

    expect(response.status).toBe(403);
  });

  it('nega mutação cookie-auth quando Origin e Fetch Metadata estão ausentes', async () => {
    const response = await request(makeApp())
      .post('/command')
      .set('Cookie', 'token=server-session');

    expect(response.status).toBe(403);
  });

  it('aceita fallback same-origin quando o Origin está ausente', async () => {
    const response = await request(makeApp())
      .post('/command')
      .set('Cookie', 'token=session')
      .set('Sec-Fetch-Site', 'same-origin');

    expect(response.status).toBe(204);
  });

  it('não aplica CSRF a bearer-only nem a métodos seguros', async () => {
    const bearerResponse = await request(makeApp())
      .post('/command')
      .set('Authorization', 'Bearer api-token')
      .set('Sec-Fetch-Site', 'cross-site');
    const getResponse = await request(makeApp())
      .get('/command')
      .set('Cookie', 'token=session')
      .set('Sec-Fetch-Site', 'cross-site');

    expect(bearerResponse.status).toBe(204);
    expect(getResponse.status).toBe(204);
  });
});
