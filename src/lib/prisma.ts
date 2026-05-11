import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

function getPoolConfig() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432'),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
    };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
  };
}

const config = getPoolConfig();
const pool = new pg.Pool({ ...config, max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 });

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