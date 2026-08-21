/**
 * Testes HTTP contra o app REAL (createApp), com banco de verdade e JWT real.
 * Cobre o stack de middleware inteiro: login, auth, idempotência, erro 404/401.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { createCustomer, resetDb, seedUser } from './db.js';

const app = createApp();
const PASSWORD = 'admin2021';

beforeEach(async () => {
  await resetDb();
  await seedUser({ password: PASSWORD });
});

describe('login real', () => {
  it('login válido responde 200, define cookies httpOnly e permite /api/me', async () => {
    const login = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: PASSWORD });

    expect(login.status).toBe(200);
    expect(login.headers['set-cookie']).toHaveLength(2);

    const me = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);

    const meByCookieReq = request(app).get('/api/me');
    const rawCookies = login.headers['set-cookie'] as unknown as string[];
    if (rawCookies.length) meByCookieReq.set('Cookie', rawCookies.join('; '));
    expect((await meByCookieReq).status).toBe(200);
  });

  it('senha inválida responde 401', async () => {
    const res = await request(app).post('/api/login').send({ username: 'admin', password: 'errada' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeTruthy();
  });

  it('/api/me sem token responde 401 JSON', async () => {
    const res = await request(app).get('/api/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token de autenticação necessário');
  });
});

describe('idempotência por X-Idempotency-Key (real)', () => {
  const login = () =>
    request(app).post('/api/login').send({ username: 'admin', password: PASSWORD });

  async function authedPost(key?: string) {
    const session = await login();
    const token = session.body.token;
    const req = request(app)
      .post('/api/client-payments')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        customerId: 1,
        description: 'Venda idempotente',
        totalAmount: 100,
        purchaseDate: '2026-07-07',
        dueDate: '2026-08-07',
        paymentMethod: 'Crediário',
      });
    if (key) req.set('X-Idempotency-Key', key);
    return req;
  }

  it('mesma chave em dois POSTs: mesma resposta e UMA única gravação', async () => {
    await createCustomer();
    const idempHeader = 'idemp-sample-1';

    const first = await authedPost(idempHeader);
    expect(first.status).toBe(201);

    const second = await authedPost(idempHeader);
    expect(second.status).toBe(first.status);
    expect(second.body).toEqual(first.body);

    expect(await prisma.clientPayment.count()).toBe(1);
  });

  it('chaves diferentes geram gravações separadas', async () => {
    await createCustomer();

    const first = await authedPost('itest-key-a');
    const second = await authedPost('itest-key-b');
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    expect(await prisma.clientPayment.count()).toBe(2);
  });
});

describe('rotas desconhecidas e health', () => {
  it('/health responde 200 JSON', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('rota /api inexistente responde 404 para usuário autenticado (contrato JSON é fase 3)', async () => {
    const login = await request(app).post('/api/login').send({ username: 'admin', password: PASSWORD });
    const res = await request(app)
      .get('/api/nao-existe')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(404);
  });

  it('rota /api inexistente sem token responde 401 antes de chegar ao router (caracterização)', async () => {
    const res = await request(app).get('/api/nao-existe');
    expect(res.status).toBe(401);
  });
});