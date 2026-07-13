import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * PrismaClient com PrismaPg driver adapter.
 *
 * Prisma 7 em ambientes bundled (Vercel) força engine type "client"
 * que requer obrigatoriamente um adapter. Usamos o pattern documentado:
 *   new PrismaPg({ connectionString })
 *
 * O adapter gerencia o pool internamente — não precisamos criar pg.Pool.
 *
 * Antes usávamos pg.Pool manual passado ao adapter, o que causava bugs:
 *   - Adapter não propaga erros de conexão (#27626)
 *   - Timeout sem sslmode (#29252)
 *   - Falhas com operações concorrentes (#29407)
 *
 * Na Vercel usamos o transaction pooler do Supabase (porta 6543) e limitamos
 * o pool real do driver `pg` a uma conexão por instância serverless.
 */

function buildDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error('[PRISMA] DATABASE_URL não configurada');

  const parsed = new URL(raw);

  // O Supavisor usa 5432 para session mode e 6543 para transaction mode.
  // Transaction mode é o indicado para conexões transitórias da Vercel.
  const isSupabasePooler = parsed.hostname.endsWith('.pooler.supabase.com');
  if (isSupabasePooler) {
    parsed.port = '6543';
  }

  return parsed.toString();
}

const databaseUrl = buildDatabaseUrl();
const usesSupabasePooler = new URL(databaseUrl).hostname.endsWith('.pooler.supabase.com');

// Com o driver adapter, quem gerencia conexões é o `pg.Pool`. Parâmetros do
// engine Prisma como `connection_limit` não alteram o limite desse pool.
const adapter = new PrismaPg({
  connectionString: databaseUrl,
  max: process.env.VERCEL || usesSupabasePooler ? 1 : 10,
  idleTimeoutMillis: process.env.VERCEL || usesSupabasePooler ? 5_000 : 30_000,
  connectionTimeoutMillis: 10_000,
});

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1 as ok`;
    return true;
  } catch (error) {
    console.error('[PRISMA] ❌ Connection failed:', error);
    return false;
  }
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;
