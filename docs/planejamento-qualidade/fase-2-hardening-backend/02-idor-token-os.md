# Fase 2 · Tarefa 02 — Rastreio público por token, não por id sequencial (M2)

**Goal:** Fechar o IDOR de [../../../src/routes/public.ts](../../../src/routes/public.ts): hoje `GET /api/public/os/:id` recebe o id **sequencial**, então qualquer pessoa enumera `1,2,3...` e lê equipamento, problema relatado, valores e fotos de todos os clientes. Passamos a exigir um `publicToken` não-adivinhável.

**Architecture:** Nova coluna `publicToken` (UUID único) em `ServiceOrder`. A rota pública passa a buscar por token. O QR/URL de rastreio ([../../../src/components/service-orders/modals/QRCodeModal.tsx](../../../src/components/service-orders/modals/QRCodeModal.tsx)) e a página pública ([../../../src/pages/PublicTrackingPage.tsx](../../../src/pages/PublicTrackingPage.tsx)) usam `t=<token>` em vez de `osId=<id>`. Migration com backfill de tokens para as OS existentes.

## Interfaces

- **Schema:** `ServiceOrder.publicToken String @unique @default(uuid())`.
- **Rota:** `GET /api/public/os/:token` (busca `where: { publicToken }`).
- **Frontend:** o objeto de OS autenticado passa a expor `publicToken` (já vem no spread de `service-order.service.ts`); o QR usa `?t=<publicToken>`.

---

- [ ] **Step 1: Adicionar a coluna ao schema**

Em `prisma/schema.prisma`, no model `ServiceOrder`, adicione:

```prisma
  publicToken        String?  @unique
```
> Nullable por enquanto para permitir o backfill; viramos `NOT NULL` no Step 3.

- [ ] **Step 2: Criar a migration com backfill (Postgres tem `gen_random_uuid()`)**

Crie a pasta e o arquivo `prisma/migrations/20260707120000_add_public_token/migration.sql`:

```sql
-- 1. coluna nullable
ALTER TABLE "ServiceOrder" ADD COLUMN "publicToken" TEXT;

-- 2. backfill das linhas existentes com UUID aleatorio
UPDATE "ServiceOrder" SET "publicToken" = gen_random_uuid()::text WHERE "publicToken" IS NULL;

-- 3. unicidade
CREATE UNIQUE INDEX "ServiceOrder_publicToken_key" ON "ServiceOrder"("publicToken");
```

- [ ] **Step 3: Default de UUID para novas OS**

Ainda no schema, troque a linha para gerar token automaticamente em novas linhas:

```prisma
  publicToken        String?  @unique @default(uuid())
```
> `@default(uuid())` cobre inserts novos; o backfill do Step 2 cobriu os antigos.

- [ ] **Step 4: Aplicar migration + regenerar client**

Run:
```powershell
npx prisma migrate deploy
npx prisma generate
npm run typecheck
```
Esperado: migração aplicada; `tsc` 0 erros; tipo `ServiceOrder` agora tem `publicToken`.

- [ ] **Step 5: Teste da rota pública por token (vai FALHAR)**

Crie `src/test/public-os.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

const found = {
  id: 1, publicToken: 'tok-abc', status: 'Pronto',
  equipmentType: 'Notebook', equipmentBrand: 'Dell', equipmentModel: 'X',
  equipmentColor: null, equipmentSerial: 'S1', reportedProblem: 'nao liga',
  entryDate: '2026-07-01', analysisPrediction: null, arrivalPhotoBase64: null,
  arrivalPhotoUrls: null, partsUsed: [], totalAmount: 100, serviceFee: 50,
};

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    serviceOrder: { findUnique: vi.fn(async ({ where }: any) => where.publicToken === 'tok-abc' ? found : null) },
    settings: { findUnique: vi.fn(async () => ({ shopWhatsapp: null, profileName: 'Inova' })) },
  },
}));
vi.mock('../lib/cache.js', () => ({
  publicOsCache: { get: () => undefined, set: () => {} },
  PUBLIC_OS_KEY: (t: string) => `os:${t}`,
}));

import publicRoutes from '../routes/public';

const app = express();
app.use(express.json());
app.use('/api', publicRoutes);

describe('GET /api/public/os/:token', () => {
  it('token válido retorna a OS', async () => {
    const res = await request(app).get('/api/public/os/tok-abc');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it('id sequencial (não-token) retorna 404', async () => {
    const res = await request(app).get('/api/public/os/1');
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 6: Rodar e ver FALHAR**

Run:
```powershell
npx vitest run src/test/public-os.test.ts
```
Esperado: falha — a rota atual busca por `id` numérico.

- [ ] **Step 7: Reescrever a rota pública para buscar por token**

Em `src/routes/public.ts`, troque o handler: parâmetro `:token`, sem `parseInt`, `where: { publicToken: token }`, e a chave de cache pela do token.

```ts
router.get('/public/os/:token', async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    if (!token || token.length < 8) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    const cacheKey = PUBLIC_OS_KEY(token);
    const cached = publicOsCache.get(cacheKey);
    if (cached) return res.json(cached);

    const [order, settings] = await Promise.all([
      prisma.serviceOrder.findUnique({
        where: { publicToken: token },
        select: { /* ...os mesmos campos de hoje... */ },
      }),
      prisma.settings.findUnique({ where: { id: 1 }, select: { shopWhatsapp: true, profileName: true } }),
    ]);

    if (!order) return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    // ...montagem do payload igual ao atual...
  } catch (err) {
    console.error('[PUBLIC_OS] Erro ao buscar OS:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
```
> Ajuste `PUBLIC_OS_KEY` em `src/lib/cache.ts` para aceitar `string` (hoje recebe `number`). O smoke: a chave de cache por token evita colisão.

- [ ] **Step 8: Rodar e ver PASSAR**

Run:
```powershell
npx vitest run src/test/public-os.test.ts
```
Esperado: 2 verdes.

- [ ] **Step 9: Atualizar o QR/URL no frontend**

Em `src/components/service-orders/modals/QRCodeModal.tsx` (linha ~20), troque:

```ts
const customerUrl = `${appUrl}/rastreio?t=${selectedOrder?.publicToken}`;
```

- [ ] **Step 10: Atualizar a página pública**

Em `src/pages/PublicTrackingPage.tsx`: leia `t` em vez de `osId` e chame a rota por token.

```ts
const token = React.useMemo(() => {
  const params = new URLSearchParams(window.location.search);
  return params.get('t');
}, []);
// ...
const res = await fetch(`${API_BASE}/public/os/${token}`);
// ...
useEffect(() => { if (token) fetchOS(token); }, [token, fetchOS]);
if (!token) { /* estado vazio como hoje */ }
```
> Compatibilidade: se quiser manter QRs antigos (com `?osId=`) funcionando por um tempo, adicione uma rota de compatibilidade temporária `GET /api/public/os-legacy/:id` protegida por feature flag. Caso contrário, QRs impressos antigos deixam de funcionar (aceitável para fechar o IDOR).

- [ ] **Step 11: Expor `publicToken` no tipo do frontend**

Em `src/types.ts`, adicione `publicToken?: string;` na interface `ServiceOrder` para o TS reconhecer o campo no QRCodeModal.

- [ ] **Step 12: Gate completo + smoke**

Run:
```powershell
npm run verify
```
Smoke manual: gere o QR de uma OS, abra a URL `?t=...` → dados aparecem; troque o token por outro aleatório → 404; tente `?t=1` → 404.

- [ ] **Step 13: Commit**

```powershell
git add prisma/ src/routes/public.ts src/lib/cache.ts src/components/service-orders/modals/QRCodeModal.tsx src/pages/PublicTrackingPage.tsx src/types.ts src/test/public-os.test.ts
git commit -m @'
fix(security): rastreio publico por token nao-adivinhavel (fecha IDOR)

- ServiceOrder.publicToken (uuid unico) + migration com backfill
- GET /api/public/os/:token; id sequencial retorna 404
- QR e pagina publica usam ?t=<token>

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `?t=<token>` funciona; `?t=1` e tokens aleatórios inexistentes → 404.
- [ ] Todas as OS existentes têm `publicToken` (backfill).
- [ ] `npm run verify` verde.

## Riscos

- **QRs já impressos** com `?osId=` param param de funcionar. Decida no Step 10 se mantém rota de compatibilidade temporária.
- **`gen_random_uuid()`** requer Postgres ≥ 13 (nativo). Em versões antigas, habilite `pgcrypto` (`CREATE EXTENSION IF NOT EXISTS pgcrypto;`) no topo da migration.
