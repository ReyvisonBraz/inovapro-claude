// @vitest-environment node
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { server } from './mocks/server';

beforeAll(() => server.close());

const { findMany, upsert, update } = vi.hoisted(() => ({
  findMany: vi.fn().mockResolvedValue([]),
  upsert: vi.fn().mockImplementation(async ({ create }) => create),
  update: vi.fn().mockResolvedValue({ id: 'ERR-ABCDEF123456', resolved: true }),
}));

vi.mock('../lib/prisma.js', () => ({
  prisma: { systemError: { findMany, upsert, update } },
}));

import systemErrorsRoutes from '../routes/system-errors';
import { makeApp, employee, owner } from './helpers/testApp';
import { sanitizeDiagnosticDetails } from '../lib/audit';

beforeEach(() => vi.clearAllMocks());

describe('observabilidade', () => {
  it('remove dados sensíveis inclusive em objetos aninhados', () => {
    expect(sanitizeDiagnosticDetails({
      password: '123',
      nested: { customerPassword: 'abc', token: 'secret', useful: 'ok' },
      arrivalPhotoBase64: 'imagem',
    })).toEqual({
      password: '[REDACTED]',
      nested: { customerPassword: '[REDACTED]', token: '[REDACTED]', useful: 'ok' },
      arrivalPhotoBase64: '[REDACTED]',
    });
  });

  it('permite que funcionário reporte erro do cliente', async () => {
    const response = await request(makeApp('/api/system-errors', systemErrorsRoutes, employee))
      .post('/api/system-errors/report')
      .send({ id: 'ERR-ABCDEF123456', message: 'Falha ao salvar', operation: 'POST /service-orders' });

    expect(response.status).toBe(201);
    expect(upsert).toHaveBeenCalledOnce();
  });

  it('restringe a consulta de erros ao proprietário', async () => {
    const denied = await request(makeApp('/api/system-errors', systemErrorsRoutes, employee)).get('/api/system-errors');
    const allowed = await request(makeApp('/api/system-errors', systemErrorsRoutes, owner)).get('/api/system-errors');

    expect(denied.status).toBe(403);
    expect(allowed.status).toBe(200);
  });
});
