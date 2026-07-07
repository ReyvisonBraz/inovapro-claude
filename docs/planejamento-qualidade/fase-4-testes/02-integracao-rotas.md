# Fase 4 · Tarefa 02 — Testes de integração por grupo de rotas (M7)

**Goal:** Cada grupo de rotas ter teste de integração cobrindo: autorização (role certa/errada), validação (400 em body inválido) e happy-path (formato da resposta). Consolida o padrão iniciado nas Fases 1–2 num helper reutilizável.

**Architecture:** Um helper `src/test/helpers/testApp.ts` monta um app Express com `requireAuth` stub (injeta `req.user` configurável), `cookieParser` e o router-alvo, com Prisma mockado por um Proxy genérico. Cada arquivo de teste por grupo (`transactions`, `customers`, `client-payments`, `service-orders`, `inventory`, `catalog`) usa o helper. Testes DB-backed (opcionais) ficam atrás de `TEST_DATABASE_URL`.

## Interfaces

- **Produz:**
  - `src/test/helpers/testApp.ts` → `makeApp(router, user?)` e `prismaProxyMock()`.
  - Testes: `src/test/routes/<grupo>.test.ts`.

---

- [ ] **Step 1: Criar o helper de app de teste**

Crie `src/test/helpers/testApp.ts`:

```ts
import express, { Router } from 'express';
import { vi } from 'vitest';

export type TestUser = { userId: number; username: string; role: string };

export const owner: TestUser = { userId: 1, username: 'admin', role: 'owner' };
export const manager: TestUser = { userId: 2, username: 'gerente', role: 'manager' };
export const employee: TestUser = { userId: 3, username: 'func', role: 'employee' };

/** Prisma mockado: qualquer model.method() resolve []; $transaction executa a fn. */
export function prismaProxyMock() {
  const model = new Proxy({}, { get: () => vi.fn().mockResolvedValue([]) });
  return new Proxy({}, {
    get: (_t, prop) =>
      typeof prop === 'string' && prop.startsWith('$')
        ? vi.fn().mockImplementation(async (arg: any) => (typeof arg === 'function' ? arg(model) : []))
        : model,
  });
}

/** App com requireAuth stub injetando req.user. */
export function makeApp(mountPath: string, router: Router, user: TestUser | null = owner) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { if (user) (req as any).user = user; next(); });
  app.use(mountPath, router);
  return app;
}
```

- [ ] **Step 2: Teste de integração — transactions (exemplo completo)**

Crie `src/test/routes/transactions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../../services/transaction.service.js', () => ({
  transactionService: {
    findMany: vi.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }),
    create: vi.fn().mockResolvedValue({ id: 10, description: 'x', type: 'income', amount: 1, date: '2026-07-07' }),
    update: vi.fn().mockResolvedValue({ id: 10 }),
    delete: vi.fn().mockResolvedValue({ id: 10 }),
  },
}));

import transactionsRoutes from '../../routes/transactions';
import { makeApp, employee } from '../helpers/testApp';

beforeEach(() => vi.clearAllMocks());

describe('rotas /transactions', () => {
  it('GET lista com meta', async () => {
    const res = await request(makeApp('/api/transactions', transactionsRoutes)).get('/api/transactions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
  });

  it('POST inválido (amount ausente) → 400', async () => {
    const res = await request(makeApp('/api/transactions', transactionsRoutes, employee))
      .post('/api/transactions').send({ category: 'Vendas', type: 'income', date: '2026-07-07' });
    expect(res.status).toBe(400);
  });

  it('POST válido → 200 com id', async () => {
    const res = await request(makeApp('/api/transactions', transactionsRoutes, employee))
      .post('/api/transactions').send({ description: 'v', category: 'Vendas', type: 'income', amount: 10, date: '2026-07-07' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
  });
});
```

- [ ] **Step 3: Rodar e ver PASSAR**

Run:
```powershell
npx vitest run src/test/routes/transactions.test.ts
```
Esperado: 3 verdes.

- [ ] **Step 4: Replicar o padrão para os demais grupos**

Crie, no mesmo formato, um arquivo por grupo — cada um com: (a) GET lista, (b) POST inválido → 400, (c) POST válido → 2xx, e (d) onde houver, PUT com `version` e caminho de conflito 409:

- `src/test/routes/customers.test.ts`
- `src/test/routes/client-payments.test.ts`
- `src/test/routes/service-orders.test.ts`
- `src/test/routes/inventory.test.ts`
- `src/test/routes/catalog.test.ts`

> Reaproveite os testes de autorização (`authz.routes.test.ts`) e de validação (`validation.routes.test.ts`) já criados nas Fases 1–2 — eles compõem a suíte; não duplique.

- [ ] **Step 5: (Opcional, recomendado) Suíte DB-backed atrás de env**

Para 1–2 fluxos financeiros críticos (registrar pagamento, estorno ao excluir transação), vale um teste contra Postgres real. Crie `src/test/integration/payments.db.test.ts` que só roda se `process.env.TEST_DATABASE_URL` existir:

```ts
import { describe } from 'vitest';
const runDb = !!process.env.TEST_DATABASE_URL;
describe.runIf(runDb)('fluxo financeiro (DB real)', () => {
  // conecta num banco de teste (docker: postgres), roda migrations,
  // exercita clientPaymentService.registerPayment e transactionService.delete,
  // e valida saldos/estornos reais.
});
```
> Documente no README de testes como subir o Postgres de teste (docker: `docker run -e POSTGRES_PASSWORD=... -p 5433:5432 postgres:16`) e setar `TEST_DATABASE_URL`. Sem a env, a suíte é pulada — não quebra o CI padrão.

- [ ] **Step 6: Subir os thresholds de cobertura**

Após cada grupo coberto, rode `npx vitest run --coverage`, veja a cobertura subir e aumente os thresholds em `vitest.config.ts` (+5), commitando junto.

- [ ] **Step 7: Gate final**

Run:
```powershell
npm run verify
npx vitest run --coverage
```
Esperado: verde e cobertura da camada de servidor visivelmente maior.

- [ ] **Step 8: Commit**

```powershell
git add src/test/ vitest.config.ts
git commit -m @'
test(integração): suíte de rotas (auth + validacao + happy-path) via supertest

- helper testApp reutilizavel; grupos transactions/customers/payments/OS/inventory/catalog
- suite DB-backed opcional atras de TEST_DATABASE_URL
- thresholds de cobertura elevados

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] Cada grupo de rotas com teste de integração (auth + validação + happy-path).
- [ ] Cobertura de `src/routes`/`src/services` subiu de forma mensurável.
- [ ] `npm run verify` verde.
