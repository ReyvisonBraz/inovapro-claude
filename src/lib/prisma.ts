/*
 * Conexão com PostgreSQL via Prisma + pg adapter.
 *
 * ⚠️ SEGURANÇA: Todas as credenciais DEVEM vir de variáveis de ambiente.
 *    Os valores padrão abaixo existem apenas para desenvolvimento local
 *    e NUNCA devem conter senhas reais.
 *
 * Variáveis esperadas no .env:
 *   DATABASE_URL (opcional — usada pelo Railway/Prisma CLI)
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (conexão direta)
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const requiredVars = {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
};

const missingVars = Object.entries(requiredVars)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missingVars.length > 0) {
  console.error(`[PRISMA] ❌ Variáveis de ambiente obrigatórias ausentes: ${missingVars.join(', ')}`);
  console.error('[PRISMA] ❌ Configure DB_HOST, DB_USER, DB_PASSWORD no arquivo .env');
}

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

pool.on('error', (err) => {
  console.error('[PRISMA] Unexpected error on idle client', err);
});

export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('[PRISMA] ✅ Connected to database');
    return true;
  } catch (error) {
    console.error('[PRISMA] ❌ Connection failed:', error);
    return false;
  }
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
  await pool.end();
}

export default prisma;