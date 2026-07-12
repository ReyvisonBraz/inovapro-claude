import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient com connection pool nativo do Prisma.
 *
 * Antes usávamos @prisma/adapter-pg (PrismaPg) com pg.Pool manual, mas o
 * adapter tem bugs conhecidos em serverless:
 *   - Não propaga erros de conexão (issue #27626)
 *   - Timeout sem sslmode (issue #29252)
 *   - Falhas com operações concorrentes em client único (issue #29407)
 *
 * O PrismaClient nativo gerencia o pool internamente com retry automático,
 * circuit breaker e tratamento adequado de erros.
 *
 * Pool sizing: O Supabase session-mode pooler aceita ~15 conexões totais.
 * Em Vercel, cada instância serverless é um processo isolado. Limitamos
 * via DATABASE_URL (connection_limit=5) para não exceder o pooler.
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
    if (projectRef && !decodedUsername(parsed).includes('.')) {
      parsed.username = `${decodedUsername(parsed)}.${projectRef}`;
    }
  }

  // Garantir sslmode=require para conexões Supabase
  if (!parsed.searchParams.has('sslmode')) {
    parsed.searchParams.set('sslmode', 'require');
  }

  // Limitar pool por instância serverless (5 de 15 do pooler)
  const isVercel = !!process.env.VERCEL;
  if (isVercel && !parsed.searchParams.has('connection_limit')) {
    parsed.searchParams.set('connection_limit', '5');
  }

  return parsed.toString();
}

function decodedUsername(url: URL): string {
  return decodeURIComponent(url.username);
}

// Validate and enrich DATABASE_URL at startup
const databaseUrl = buildDatabaseUrl();
process.env.DATABASE_URL = databaseUrl;

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export async function testConnection(): Promise<boolean> {
  try {
    // Query simples para validar a conexão
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
