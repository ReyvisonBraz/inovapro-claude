// @vitest-environment node
import { describe, it, expect, vi, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { server } from './mocks/server';

// O setup global liga o MSW (para testes de front). Aqui usamos supertest
// contra o Express real: o MSW interceptaria as requisições GET mockadas
// (ex.: GET /api/users) antes de chegarem às rotas, mascarando a autorização.
// Desligamos o MSW neste arquivo de teste de backend.
beforeAll(() => server.close());

// Prisma e storage são mockados: este teste valida SÓ a camada de
// autorização (401/403), que roda ANTES de qualquer handler tocar o banco.
vi.mock('../lib/prisma.js', () => {
  const model = new Proxy({}, { get: () => vi.fn().mockResolvedValue([]) });
  const prisma = new Proxy({}, {
    get: (_t, prop) =>
      typeof prop === 'string' && prop.startsWith('$')
        ? vi.fn().mockImplementation(async (arg: any) =>
            typeof arg === 'function' ? arg(model) : [])
        : model,
  });
  return { prisma, default: prisma };
});
vi.mock('../lib/storage.js', () => ({
  uploadPhotoToStorage: vi.fn(),
  isStorageConfigured: () => false,
}));

import protectedRoutes from '../routes/index';

// App de teste: injeta um req.user configurável (stub do requireAuth global).
function appAs(user: { userId: number; username: string; role: string } | null) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { if (user) (req as any).user = user; next(); });
  app.use('/api', protectedRoutes);
  return app;
}

const owner = { userId: 1, username: 'admin', role: 'owner' };
const manager = { userId: 2, username: 'gerente', role: 'manager' };
const employee = { userId: 3, username: 'func', role: 'employee' };

describe('Autorização por rota (RBAC)', () => {
  it('employee NÃO pode criar usuário (owner-only) → 403', async () => {
    const res = await request(appAs(employee))
      .post('/api/users')
      .send({ username: 'x', password: 'y', role: 'owner', name: 'X' });
    expect(res.status).toBe(403);
  });

  it('manager NÃO pode listar usuários → 403', async () => {
    const res = await request(appAs(manager)).get('/api/users');
    expect(res.status).toBe(403);
  });

  it('employee NÃO pode alterar configurações → 403', async () => {
    const res = await request(appAs(employee)).post('/api/settings').send({ appName: 'hack' });
    expect(res.status).toBe(403);
  });

  it('employee NÃO pode ler audit logs → 403', async () => {
    const res = await request(appAs(employee)).get('/api/audit-logs');
    expect(res.status).toBe(403);
  });

  it('employee NÃO pode exportar (view_reports) → 403', async () => {
    const res = await request(appAs(employee)).get('/api/export-all');
    expect(res.status).toBe(403);
  });

  it('employee PODE acessar transações (tem manage_transactions) → não 403/401', async () => {
    const res = await request(appAs(employee)).get('/api/transactions');
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(401);
  });

  it('owner PODE criar usuário → não 403/401', async () => {
    const res = await request(appAs(owner))
      .post('/api/users')
      .send({ username: 'novo', password: 'senha123', role: 'employee', name: 'Novo' });
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(401);
  });

  it('requisição sem usuário autenticado → 401 em rota protegida', async () => {
    const res = await request(appAs(null)).get('/api/transactions');
    expect(res.status).toBe(401);
  });
});
