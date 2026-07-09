# Fase 6 · Tarefa 04 — Documentação: links quebrados, README e `.env.example`

**Goal:** Alinhar a documentação ao estado real. Hoje o [../../../README.md](../../../README.md) linka `STATUS.md` e `docs/PLANO-SANEAMENTO-INOVA-PRO.md` que **não existem**, afirma que `lint` passou (estava quebrado antes da Fase 0), e há um typo de domínio no PWA (`inovaproo.vercel.app`). Docs antigos ainda mencionam SQLite/Supabase como plano ativo.

**Architecture:** Varredura de links, atualização do README com os comandos e o estado reais (pós-fases), verificação de que `.env.example` cobre todas as env em uso, e nota sobre a denormalização de dados (campos duplicados) para quem for mexer.

## Interfaces

- **Produz:** README/docs sem links quebrados; `.env.example` completo; nota de arquitetura sobre denormalização.

---

- [ ] **Step 1: Encontrar links quebrados no README e docs**

Verifique cada link relativo do `README.md` e dos `docs/*.md`. Os conhecidos:
- `./STATUS.md` → não existe. Remova o link **ou** crie um `STATUS.md` curto.
- `./docs/PLANO-SANEAMENTO-INOVA-PRO.md` → não existe. Substitua pelo ponteiro para este planejamento: `./docs/planejamento-qualidade/README.md`.
- `./docs/README.md` → existe; confira que o conteúdo bate.

- [ ] **Step 2: Atualizar o README**

- Trocar a seção "Estado Atual" (que cita "validado em 26 de maio... lint passou... 4 arquivos e 36 testes") pelos números reais atuais (após Fase 0: `tsc` verde; após Fases 1–4: contagem real de testes, `npm run verify`).
- Apontar "Documentacao" para `docs/planejamento-qualidade/` como a referência de qualidade/roadmap.
- Confirmar que os comandos (`npm run dev`, `lint`, `test`, `build`, `verify`) batem com o `package.json` pós-Fase 3 (`lint` agora é ESLint).

- [ ] **Step 3: Corrigir o typo de domínio no PWA**

Em `vite.config.ts`, o `runtimeCaching.urlPattern` referencia `inovaproo.vercel.app` (dois "o"). Ajuste para o domínio real do produto (o CORS usa `inovapro-theta.vercel.app`), ou generalize para o padrão que fizer sentido. Rode `npm run build` para validar.

- [ ] **Step 4: Conferir `.env.example` vs env realmente usadas**

Liste as `process.env.*` e `import.meta.env.*` do código e cruze com o `.env.example`:
```powershell
# server/back
Select-String -Path server.ts, src/**/*.ts -Pattern "process\.env\.[A-Z_]+" | ForEach-Object { $_.Matches.Value } | Sort-Object -Unique
# front
Select-String -Path src/**/*.ts, src/**/*.tsx -Pattern "import\.meta\.env\.[A-Z_]+" | ForEach-Object { $_.Matches.Value } | Sort-Object -Unique
```
Garanta que **toda** env em uso está no `.env.example`, incluindo as novas das fases anteriores: `PUBLIC_API_ORIGIN` (Fase 1 CSP), `REDIS_URL` (Fase 5, se aplicável), `TEST_DATABASE_URL`/`E2E_USER`/`E2E_PASS` (Fase 4). Remova do `.env.example` as que não existem mais (ex.: `DB_PATH` SQLite).

- [ ] **Step 5: Documentar a denormalização de dados**

Crie (ou acrescente a `docs/ARCHITECTURE.md`) uma nota: `ServiceOrder` guarda `firstName/lastName/phone` e `Transaction` guarda `customerName/customerPhone` — **cópias** do `Customer`. `customer.service.update` faz cascade para propagar mudanças; quem editar essas entidades deve manter a cópia sincronizada (ou considerar remover a denormalização e sempre juntar via `customerId`). Isso evita bugs de "nome antigo" em telas.

- [ ] **Step 6: Sanear docs que citam SQLite/Supabase como plano ativo**

Revise `docs/*.md` (ex.: `SUPABASE-EDGE-DEPLOY.md`, `ARCHITECTURE.md`) e marque claramente o que é histórico. O README já avisa que "documentos antigos podem mencionar SQLite/Supabase" — mova esses para `docs/_historico/` ou adicione um cabeçalho `> ⚠️ Histórico — a referência atual é Express + Prisma + PostgreSQL`.

- [ ] **Step 7: Validar que não há mais links quebrados**

Se possível, rode um verificador de links markdown (ex.: `npx markdown-link-check README.md`) ou revise manualmente. Nenhum link relativo deve apontar para arquivo inexistente.

- [ ] **Step 8: Commit**

```powershell
git add README.md docs/ vite.config.ts .env.example
git commit -m @'
docs: corrige links quebrados, atualiza README/.env.example e domina PWA

- remove links para STATUS.md/PLANO-SANEAMENTO inexistentes
- aponta para docs/planejamento-qualidade
- corrige typo de dominio no PWA; documenta denormalizacao
- sanea docs historicos (SQLite/Supabase)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] Nenhum link relativo quebrado no README/docs.
- [ ] README reflete comandos e estado reais (pós-fases).
- [ ] `.env.example` cobre todas as env em uso e nada obsoleto.
- [ ] Denormalização documentada; docs históricos marcados.

## Encerramento do planejamento

Concluída esta tarefa, revise o **Definition of Done global** no [índice mestre](../README.md). Se todos os itens estiverem marcados, o projeto saiu de "inseguro e com build quebrado" para "seguro, tipado, testado, com deploy único e documentado".
