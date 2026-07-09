// @vitest-environment node
import { describe, it, expect, vi, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { server } from './mocks/server';

beforeAll(() => server.close());

vi.mock('../lib/prisma.js', () => ({
  prisma: { user: { create: vi.fn().mockResolvedValue({ id: 1 }), findMany: vi.fn().mockResolvedValue([]) } },
}));

import usersRoutes from '../routes/users';

const app = express();
app.use(express.json());
app.use('/api/users', usersRoutes);

describe('Validação de /api/users', () => {
  it('rejeita role inválida com 400', async () => {
    const res = await request(app).post('/api/users')
      .send({ username: 'joao', password: 'senha123', name: 'Joao', role: 'superadmin' });
    expect(res.status).toBe(400);
  });

  it('rejeita usuário sem senha (criação) com 400', async () => {
    const res = await request(app).post('/api/users')
      .send({ username: 'joao', name: 'Joao', role: 'employee' });
    expect(res.status).toBe(400);
  });

  it('aceita payload válido (não 400)', async () => {
    const res = await request(app).post('/api/users')
      .send({ username: 'joao', password: 'senha123', name: 'Joao', role: 'employee', permissions: [] });
    expect(res.status).not.toBe(400);
  });
});
