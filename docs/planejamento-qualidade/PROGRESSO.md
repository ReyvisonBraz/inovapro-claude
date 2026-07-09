# Progresso da Execução — Saneamento de Qualidade

> Rastreador vivo. Atualizar ao concluir cada tarefa. Última atualização: **2026-07-09**.
> Branch de trabalho: `qualidade/fase-0-preparacao` (~21 commits à frente de `main`).
> Estado do build a cada commit: **ESLint 0 erros · `tsc` 0 erros (strict on) · 79 testes verdes** (baseline eram 50). **Fases 0–3 completas.**

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

## Fase 4 — Testes ⬜
- ⬜ cobertura honesta (incluir routes/services) · ⬜ integração de rotas · ⬜ E2E Playwright.
- **Nota herdada:** testes de backend com supertest precisam de `// @vitest-environment node` + `server.close()` (o MSW global intercepta as requisições GET, mascarando o handler real). Padrão já usado em `authz.routes.test.ts` etc.

## Fase 5 — Deploy/Infra ⬜
- ⬜ escolher 1 deploy (recomendado: Render) · ⬜ remover resíduo SQLite · ⬜ rate-limit/cache externos (só se multi-instância).

## Fase 6 — Docs e Limpeza ⬜
- ⬜ deps mortas · ⬜ prop drilling · ⬜ datas String→DateTime · ⬜ docs/links.

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
