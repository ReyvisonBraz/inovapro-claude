// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { server } from './mocks/server';
import healthRoutes from '../routes/health';

beforeAll(() => server.close());

const app = express();
app.use(healthRoutes);

describe('health/ping', () => {
  it('GET /health responde ok e sem vazar env', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('DATABASE_URL');
    expect(body).not.toContain('DB_HOST');
  });

  it('GET /ping não expõe variáveis de ambiente', async () => {
    const res = await request(app).get('/ping');
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty('env');
  });
});
