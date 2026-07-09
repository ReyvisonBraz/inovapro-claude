# Fase 6 · Tarefa 01 — Dependências mortas e duplicadas

**Goal:** Enxugar o `package.json`: `vite` aparece em `dependencies` **e** `devDependencies`; `ts-morph` está em `dependencies` sem uso no `src/`; possivelmente outras órfãs. Menos deps = build mais rápido, superfície menor, menos CVEs.

**Architecture:** Usar `depcheck` para listar candidatos, confirmar manualmente cada um (algumas deps são usadas só em runtime/tooling e o depcheck dá falso positivo) e remover com segurança rodando o gate após cada remoção.

## Interfaces

- **Produz:** `package.json`/`package-lock.json` enxutos; nenhuma mudança de código de app (salvo remoção de import morto).

---

- [ ] **Step 1: Rodar depcheck**

Run:
```powershell
npx depcheck
```
Anote as listas "Unused dependencies" e "Unused devDependencies". Candidatos esperados do review: `ts-morph`, `better-sqlite3` (já removido na Fase 5), duplicata de `vite`.

- [ ] **Step 2: Remover a duplicata de `vite`**

`vite` deve ficar **só** em `devDependencies` (é ferramenta de build). Remova a entrada de `dependencies`:
```powershell
npm uninstall vite ; npm install -D vite@^6.2.0
```
> Confirme que `tsx`, `prisma`, `@prisma/client` permanecem em `dependencies` (são runtime — o Dockerfile roda `tsx server.ts` em produção).

- [ ] **Step 3: Avaliar `ts-morph`**

Confirme que não é usado (editor/grep por `ts-morph` em `src/`, `scripts/`, `server.ts`). Se for só de um script histórico já arquivado (Fase 5), remova:
```powershell
npm uninstall ts-morph
```

- [ ] **Step 4: Avaliar as demais do depcheck com cuidado (falsos positivos comuns)**

Não remova às cegas. Verifique caso a caso:
- `@supabase/supabase-js` / `supabase`: `src/lib/supabase-standby.ts` está "comentado/standby". Se realmente não há uso ativo, mova para devDependencies ou remova; se há intenção de uso próximo, deixe e anote.
- `autoprefixer`/`tailwindcss`/`@tailwindcss/vite`: usados pelo build — **manter** (depcheck às vezes não detecta via config).
- `playwright`/`@playwright/test`: usados pelo E2E (Fase 4) — manter.
- `msw`, `@testing-library/*`, `jsdom`: usados nos testes — manter.

- [ ] **Step 5: Gate após cada remoção**

Após cada `npm uninstall`, rode:
```powershell
npm run verify
npm run build
```
Esperado: ambos verdes. Se o build quebrar, a dep era usada — reinstale.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json
git commit -m @'
chore(deps): remove deps mortas/duplicadas (vite dup, ts-morph)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `vite` só em `devDependencies`; `ts-morph` removido (se confirmado morto).
- [ ] `npm run verify` e `npm run build` verdes.
- [ ] Decisões sobre deps ambíguas (Supabase) registradas no commit/PR.
