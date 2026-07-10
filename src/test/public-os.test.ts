// @vitest-environment node
import { describe, it, expect, vi, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { server } from './mocks/server';

beforeAll(() => server.close());

const found = {
  id: 1, publicToken: 'tok-abcdef12', status: 'Pronto',
  equipmentType: 'Notebook', equipmentBrand: 'Dell', equipmentModel: 'X',
  equipmentColor: null, equipmentSerial: 'S1', reportedProblem: 'nao liga',
  entryDate: '2026-07-01', analysisPrediction: null, arrivalPhotoBase64: null,
  arrivalPhotoUrls: null, partsUsed: [], totalAmount: 100, serviceFee: 50,
};

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    serviceOrder: { findUnique: vi.fn(async ({ where }: any) => (where.publicToken === 'tok-abcdef12' ? found : null)) },
    settings: { findUnique: vi.fn(async () => ({ shopWhatsapp: null, profileName: 'Inova' })) },
  },
}));

import publicRoutes from '../routes/public';

const app = express();
app.use(express.json());
app.use('/api', publicRoutes);

describe('GET /api/public/os/:token', () => {
  it('token válido retorna a OS', async () => {
    const res = await request(app).get('/api/public/os/tok-abcdef12');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it('id sequencial (não-token) retorna 404', async () => {
    const res = await request(app).get('/api/public/os/1');
    expect(res.status).toBe(404);
  });
});
