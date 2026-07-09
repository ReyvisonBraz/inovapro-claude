# Fase 5 · Tarefa 03 — Rate-limit e cache duráveis para multi-instância (M8)

**Goal:** Garantir que o rate-limit de login, o `node-cache` do rastreio público e os logs em memória funcionem **corretamente** no alvo de deploy. Hoje todos são in-memory ([auth.ts](../../../src/routes/auth.ts) `rateLimit` default store, [cache.ts](../../../src/lib/cache.ts) `node-cache`, [server-logger.ts](../../../src/lib/server-logger.ts) array em memória). Em multi-instância/serverless cada instância tem o seu — o rate-limit deixa de proteger (o atacante distribui as tentativas entre instâncias).

**Architecture:** **Condicional ao alvo escolhido na Tarefa 01:**
- **Instância única (Render free):** in-memory é aceitável. Esta tarefa vira "documentar a premissa de instância única" e para por aí.
- **Multi-instância (Cloud Run com escala, ou qualquer serverless):** mover rate-limit e cache para **Redis** (ex.: Upstash) e trocar logs em memória por um coletor externo (stdout estruturado + o coletor do host).

## Caminho 1 — alvo é instância única

- [ ] **Step 1:** Documente em `docs/DEPLOY.md`: "Rate-limit, cache e logs são em memória; isto depende de o serviço rodar em **uma** instância. Ao escalar horizontalmente, aplicar a Tarefa 05-03 (Redis)." Configure o host para `maxInstances=1` (Cloud Run) ou plano de instância única.
- [ ] **Step 2:** Commit da nota. **Fim da tarefa.**

## Caminho 2 — alvo é multi-instância (Redis)

- [ ] **Step 1: Provisionar Redis** (Upstash free, ou Redis gerenciado). Guardar `REDIS_URL` como secret no host.

- [ ] **Step 2: Instalar clientes**
```powershell
npm install ioredis rate-limit-redis
```

- [ ] **Step 3: Teste do store de rate-limit (mock do Redis) — vai FALHAR**

Crie `src/test/rate-limit-store.test.ts` validando que a fábrica usa Redis quando `REDIS_URL` existe e cai para memória quando não:

```ts
import { describe, it, expect, vi } from 'vitest';
import { makeLoginLimiter } from '../lib/rate-limit';

describe('makeLoginLimiter', () => {
  it('retorna um middleware express (função de 3 args)', () => {
    const mw = makeLoginLimiter();
    expect(typeof mw).toBe('function');
    expect(mw.length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 4: Criar `src/lib/rate-limit.ts`**

```ts
import rateLimit from 'express-rate-limit';

export function makeLoginLimiter() {
  const base = {
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
  };
  if (process.env.REDIS_URL) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { RedisStore } = require('rate-limit-redis');
    const Redis = require('ioredis');
    const client = new Redis(process.env.REDIS_URL);
    return rateLimit({ ...base, store: new RedisStore({ sendCommand: (...args: string[]) => client.call(...args) }) });
  }
  return rateLimit(base);
}
```

- [ ] **Step 5: Usar no `auth.ts`** — substituir o `loginLimiter` inline por `makeLoginLimiter()`.

- [ ] **Step 6: Cache do rastreio no Redis** — em `src/lib/cache.ts`, trocar `node-cache` por um wrapper que usa Redis quando `REDIS_URL` existe (mesmas assinaturas `get`/`set` que `public.ts` consome), mantendo `node-cache` como fallback local.

- [ ] **Step 7: Logs** — não migrar o array em memória para Redis. Em vez disso, garantir que os logs vão para `stdout` (já vão via `console.*` no `server-logger`) e usar o coletor do host (Render/Cloud Run agregam stdout). O endpoint `/api/debug/logs` (owner-only) passa a ser "melhor esforço da instância atual"; documente isso.

- [ ] **Step 8: Gate + smoke**
```powershell
npm run verify
```
Smoke: com `REDIS_URL` setado, faça 11 logins errados e confirme o 11º bloqueado **mesmo alternando entre instâncias** (ou simule reiniciando o processo — o contador persiste no Redis).

- [ ] **Step 9: Commit**
```powershell
git add src/lib/rate-limit.ts src/lib/cache.ts src/routes/auth.ts src/test/rate-limit-store.test.ts package.json package-lock.json docs/DEPLOY.md
git commit -m @'
feat(infra): rate-limit e cache em Redis para deploy multi-instancia

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] Instância única: premissa documentada e `maxInstances=1` configurado. **OU**
- [ ] Multi-instância: rate-limit/cache em Redis; teste do 11º login bloqueado entre instâncias.
- [ ] `npm run verify` verde.

## Nota

- Escolha o caminho pelo alvo da Tarefa 01. Não adicione Redis se o deploy é de instância única — seria complexidade sem ganho (YAGNI).
