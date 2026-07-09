// @vitest-environment node
import { describe, it, expect } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

function makeApp() {
  const app = express();
  app.use(cookieParser());
  app.get('/protegido', requireAuth, (req: any, res) => res.json({ userId: req.user.userId }));
  return app;
}

const token = jwt.sign({ userId: 42, username: 'a', role: 'owner', type: 'access' }, process.env.JWT_SECRET!);

describe('requireAuth via cookie', () => {
  it('aceita token no cookie', async () => {
    const res = await request(makeApp()).get('/protegido').set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(42);
  });

  it('aceita token no header Authorization (compatibilidade)', async () => {
    const res = await request(makeApp()).get('/protegido').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('sem token → 401', async () => {
    const res = await request(makeApp()).get('/protegido');
    expect(res.status).toBe(401);
  });
});
