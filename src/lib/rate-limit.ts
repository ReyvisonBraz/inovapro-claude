import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;
  if (!process.env.REDIS_URL) return null;
  redisClient = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 3 });
  return redisClient;
}

function withStore(options: Record<string, unknown>) {
  const client = getRedisClient();
  if (client) {
    return rateLimit({
      ...options,
      store: new RedisStore({
        sendCommand: (...args: string[]) => client.call(args[0], ...args.slice(1)) as Promise<never>,
      }),
    } as Parameters<typeof rateLimit>[0]);
  }
  return rateLimit(options as Parameters<typeof rateLimit>[0]);
}

/**
 * Rate limiter de login: 10 tentativas por 15 min por IP.
 * Com REDIS_URL, o contador é compartilhado entre instâncias (importante
 * em deploy serverless). Sem REDIS_URL, cai para memória (dev / instância única).
 */
export function makeLoginLimiter() {
  return withStore({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * Rate limiter geral da API: 100 req/min por IP em rotas autenticadas.
 * Protege contra abuso/DoS de baixo orçamento sem sufocar uso legítimo.
 */
export function makeApiLimiter() {
  return withStore({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Limite de requisições atingido. Aguarde um minuto.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * Rate limiter de IA: 20 requisições por minuto por IP.
 * A IA tem custo financeiro (Gemini API) e é um vetor de abuso —
 * precisa de um teto mais apertado que as demais rotas.
 */
export function makeAiLimiter() {
  return withStore({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: 'Limite de requisições de IA atingido. Aguarde um minuto.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
}