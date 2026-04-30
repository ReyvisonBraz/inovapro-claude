import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'db.dqpxwyixiluiyfjxakge.supabase.co',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1GG1lyfMNmkIp6NP',
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