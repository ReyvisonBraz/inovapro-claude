// @vitest-environment node
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { server } from '../mocks/server';

beforeAll(() => server.close());

vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    inventoryItem: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 8, name: 'Peça' }),
      delete: vi.fn().mockResolvedValue({ id: 8 }),
    },
  },
}));
vi.mock('../../services/inventory.service.js', () => ({
  inventoryService: {
    update: vi.fn().mockResolvedValue({ id: 8 }),
    adjustStock: vi.fn().mockResolvedValue({ id: 8, quantity: 4, version: 1 }),
  },
}));

import inventoryRoutes from '../../routes/inventory';
import { makeApp, employee } from '../helpers/testApp';
import { inventoryService } from '../../services/inventory.service.js';

const app = () => makeApp('/api/inventory', inventoryRoutes, employee);

beforeEach(() => vi.clearAllMocks());

describe('rotas /inventory', () => {
  it('GET lista itens', async () => {
    const res = await request(app()).get('/api/inventory');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST inválido (categoria fora do enum) → 400', async () => {
    const res = await request(app()).post('/api/inventory').send({ name: 'Peça', category: 'gadget' });
    expect(res.status).toBe(400);
  });

  it('POST válido → 200 com id', async () => {
    const res = await request(app()).post('/api/inventory')
      .send({ name: 'Peça', category: 'product', unitPrice: 10, stockLevel: 5 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 8);
  });

  it('PATCH /:id/stock ajusta estoque', async () => {
    const res = await request(app()).patch('/api/inventory/8/stock').send({ delta: -1 });
    expect(res.status).toBe(200);
    expect(inventoryService.adjustStock).toHaveBeenCalledWith(8, -1, employee.userId);
  });

  it('DELETE responde success', async () => {
    const res = await request(app()).delete('/api/inventory/8');
    expect(res.status).toBe(200);
  });
});
