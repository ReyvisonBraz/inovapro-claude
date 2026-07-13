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
 * Pool sizing: Supabase session-mode pooler aceita ~15 conexões totais.
 * Em Vercel, limitamos via connection_limit=5 na URL.
 */

function buildDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error('[PRISMA] DATABASE_URL não configurada');

  const parsed = new URL(raw);

  // Supabase direto → pooler (porta 6543)
  if (parsed.hostname.endsWith('.supabase.co')) {
    const projectRef = parsed.hostname.split('.').at(-3);
    parsed.hostname = 'aws-1-us-west-2.pooler.supabase.com';
    parsed.port = '6543';
    if (projectRef && !decodeURIComponent(parsed.username).includes('.')) {
      parsed.username = `${decodeURIComponent(parsed.username)}.${projectRef}`;
    }
  }

  // Limitar pool por instância serverless (5 de 15 do pooler)
  const isVercel = !!process.env.VERCEL;
  if (isVercel && !parsed.searchParams.has('connection_limit')) {
    parsed.searchParams.set('connection_limit', '5');
  }

  return parsed.toString();
}

const databaseUrl = buildDatabaseUrl();

// PrismaPg com connection string — adapter gerencia o pool internamente
const adapter = new PrismaPg({ connectionString: databaseUrl });

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
