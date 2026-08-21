/**
 * Setup da suíte de integração (Postgres real).
 * A base espera o schema aplicado (prisma migrate deploy) e o banco acessível
 * em DATABASE_URL. O CI provisiona via service; local via scripts/test-db.sh.
 */
process.env.JWT_SECRET ||= 'integration-test-secret-32chars!!';
process.env.ENCRYPTION_KEY ||= 'integration-encryption-key-32chars!!';
process.env.NODE_ENV ||= 'test';
// local/CI usam a mesma convenção (ci:ci@localhost:5432/ci).
process.env.DATABASE_URL ||= 'postgresql://ci:ci@localhost:5432/ci';

import { prisma } from '../../lib/prisma.js';
import { afterAll, beforeAll } from 'vitest';

beforeAll(async () => {
  const ok = await prisma.$queryRaw`SELECT 1 as ok`;
  if (!ok) throw new Error('Banco de integração inacessível — rode scripts/test-db.sh (ou configure DATABASE_URL).');
});

afterAll(async () => {
  await prisma.$disconnect();
});