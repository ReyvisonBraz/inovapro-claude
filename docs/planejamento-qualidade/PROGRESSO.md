# Progresso da Execução — Saneamento de Qualidade

> Rastreador vivo. Atualizar ao concluir cada tarefa. Última atualização: **2026-07-09**.
> Branch de trabalho: `qualidade/fase-0-preparacao` (~25 commits à frente de `main`).
> Estado do build a cada commit: **ESLint 0 erros · `tsc` 0 erros (strict on) · 105 testes verdes** (baseline eram 50) + **E2E Playwright**. **Fases 0–5 completas; Fase 6 quase (só itens opcionais/arriscados).**
>
> **Deploy decidido: Vercel** (ver `docs/DEPLOY.md`). **Purga do histórico git de `backups/` FEITA em 2026-07-09** (ver Fase 1·03). Restam só itens opcionais: prop drilling e datas String→DateTime (Fase 6·02/03), + ações de infra do dono (setar `REDIS_URL`, **trocar senha do banco**).

## Legenda
✅ concluído · 🟡 parcial/adiado · ⬜ não iniciado

---

## Fase 0 — Preparação ✅
- ✅ Branch isolado + scripts `typecheck`/`verify` + baseline registrado.
- ✅ `postinstall: prisma generate` (build verde em clone novo/CI).
- ✅ Migration `version` confirmada aplicada no banco; `PENDENTE-APLICAR-MIGRATIONS.md` removido.
- **Descoberta:** o banco já tinha as colunas `version`; o `tsc` quebrava só por client desatualizado. B2 era menos grave que o estimado.

## Fase 1 — BLOCKERS 🟡 (código ✅; ops com o dono)
- ✅ **01 RBAC** — `requireRole`/`requirePermission` aplicados; escalada de privilégio fechada. Testes supertest.
- ✅ **02 CORS/CSP** — origem desconhecida negada; CSP reativada. Smoke de boot ok.
- ✅ **03 Purga de segredos** — untrack `backups/` + `.gitignore` **e histórico reescrito em 2026-07-09**: `git filter-repo --path backups --invert-paths`, force-push de `main` (`c7c9b05`→`8a1ff29`) e `qualidade` (`8eaf30c`→`fb5135b`); branches antigas `claude/os-print-layout-adjustments-ncYT9` e `railway/fix-deploy-ee9af3` **deletadas do origin** (também carregavam os blobs de `backups/`). Verificado: **0 objetos `backups` em qualquer ref**. Bundle de backup pré-purga salvo no scratchpad da sessão. Rotação de segredos: secrets já trocadas pelo dono; **senha do banco ainda a trocar** (belt-and-suspenders — o GitHub pode reter objetos órfãos acessíveis só por SHA direto até o GC interno).
- ✅ **04 Audit trail** — `createdBy`/`updatedBy` derivam do JWT (`req.user`), não do body. Testes.

## Fase 2 — Hardening Backend ✅
- ✅ **01 bcrypt async** · ✅ **02 IDOR→token** (migration aplicada + backfill + smoke) · ✅ **03 índices** (migration aplicada) · ✅ **04 validação Zod** · ✅ **05 endpoints de diagnóstico**.

## Fase 3 — Tipagem e Lint ✅
- ✅ **01 ESLint** — flat config (react-hooks + unused-imports); CI roda lint+typecheck+testes. Corrigiu 2 bugs de hooks (Pagination, DrillDownModal) e o link WhatsApp (`?osId`→`?t`).
- ✅ **02 console** — `console.log/info/debug` removidos; `no-console` = **error**. `no-explicit-any` segue **warning** (debt).
- ✅ **03 strict TS** — **`"strict": true` ativado, `tsc` 0 erros + build Vite verde + 76 testes.** Corrigiu os 31 erros, incluindo 2 bugs reais: `ref` manual sobrescrito pelo `register` no AddTransactionModal (foco quebrado) e `interface User` local divergente no Login. `scripts/` excluído do tsconfig.
- ✅ **04 JWT httpOnly** — **feito e validado.** Token agora em cookie `httpOnly`+`Secure`(prod)+`SameSite`; `requireAuth` lê cookie ou header (transição); `/api/me` reidrata sessão; `/api/logout` limpa. Front: `withCredentials`, sem token no localStorage, bootstrap via `/me`. **Validado com Playwright real** (login→/dashboard, cookie httpOnly inacessível a JS, sessão persiste no reload) e curl. **Follow-up:** remover o fallback do header `Authorization` numa limpeza futura; conferir cookies cross-site no deploy (SameSite=None+Secure) — ver Fase 5.

## Fase 4 — Testes ✅
- ✅ **01 cobertura honesta** — `coverage.include` cobre routes/services/middleware/schemas; thresholds como catraca (piso ~24% linhas); CI roda `test:coverage`.
- ✅ **02 integração de rotas** — helper `src/test/helpers/testApp.ts` + suítes por grupo (transactions, customers, client-payments, service-orders, inventory): GET/lista, validação 400, happy-path, delete. **104 testes** no total (eram 50).
- ✅ **03 E2E Playwright** — `playwright.config.ts` (sobe API+front sozinho) + `e2e/smoke.spec.ts` (login→dashboard, cookie httpOnly inacessível a JS, sessão persiste no reload). **Validado num chromium real.** Senha via `E2E_PASS` (não commitada); `npm run e2e`.
- **Nota herdada:** testes de backend com supertest precisam de `// @vitest-environment node` + `server.close()` (o MSW global intercepta as requisições GET, mascarando o handler real). Padrão usado em todas as suítes de rota.
- **Follow-up:** subir a cobertura ao longo do tempo (services têm muita lógica ainda não coberta); considerar job de E2E no CI (com secret `E2E_PASS` + browser).

## Fase 5 — Deploy/Infra ✅
- ✅ **01 deploy único = Vercel** (decidido pelo dono). O `vercel.json` serve o front estático + a API serverless (`api/index.ts`) no mesmo domínio. **Removidas** as configs concorrentes: `render.yaml`, `cloudbuild.yaml`, `Dockerfile`, `scripts/deploy-cloud-run.sh`. Documentado em [`docs/DEPLOY.md`](../DEPLOY.md).
- ✅ **02 resíduo SQLite** — `better-sqlite3` removido e o `Dockerfile` (com o resquício SQLite) removido de vez.
- ✅ **03 rate-limit em Redis** — `src/lib/rate-limit.ts` (`makeLoginLimiter`): usa Redis se `REDIS_URL`, senão memória. Importante na Vercel (serverless): o rate-limit in-memory não protege entre instâncias — **setar `REDIS_URL` (ex.: Upstash) em produção** para o brute-force de login ser barrado. Cache do rastreio segue `node-cache` (TTL 2 min, aceitável).

## Fase 6 — Docs e Limpeza 🟡
- ✅ **01 deps mortas** — `better-sqlite3`, `ts-morph` removidos; `vite` deduplicado (só devDeps).
- ✅ **02 prop drilling** — `ClientPayments` refatorado: **24 → 14 props**, consumindo estado de UI direto dos stores Zustand (`useAppStore`/`useFilterStore`/`useModalStore`) em vez de repasse manual do pai. Teste de caracterização no nível da página (`src/test/ClientPaymentsPage.behavior.test.tsx`, RTL+MSW) verde antes/depois; `useEffect` de deps incompletas corrigido (lê o form store via `getState()`); um `as any` trocado pelo union de `sortMode`. **Follow-up:** replicar o padrão em `Transactions`/`ServiceOrders`; **validar visualmente no app antes do merge** (o teste cobre lista+abertura de modal, não o layout).
- ⬜ **03 datas String→DateTime** — não feito. Migração no banco de **produção** com conversão de dados; risco médio, **opcional**. Ver `fase-6-docs-e-limpeza/03-datas-string-para-datetime.md`.
- ✅ **04 docs/links** — links quebrados do README corrigidos (STATUS.md/PLANO-SANEAMENTO removidos → aponta para `docs/planejamento-qualidade/`); typo do PWA (`inovaproo` → `*.vercel.app`); `.env.example` com novas envs (PUBLIC_API_ORIGIN, E2E).

---

## Pendências que dependem do DONO
1. ✅ ~~**Purga do histórico do git** de `backups/`~~ — **FEITA em 2026-07-09** (`git filter-repo` + force-push; branches antigas deletadas). Quem tiver clone antigo precisa **re-clonar** (o histórico mudou).
2. **Trocar a senha do banco** (`DATABASE_URL`/`DB_PASSWORD`) — mencionado que faria depois. **Importante agora**: reforça a purga (o GitHub pode reter objetos órfãos até o GC).
3. ~~Fornecer credencial de teste~~ — **fornecida** (`admin`/`admin2021`), F3-04 validado. E2E da Fase 4 desbloqueado. *(Idealmente criar um usuário de teste dedicado em vez de usar o admin.)*

## Retomada rápida (próxima sessão)

> ✅ Branch `qualidade/fase-0-preparacao` merged em `main` (2026-07-09). Branch remoto e branches locais stale (`claude/os-print-layout-adjustments-ncYT9`, `railway/fix-deploy-ee9af3`) deletadas.

### Pendências do DONO (ações de infra)
- [ ] **Trocar a senha do banco** (`DATABASE_URL`/`DB_PASSWORD`) — reforça a purga do git.
- [ ] **Setar `REDIS_URL`** (ex.: Upstash) na Vercel — rate-limit de login funcional em serverless.
- [ ] Criar usuário de teste dedicado (em vez de `admin`/`admin2021`).

### Próximas melhorias (ver plano geral `docs/plans/2026-07-04-plano-melhorias-geral.md`)
- **Fase 2 (Segurança)** — itens 2.3-2.4 não cobertos pelo saneamento: JWT refresh/revalidação, rate-limit geral, hash `settingsPassword`, `sendPulseClientSecret` para env.
- **Fase 3 (Multi-user UX)** — ConflictModal para 409, realtime/polling, idempotency keys, draft autosave.
- **Fase 4 (Schema)** — Float→Decimal, String→DateTime, `paymentHistory`→tabela `PaymentEntry`, FK de status.
- **Fase 5 (Frontend)** — server state out of Zustand, consolidar modais, split componentes gigantes, Header lazy hooks, estados unificados.
- **Fase 6 (Qualidade)** — `asyncHandler` + error handler central, POST→201/DELETE→204, customer optimistic locking.
- **Fase 6-02 (prop drilling)** — replicar o padrão do ClientPayments em Transactions e ServiceOrders.
- **Fase 6-03 (datas String→DateTime)** — opcional, risco médio.
