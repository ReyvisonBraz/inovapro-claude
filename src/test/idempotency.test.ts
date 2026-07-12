import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { idempotencyMiddleware } from '../middleware/idempotency.js';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(idempotencyMiddleware);
  app.post('/test', (_req, res) => {
    res.json({ id: Math.random(), created: true });
  });
  return app;
}

describe('idempotencyMiddleware', () => {
  it('reponde normalmente sem X-Idempotency-Key', async () => {
    const app = createApp();
    const res = await request(app).post('/test').send({ a: 1 });
    expect(res.status).toBe(200);
    expect(res.body.created).toBe(true);
  });

  it('retorna mesma resposta para mesma key', async () => {
    const app = createApp();
    const key = 'test-key-123';
    const res1 = await request(app).post('/test').set('X-Idempotency-Key', key).send({ a: 1 });
    const res2 = await request(app).post('/test').set('X-Idempotency-Key', key).send({ a: 1 });
    expect(res1.body).toEqual(res2.body);
  });

  it('retorna respostas diferentes para keys diferentes', async () => {
    const app = createApp();
    const res1 = await request(app).post('/test').set('X-Idempotency-Key', 'key-a').send({ a: 1 });
    const res2 = await request(app).post('/test').set('X-Idempotency-Key', 'key-b').send({ a: 1 });
    expect(res1.body.id).not.toBe(res2.body.id);
  });

  it('não intercepta GET requests', async () => {
    const app = express();
    app.use(idempotencyMiddleware);
    app.get('/test', (_req, res) => res.json({ ok: true }));
    const res = await request(app).get('/test');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
