import express, { Router } from 'express';
import { vi } from 'vitest';
import { errorHandler } from '../../lib/server-logger.js';
import '../../lib/serialize.js';

export type TestUser = { userId: number; username: string; role: string };

export const owner: TestUser = { userId: 1, username: 'admin', role: 'owner' };
export const manager: TestUser = { userId: 2, username: 'gerente', role: 'manager' };
export const employee: TestUser = { userId: 3, username: 'func', role: 'employee' };

/**
 * Prisma mockado: qualquer `model.metodo()` resolve `[]`; `$transaction(fn)`
 * executa `fn` com um tx-proxy. Cobre os handlers que tocam prisma direto.
 */
export function prismaProxyMock() {
  const model = new Proxy({}, { get: () => vi.fn().mockResolvedValue([]) });
  return new Proxy({}, {
    get: (_t, prop) =>
      typeof prop === 'string' && prop.startsWith('$')
        ? vi.fn().mockImplementation(async (arg: unknown) =>
            typeof arg === 'function' ? (arg as (m: unknown) => unknown)(model) : [])
        : model,
  });
}

/**
 * App Express de teste com um requireAuth "stub" que injeta req.user.
 * IMPORTANTE: nos arquivos de teste use `// @vitest-environment node` e
 * `beforeAll(() => server.close())` para o MSW global não interceptar o supertest.
 */
export function makeApp(mountPath: string, router: Router, user: TestUser | null = owner) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { if (user) (req as unknown as { user: TestUser }).user = user; next(); });
  app.use(mountPath, router);
  app.use(errorHandler);
  return app;
}
