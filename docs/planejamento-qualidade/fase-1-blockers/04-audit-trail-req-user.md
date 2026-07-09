# Fase 1 · Tarefa 04 — Audit trail confiável a partir de `req.user` (M5)

**Goal:** Fazer `createdBy`/`updatedBy` virem **sempre** do JWT (`req.user.userId`), nunca do corpo da requisição. Hoje o cliente envia esses campos (ver [../../../src/routes/schemas.ts](../../../src/routes/schemas.ts)) e os serviços caem em `|| 1`, tornando a auditoria falsificável e sem valor forense.

**Architecture:** Duas mudanças por rota de escrita: (1) o handler passa a ser tipado como `AuthRequest` e injeta `createdBy`/`updatedBy = req.user!.userId` ao chamar o service; (2) os schemas Zod deixam de aceitar `createdBy`/`updatedBy` (chaves desconhecidas são removidas pelo `z.object`). `requireAuth` global garante `req.user` presente em todas essas rotas.

**Pré-requisito:** Tarefa 01 (RBAC) concluída — as rotas já estão sob autorização e `req.user` é garantido.

## Interfaces

- **Consome:** `AuthRequest` de `../../../src/middleware/auth.ts` (já exporta `user?: { userId; username; role }`). Assinaturas dos services **não mudam** (já aceitam `createdBy?`/`updatedBy?`).
- **Produz:** rotas de escrita que ignoram `createdBy`/`updatedBy` do body e usam o do token.

## Alcance (todas as rotas de escrita)

| Rota | Handlers a ajustar | Campo injetado |
|------|--------------------|----------------|
| `transactions.ts` | POST, PUT | `createdBy`/`updatedBy` |
| `client-payments.ts` | POST, PUT, `POST /:id/pay` | `createdBy`/`updatedBy` |
| `service-orders.ts` | POST, PUT | `createdBy`/`updatedBy` |
| `customers.ts` | POST, PUT | `createdBy`/`updatedBy` |
| `inventory.ts` | POST, PUT, `PATCH /:id/stock` | `createdBy`/`updatedBy` |

---

- [ ] **Step 1: Escrever o teste (vai FALHAR — hoje usa o body)**

Crie `src/test/audit-trail.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../services/transaction.service.js', () => ({
  transactionService: {
    create: vi.fn().mockResolvedValue({ id: 99, description: 'x', type: 'income', amount: 10, date: '2026-07-07' }),
    update: vi.fn().mockResolvedValue({ id: 99 }),
    delete: vi.fn().mockResolvedValue({ id: 99 }),
  },
}));

import transactionsRoutes from '../routes/transactions';
import { transactionService } from '../services/transaction.service.js';

function appAsUser(userId: number) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { (req as any).user = { userId, username: 'u', role: 'owner' }; next(); });
  app.use('/api/transactions', transactionsRoutes);
  return app;
}

beforeEach(() => vi.clearAllMocks());

describe('Audit trail — createdBy vem do token, não do body', () => {
  it('POST usa req.user.userId mesmo com createdBy forjado no body', async () => {
    await request(appAsUser(7))
      .post('/api/transactions')
      .send({ description: 'Venda', category: 'Vendas', type: 'income', amount: 10, date: '2026-07-07', createdBy: 999 });

    expect(transactionService.create).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 7 })
    );
    // e nunca com o valor forjado
    expect(transactionService.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 999 })
    );
  });

  it('PUT usa req.user.userId como updatedBy', async () => {
    await request(appAsUser(7))
      .put('/api/transactions/5')
      .send({ description: 'Venda', category: 'Vendas', type: 'income', amount: 10, date: '2026-07-07', updatedBy: 999, version: 0 });

    expect(transactionService.update).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ updatedBy: 7 }),
      0
    );
  });
});
```

- [ ] **Step 2: Rodar e ver FALHAR**

Run:
```powershell
npx vitest run src/test/audit-trail.test.ts
```
Esperado: falha — hoje `createdBy` chega como `999` (do body) ou `undefined`.

- [ ] **Step 3: Ajustar `transactions.ts` (rota de referência)**

Edite `src/routes/transactions.ts`:

```ts
import { AuthRequest } from '../middleware/auth.js';

router.post('/', validate(TransactionSchema), async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await transactionService.create({ ...req.body, createdBy: req.user!.userId });
    // ...resto igual...
  } // ...
});

router.put('/:id', validate(TransactionSchema), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const expectedVersion = typeof req.body.version === 'number' ? req.body.version : undefined;
    await transactionService.update(id, { ...req.body, updatedBy: req.user!.userId }, expectedVersion);
    // ...resto igual...
  } // ...
});
```

- [ ] **Step 4: Rodar e ver PASSAR**

Run:
```powershell
npx vitest run src/test/audit-trail.test.ts
```
Esperado: 2 testes verdes.

- [ ] **Step 5: Remover `createdBy`/`updatedBy` dos schemas Zod**

Edite `src/routes/schemas.ts`: apague as linhas `createdBy: ...` e `updatedBy: ...` de `TransactionSchema` **e** de `ClientPaymentSchema`. Faça o mesmo em `src/schemas/serviceOrderSchema.ts` e `src/schemas/customerSchema.ts` se tiverem esses campos. Assim o `z.object` descarta esses campos do body — o cliente não consegue mais enviá-los.

> Mantenha `version` nos schemas (é usado para o lock otimista, legítimo vindo do cliente).

- [ ] **Step 6: Aplicar o mesmo padrão às demais rotas de escrita**

Para cada arquivo abaixo, tipe o handler como `AuthRequest`, importe `AuthRequest` de `../middleware/auth.js`, e injete o userId do token. Padrão idêntico ao Step 3:

- `src/routes/client-payments.ts` — POST: `{ ...req.body, createdBy: req.user!.userId }`; PUT e `POST /:id/pay`: `updatedBy: req.user!.userId`.
- `src/routes/service-orders.ts` — POST: `createdBy`; PUT: `updatedBy`.
- `src/routes/customers.ts` — POST: `createdBy`; PUT: `updatedBy`.
- `src/routes/inventory.ts` — POST: `createdBy`; PUT e `PATCH /:id/stock`: `updatedBy` (substituindo o atual `parseInt(updatedBy)` vindo do body).

> Em `inventory.ts`, remova os `parseInt(createdBy)`/`parseInt(updatedBy)` que leem do body e passe `req.user!.userId` diretamente.

- [ ] **Step 7: Estender o teste para uma segunda entidade (garantia de padrão)**

Adicione ao `audit-trail.test.ts` um bloco análogo para `inventory.ts` (mock de `inventoryService`, POST com `createdBy: 999` no body → espera `createdBy: 7`). Rode e veja passar:
```powershell
npx vitest run src/test/audit-trail.test.ts
```

- [ ] **Step 8: Gate completo**

Run:
```powershell
npm run verify
```
Esperado: `tsc` 0 erros; toda a suíte verde.

- [ ] **Step 9: Commit**

```powershell
git add src/routes/ src/schemas/ src/test/audit-trail.test.ts
git commit -m @'
fix(security): createdBy/updatedBy derivam do token, nao do body (audit trail)

- rotas de escrita injetam req.user.userId
- schemas Zod deixam de aceitar createdBy/updatedBy do cliente
- testes provam que valor forjado no body e ignorado

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] Teste prova que `createdBy`/`updatedBy` vêm do token mesmo com valor forjado no body.
- [ ] Nenhuma rota de escrita lê `createdBy`/`updatedBy` de `req.body`.
- [ ] `npm run verify` verde.

## Follow-up (fora do escopo)

- Os serviços ainda têm fallback `|| 1`. Com `req.user!.userId` sempre presente, esse fallback vira defensivo. Pode ser removido quando houver certeza de cobertura (Fase 4, testes de integração com DB real).
