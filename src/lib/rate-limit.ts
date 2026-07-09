import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';

/**
 * Rate limiter de login. Em deploy serverless (Vercel) o contador em memória
 * não é compartilhado entre instâncias — a proteção contra brute-force fica
 * fraca. Com `REDIS_URL` definido, usa Redis (contador compartilhado); sem ele,
 * cai para o store em memória (ok para instância única / dev).
 */
export function makeLoginLimiter() {
  const base = {
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
  };

  if (process.env.REDIS_URL) {
    const client = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 3 });
    return rateLimit({
      ...base,
      store: new RedisStore({
        sendCommand: (...args: string[]) => client.call(args[0], ...args.slice(1)) as Promise<never>,
      }),
    });
  }

  return rateLimit(base);
}
