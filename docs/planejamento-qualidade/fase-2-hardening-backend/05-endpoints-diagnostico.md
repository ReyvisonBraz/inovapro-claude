# Fase 2 · Tarefa 05 — Endpoints de diagnóstico não vazam ambiente (M4)

**Goal:** Parar de expor ambiente e internals sem autenticação. Hoje, em [../../../src/server.ts](../../../src/server.ts): `/api/ping` revela `DB_HOST` e quais env vars existem; `/api/db-test` conecta ao banco e devolve `version()` **e o stack trace** em erro — tudo público.

**Architecture:** Extraímos um router `src/routes/health.ts` com apenas o essencial e sem segredos (`/health`, `/ping` minimalistas), testável isoladamente. Removemos `/api/db-test` (diagnóstico de conexão vira tarefa de ops, não endpoint público) e o `/api/ping` verboso. O `/api/debug/*` já ficou owner-only na Fase 1.

## Interfaces

- **Produz:** `src/routes/health.ts` → `router` com `GET /health` e `GET /ping` (payload sem env/secrets).
- **Remove:** blocos inline `/health`, `/api/ping`, `/api/db-test` de `server.ts`.

---

- [ ] **Step 1: Teste do health router (vai FALHAR — módulo não existe)**

Crie `src/test/health.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import healthRoutes from '../routes/health';

const app = express();
app.use(healthRoutes);

describe('health/ping', () => {
  it('GET /health responde ok e sem vazar env', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('DATABASE_URL');
    expect(body).not.toContain('DB_HOST');
  });

  it('GET /ping não expõe variáveis de ambiente', async () => {
    const res = await request(app).get('/ping');
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty('env');
  });
});
```

- [ ] **Step 2: Rodar e ver FALHAR**

Run:
```powershell
npx vitest run src/test/health.test.ts
```
Esperado: erro de import.

- [ ] **Step 3: Criar `src/routes/health.ts`**

```ts
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0-prisma',
    uptime: process.uptime(),
  });
});

// Ping minimalista: prova que o processo responde, sem revelar ambiente.
router.get('/ping', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export default router;
```

- [ ] **Step 4: Rodar e ver PASSAR**

Run:
```powershell
npx vitest run src/test/health.test.ts
```
Esperado: 2 verdes.

- [ ] **Step 5: Ligar o router e remover os endpoints vazantes do `server.ts`**

Em `src/server.ts`:
- importe e monte antes das rotas autenticadas:
```ts
import healthRoutes from './src/routes/health.js';
// ...
app.use(healthRoutes);      // /health e /ping publicos, sem segredos
app.use('/api', healthRoutes); // opcional: mantem /api/ping funcionando
```
- **remova** o bloco `app.get('/health', ...)` inline.
- **remova** por completo `app.get('/api/ping', ...)` (o que vazava `DB_HOST`/env).
- **remova** por completo `app.get('/api/db-test', ...)` (o que vazava `version()` e stack).

- [ ] **Step 6: Ajustar o `/api/debug/health` (já owner-only) para não duplicar memória exposta**

Em `src/routes/debug.ts`, o `GET /health` retorna `process.memoryUsage()`. Como o router `debug` agora exige `owner` (Fase 1), o vazamento é para admin apenas — aceitável. Opcional: remova esse handler duplicado e confie no `/health` público. Se remover, ajuste o comentário do arquivo.

- [ ] **Step 7: Gate + smoke**

Run:
```powershell
npm run verify
```
Smoke: suba a API e confirme:
```powershell
Invoke-RestMethod http://localhost:3001/health          # { status: 'ok', ... } sem env
Invoke-RestMethod http://localhost:3001/api/db-test      # deve dar 404 agora
```

- [ ] **Step 8: Commit**

```powershell
git add src/routes/health.ts src/test/health.test.ts server.ts src/routes/debug.ts
git commit -m @'
fix(security): remove /api/db-test e /api/ping verboso; health router sem env

- health/ping minimalistas e testados
- db-test (vazava version/stack) removido

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `/health` responde sem env/secrets (provado por teste).
- [ ] `/api/db-test` retorna 404; `/api/ping` não expõe `env`.
- [ ] `npm run verify` verde.
