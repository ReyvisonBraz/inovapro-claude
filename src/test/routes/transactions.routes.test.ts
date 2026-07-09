// @vitest-environment node
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { server } from '../mocks/server';

beforeAll(() => server.close());

vi.mock('../../services/transaction.service.js', () => ({
  transactionService: {
    findMany: vi.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }),
    create: vi.fn().mockResolvedValue({ id: 10, description: 'x', type: 'income', amount: 1, date: '2026-07-07' }),
    update: vi.fn().mockResolvedValue({ id: 10 }),
    delete: vi.fn().mockResolvedValue({ id: 10 }),
  },
}));

import transactionsRoutes from '../../routes/transactions';
import { makeApp, employee } from '../helpers/testApp';
import { transactionService } from '../../services/transaction.service.js';

const app = () => makeApp('/api/transactions', transactionsRoutes, employee);

beforeEach(() => vi.clearAllMocks());

describe('rotas /transactions', () => {
  it('GET lista com meta', async () => {
    const res = await request(app()).get('/api/transactions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
  });

  it('POST inválido (amount ausente) → 400', async () => {
    const res = await request(app()).post('/api/transactions')
      .send({ category: 'Vendas', type: 'income', date: '2026-07-07' });
    expect(res.status).toBe(400);
    expect(transactionService.create).not.toHaveBeenCalled();
  });

  it('POST válido → 201 com id', async () => {
    const res = await request(app()).post('/api/transactions')
      .send({ description: 'v', category: 'Vendas', type: 'income', amount: 10, date: '2026-07-07' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 10);
  });

  it('PUT válido chama update e responde success', async () => {
    const res = await request(app()).put('/api/transactions/10')
      .send({ description: 'v', category: 'Vendas', type: 'income', amount: 10, date: '2026-07-07', version: 0 });
    expect(res.status).toBe(200);
    expect(transactionService.update).toHaveBeenCalled();
  });

  it('DELETE responde success', async () => {
    const res = await request(app()).delete('/api/transactions/10');
    expect(res.status).toBe(200);
    expect(transactionService.delete).toHaveBeenCalledWith(10);
  });
});
