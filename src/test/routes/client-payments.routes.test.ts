// @vitest-environment node
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { server } from '../mocks/server';

beforeAll(() => server.close());

vi.mock('../../services/client-payment.service.js', () => ({
  clientPaymentService: {
    findMany: vi.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }),
    create: vi.fn().mockResolvedValue({ id: 5, customerId: 1, totalAmount: 100 }),
    update: vi.fn().mockResolvedValue({ id: 5 }),
    registerPayment: vi.fn().mockResolvedValue({ newPaidAmount: 50, newStatus: 'partial' }),
    delete: vi.fn().mockResolvedValue({ id: 5 }),
  },
}));

import clientPaymentsRoutes from '../../routes/client-payments';
import { makeApp, employee } from '../helpers/testApp';
import { clientPaymentService } from '../../services/client-payment.service.js';

const app = () => makeApp('/api/client-payments', clientPaymentsRoutes, employee);
const valid = {
  customerId: 1, description: 'Venda', totalAmount: 100,
  purchaseDate: '2026-07-07', dueDate: '2026-08-07', paymentMethod: 'Crediário',
};

beforeEach(() => vi.clearAllMocks());

describe('rotas /client-payments', () => {
  it('GET lista com meta', async () => {
    const res = await request(app()).get('/api/client-payments');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
  });

  it('POST inválido (sem description) → 400', async () => {
    const res = await request(app()).post('/api/client-payments')
      .send({ customerId: 1, totalAmount: 100, purchaseDate: '2026-07-07', dueDate: '2026-08-07', paymentMethod: 'Crediário' });
    expect(res.status).toBe(400);
  });

  it('POST válido → 200 com id', async () => {
    const res = await request(app()).post('/api/client-payments').send(valid);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 5);
  });

  it('POST /:id/pay registra recebimento', async () => {
    const res = await request(app()).post('/api/client-payments/5/pay').send({ amount: 50, date: '2026-07-07' });
    expect(res.status).toBe(200);
    expect(res.body.newStatus).toBe('partial');
    expect(clientPaymentService.registerPayment).toHaveBeenCalled();
  });

  it('DELETE responde success', async () => {
    const res = await request(app()).delete('/api/client-payments/5');
    expect(res.status).toBe(200);
    expect(clientPaymentService.delete).toHaveBeenCalledWith(5);
  });
});
