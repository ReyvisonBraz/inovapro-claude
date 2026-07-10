// @vitest-environment node
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { server } from '../mocks/server';

beforeAll(() => server.close());

vi.mock('../../services/service-order.service.js', () => ({
  serviceOrderService: {
    findMany: vi.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0, statusCounts: {} } }),
    findById: vi.fn().mockResolvedValue({ id: 3, customerId: 1, services: [], partsUsed: [] }),
    create: vi.fn().mockResolvedValue({ id: 3 }),
    update: vi.fn().mockResolvedValue({ id: 3, services: [], partsUsed: [] }),
    delete: vi.fn().mockResolvedValue({ id: 3 }),
  },
}));

import serviceOrdersRoutes from '../../routes/service-orders';
import { makeApp, employee } from '../helpers/testApp';
import { serviceOrderService } from '../../services/service-order.service.js';

const app = () => makeApp('/api/service-orders', serviceOrdersRoutes, employee);

beforeEach(() => vi.clearAllMocks());

describe('rotas /service-orders', () => {
  it('GET lista com meta', async () => {
    const res = await request(app()).get('/api/service-orders');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
  });

  it('GET /:id retorna a OS', async () => {
    const res = await request(app()).get('/api/service-orders/3');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 3);
  });

  it('POST inválido (sem customerId) → 400', async () => {
    const res = await request(app()).post('/api/service-orders').send({ entryDate: '2026-07-07' });
    expect(res.status).toBe(400);
  });

  it('POST válido → 201 com id', async () => {
    const res = await request(app()).post('/api/service-orders')
      .send({ customerId: 1, entryDate: '2026-07-07', status: 'Aguardando Análise' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 3);
  });

  it('DELETE responde 204', async () => {
    const res = await request(app()).delete('/api/service-orders/3');
    expect(res.status).toBe(204);
    expect(serviceOrderService.delete).toHaveBeenCalledWith(3);
  });
});
