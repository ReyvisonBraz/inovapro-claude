# Progresso da Execução — Saneamento de Qualidade

> Rastreador vivo. Atualizar ao concluir cada tarefa. Última atualização: **2026-07-09**.
> Branch de trabalho: `qualidade/fase-0-preparacao` (~25 commits à frente de `main`).
> Estado do build a cada commit: **ESLint 0 erros · `tsc` 0 erros (strict on) · 104 testes verdes** (baseline eram 50) + **E2E Playwright**. **Fases 0–4 completas; 5–6 no que é seguro/desbloqueado.**
>
> **Restam só itens que dependem de você:** escolher a estratégia de deploy (Fase 5·01), e, se quiser, o refactor de prop drilling e a migração de datas (Fase 6·02/03, opcionais/arriscados).

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
- 🟡 **03 Purga de segredos** — parte segura feita (untrack `backups/` + `.gitignore`). **PENDENTE (dono):** reescrever histórico do git (`git filter-repo --path backups --invert-paths` + `push --force`). Rotação de segredos: **feita pelo dono** (secrets não usadas/trocadas; senha do banco será trocada depois).
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

## Fase 5 — Deploy/Infra 🟡
- ⬜ **01 escolher 1 deploy** — **DECISÃO DO DONO.** Existem 4 configs (Vercel/Render/Cloud Run/Cloud Build). Recomendado: **Render** (serviço único). Não removi as configs concorrentes porque não sei qual está em produção — apagar a errada derruba o app. Ver `fase-5-deploy-infra/01-escolher-deploy-unico.md`.
- 🟡 **02 resíduo SQLite** — parcial: `better-sqlite3` removido (Fase 6·01) e Dockerfile limpo (dir SQLite removido). Falta o `DB_PATH`/env SQLite no `render.yaml` (fazer junto da decisão de deploy). **Bônus:** corrigi o Dockerfile para o `postinstall prisma generate` funcionar (copia `prisma/` antes do `npm ci`) — **não testado com build docker real**.
- ⬜ **03 rate-limit/cache externos** — só necessário se o deploy for multi-instância. Se instância única (Render free), o in-memory atual serve. Condicional à decisão 01.

## Fase 6 — Docs e Limpeza 🟡
- ✅ **01 deps mortas** — `better-sqlite3`, `ts-morph` removidos; `vite` deduplicado (só devDeps).
- ⬜ **02 prop drilling** — não feito. Refactor de UI (ex.: `ClientPayments` ~28 props) — arriscado sem testes de componente; fazer com validação no app.
- ⬜ **03 datas String→DateTime** — não feito. Migração no banco de **produção** com conversão de dados; risco médio, **opcional**. Ver `fase-6-docs-e-limpeza/03-datas-string-para-datetime.md`.
- ✅ **04 docs/links** — links quebrados do README corrigidos (STATUS.md/PLANO-SANEAMENTO removidos → aponta para `docs/planejamento-qualidade/`); typo do PWA (`inovaproo` → `*.vercel.app`); `.env.example` com novas envs (PUBLIC_API_ORIGIN, E2E).

---

## Pendências que dependem do DONO
1. **Purga do histórico do git** de `backups/` (Fase 1 · 03 parte B) — `git filter-repo` + `push --force`; avisar quem tem clone.
2. **Trocar a senha do banco** (`DATABASE_URL`/`DB_PASSWORD`) — mencionado que faria depois.
3. ~~Fornecer credencial de teste~~ — **fornecida** (`admin`/`admin2021`), F3-04 validado. E2E da Fase 4 desbloqueado. *(Idealmente criar um usuário de teste dedicado em vez de usar o admin.)*

## Retomada rápida (próxima sessão)
- Concluir **F3-03** (strict) seguindo `_strict-baseline.md` — ~31 fixes mecânicos/bounded, validar telas OS/pagamentos/relatórios/transações.
- Concluir **F3-04** (JWT httpOnly) seguindo o arquivo da tarefa — com login de teste.
- Seguir para **Fase 4**.
- Considerar abrir PR `qualidade/fase-0-preparacao` → `main` com Fases 0–2 + F3-01/02 (tudo verde) para colher o ganho de segurança já.
