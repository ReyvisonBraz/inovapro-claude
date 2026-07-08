// @vitest-environment node
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { server } from './mocks/server';

// Backend test com supertest: desliga o MSW (que interceptaria POST /transactions).
beforeAll(() => server.close());

vi.mock('../services/transaction.service.js', () => ({
  transactionService: {
    create: vi.fn().mockResolvedValue({ id: 99, description: 'x', type: 'income', amount: 10, date: '2026-07-07' }),
    update: vi.fn().mockResolvedValue({ id: 99 }),
    delete: vi.fn().mockResolvedValue({ id: 99 }),
  },
}));
vi.mock('../services/inventory.service.js', () => ({
  inventoryService: {
    update: vi.fn().mockResolvedValue({ id: 5 }),
    adjustStock: vi.fn().mockResolvedValue({ id: 5, quantity: 0, version: 1 }),
  },
}));
vi.mock('../lib/prisma.js', () => {
  const model = new Proxy({}, { get: () => vi.fn().mockResolvedValue({ id: 5 }) });
  return { prisma: new Proxy({}, { get: () => model }), default: {} };
});

import transactionsRoutes from '../routes/transactions';
import inventoryRoutes from '../routes/inventory';
import { transactionService } from '../services/transaction.service.js';
import { inventoryService } from '../services/inventory.service.js';

function appAsUser(userId: number, router: express.Router, mount: string) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { (req as any).user = { userId, username: 'u', role: 'owner' }; next(); });
  app.use(mount, router);
  return app;
}

beforeEach(() => vi.clearAllMocks());

describe('Audit trail — createdBy/updatedBy vêm do token, não do body', () => {
  it('POST /transactions usa req.user.userId mesmo com createdBy forjado no body', async () => {
    await request(appAsUser(7, transactionsRoutes, '/api/transactions'))
      .post('/api/transactions')
      .send({ description: 'Venda', category: 'Vendas', type: 'income', amount: 10, date: '2026-07-07', createdBy: 999 });

    expect(transactionService.create).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 7 })
    );
    expect(transactionService.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 999 })
    );
  });

  it('PUT /transactions/:id usa req.user.userId como updatedBy', async () => {
    await request(appAsUser(7, transactionsRoutes, '/api/transactions'))
      .put('/api/transactions/5')
      .send({ description: 'Venda', category: 'Vendas', type: 'income', amount: 10, date: '2026-07-07', updatedBy: 999, version: 0 });

    expect(transactionService.update).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ updatedBy: 7 }),
      0
    );
  });

  it('PATCH /inventory/:id/stock passa req.user.userId (não o do body)', async () => {
    await request(appAsUser(7, inventoryRoutes, '/api/inventory'))
      .patch('/api/inventory/5/stock')
      .send({ delta: -1, updatedBy: 999 });

    expect(inventoryService.adjustStock).toHaveBeenCalledWith(5, -1, 7);
  });
});
