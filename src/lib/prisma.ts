import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

function getPoolConfig() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const parsed = new URL(url);
    const params = Object.fromEntries(parsed.searchParams);
    const ssl = params.sslmode !== 'disable';

    let host = parsed.hostname;
    let port = parseInt(parsed.port || '5432');
    let user = decodeURIComponent(parsed.username);
    const pass = decodeURIComponent(parsed.password);
    const dbName = parsed.pathname.replace(/^\//, '');

    if (host.endsWith('.supabase.co')) {
      const projectRef = host.split('.').at(-3);
      host = 'aws-1-us-west-2.pooler.supabase.com';
      port = 6543;
      if (projectRef && !user.includes('.')) {
        user = `${user}.${projectRef}`;
      }
    }

    return { host, port, user, password: pass, database: dbName, ssl: ssl ? { rejectUnauthorized: false } : false };
  }
  const ssl = process.env.DB_SSL === 'true';
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
    ssl: ssl ? { rejectUnauthorized: false } : false,
  };
}

const config = getPoolConfig();
const pool = new pg.Pool({ ...config, max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 });

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
