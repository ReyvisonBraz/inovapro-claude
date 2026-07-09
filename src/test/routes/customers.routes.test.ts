// @vitest-environment node
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { server } from '../mocks/server';

beforeAll(() => server.close());

vi.mock('../../services/customer.service.js', () => ({
  customerService: {
    findMany: vi.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }),
    findByPhone: vi.fn().mockResolvedValue(null),
    getPayments: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 7, firstName: 'Ana', lastName: 'Silva' }),
    update: vi.fn().mockResolvedValue({ id: 7 }),
    delete: vi.fn().mockResolvedValue({ id: 7 }),
  },
}));

import customersRoutes from '../../routes/customers';
import { makeApp, employee } from '../helpers/testApp';
import { customerService } from '../../services/customer.service.js';

const app = () => makeApp('/api/customers', customersRoutes, employee);
const validCustomer = { firstName: 'Ana', lastName: 'Silva', phone: '11999990000' };

beforeEach(() => vi.clearAllMocks());

describe('rotas /customers', () => {
  it('GET lista com meta', async () => {
    const res = await request(app()).get('/api/customers');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
  });

  it('POST inválido (sem firstName) → 400', async () => {
    const res = await request(app()).post('/api/customers').send({ lastName: 'Silva', phone: '11999990000' });
    expect(res.status).toBe(400);
  });

  it('POST válido (telefone novo) → 200 com id', async () => {
    const res = await request(app()).post('/api/customers').send(validCustomer);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 7);
    expect(customerService.create).toHaveBeenCalled();
  });

  it('POST detecta telefone duplicado → 409', async () => {
    (customerService.findByPhone as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 99, firstName: 'Ana', lastName: 'Silva' });
    const res = await request(app()).post('/api/customers').send(validCustomer);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('duplicate_phone');
  });

  it('DELETE responde success', async () => {
    const res = await request(app()).delete('/api/customers/7');
    expect(res.status).toBe(200);
    expect(customerService.delete).toHaveBeenCalledWith(7);
  });
});
