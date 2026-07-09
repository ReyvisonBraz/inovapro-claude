# Planejamento de Qualidade — INOVA PRO

> **Para executores (humano ou agente):** SUB-SKILL RECOMENDADA: use `superpowers:subagent-driven-development` ou `superpowers:executing-plans` para executar cada arquivo de tarefa passo a passo. Os passos usam checkbox (`- [ ]`) para rastreio. **Nunca** marque um passo como feito sem rodar o comando de verificação e ver a saída esperada.

**Objetivo:** Elevar o INOVA PRO de "inseguro e com build quebrado" para "seguro, tipado, testado e com deploy único", corrigindo — em etapas revisáveis — todos os achados do code review de 2026-07-06, sem regressão funcional.

**Princípio-guia:** Qualidade acima de velocidade. Cada tarefa entrega algo testável e revisável isoladamente, segue TDD (teste falha → implementa → teste passa → commit) e mantém o `tsc` e a suíte verdes ao final.

**Arquitetura do trabalho:** Um branch/worktree isolado por fase. Dentro de cada fase, um arquivo `.md` por correção (unidade de review). A ordem entre fases é obrigatória (há dependências); a ordem entre arquivos de uma mesma fase está indicada no `README.md` da fase.

**Stack:** React 19 + Vite 6 + TypeScript 5.8 (frontend) · Express 4.21 + Prisma 7.8 + PostgreSQL (backend) · Zod 4 · Vitest 4 · MSW 2. SO de trabalho: Windows 11 + PowerShell (shell primário) e Git Bash disponível.

---

## Global Constraints (valem para TODAS as tarefas)

Copie estes valores verbatim; toda tarefa os herda implicitamente.

- **Gate de build:** `npx tsc --noEmit` deve terminar **sem erros** ao final de cada tarefa. Hoje ele falha com 11 erros (resolvidos na Fase 0). Nenhum commit de tarefa pode aumentar o número de erros de tipo.
- **Gate de testes:** `npx vitest run` deve terminar verde. Baseline atual: **5 arquivos, 50 testes**. Nenhuma tarefa pode reduzir esse número nem deixar teste vermelho.
- **Semântica de concorrência:** preservar o lock otimista por coluna `version` (`updateMany` com `where: { id, version }` + `data: { version: { increment: 1 } }`). Não remover nem burlar.
- **Idioma:** mensagens de erro e logs em português, no mesmo tom do código existente (ex.: `'Credenciais inválidas'`, `'Erro interno do servidor'`).
- **Sem `any` novo:** nenhuma tarefa pode introduzir `any`/`as any` novos. Reduzir os existentes é bem-vindo (Fase 3).
- **Commits pequenos e frequentes:** um commit por passo lógico, mensagem no formato `tipo(escopo): descrição` (ex.: `fix(auth): aplica requireRole em /api/users`). Finalize mensagens de commit com a linha `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Nunca commitar segredos** nem arquivos de `backups/` (ver Fase 1, tarefa 03).
- **Prisma:** após qualquer alteração em `prisma/schema.prisma`, rodar `npx prisma generate` no mesmo commit e, se houver DDL, criar migration versionada.

---

## Mapa das Fases

| Fase | Pasta | Foco | Severidade | Bloqueia deploy? |
|:----:|-------|------|-----------|:----------------:|
| 0 | `fase-0-preparacao/` | Worktree isolado + destravar build (aplicar migration `version`, regenerar Prisma Client) | Pré-requisito | ✅ |
| 1 | `fase-1-blockers/` | Autorização RBAC, CORS/Helmet, purga de segredos do git, audit trail confiável | 🔴 BLOCKER | ✅ |
| 2 | `fase-2-hardening-backend/` | bcrypt async, IDOR do rastreio, índices no banco, validação Zod universal, endpoints de diagnóstico | 🟠 MAJOR | Parcial |
| 3 | `fase-3-tipagem-e-lint/` | `strict` no TS, ESLint (hooks/imports), remover `console.*` e `any`, JWT httpOnly | 🟠/🟡 | ❌ |
| 4 | `fase-4-testes/` | Testes de integração de rota (supertest), cobertura honesta (incluir routes/services), E2E com Playwright | 🟠 MAJOR | ❌ |
| 5 | `fase-5-deploy-infra/` | Escolher 1 estratégia de deploy, remover resíduo SQLite, rate-limit/cache externos (Redis) para serverless | 🟠 MAJOR | Parcial |
| 6 | `fase-6-docs-e-limpeza/` | Deps mortas (`better-sqlite3`, `ts-morph`, `vite` duplicado), prop drilling, docs e links quebrados | 🟡 MINOR | ❌ |

## Grafo de dependências (ordem obrigatória)

```
Fase 0  ──►  Fase 1  ──►  Fase 2  ──►  Fase 4
              │             │
              └──► Fase 3 ◄─┘
                    │
                    └──►  Fase 5  ──►  Fase 6
```

- **Fase 0 é pré-requisito absoluto**: sem o build verde, nenhum teste novo de tipo confia.
- **Fase 1 antes de tudo mais**: os BLOCKERS são exploráveis em produção agora.
- Fase 3 (ESLint/strict) pode correr em paralelo à Fase 2 se houver dois executores, mas o ideal em modo "qualidade" é sequencial.
- Fase 4 (testes de rota) só rende depois que rotas e autorização estabilizam (Fases 1–2).

## Rastreabilidade: achado do review → arquivo de tarefa

| Achado do review | Onde é corrigido |
|------------------|------------------|
| B1 — Backend sem autorização | `fase-1-blockers/01-autorizacao-rbac.md` |
| B2 — Migration `version` pendente + Prisma Client desatualizado / `tsc` falha | `fase-0-preparacao/02-aplicar-migration-version.md` |
| B3 — CORS libera tudo + CSP desligado | `fase-1-blockers/02-cors-e-helmet.md` |
| B4 — Hashes/segredos/PII versionados em `backups/` | `fase-1-blockers/03-purgar-segredos-git.md` |
| M1 — bcrypt síncrono | `fase-2-hardening-backend/01-bcrypt-async.md` |
| M2 — IDOR `/api/public/os/:id` | `fase-2-hardening-backend/02-idor-token-os.md` |
| M3 — Sem índices no banco | `fase-2-hardening-backend/03-indices-db.md` |
| M4 — `/api/db-test` e `/api/ping` vazam ambiente | `fase-2-hardening-backend/05-endpoints-diagnostico.md` |
| M5 — `createdBy`/`updatedBy` do body (audit trail) | `fase-1-blockers/04-audit-trail-req-user.md` |
| M6 — Validação Zod inconsistente | `fase-2-hardening-backend/04-validacao-zod.md` |
| M7 — Cobertura enganosa / sem integração/E2E | `fase-4-testes/` |
| M8 — 4 deploys conflitantes + resíduo SQLite | `fase-5-deploy-infra/` |
| M9 — `tsc` como lint / sem ESLint | `fase-3-tipagem-e-lint/` |
| M10 — JWT em localStorage | `fase-3-tipagem-e-lint/` |
| Minors (console, any, prop drilling, datas String, docs, deps mortas) | `fase-3-tipagem-e-lint/` e `fase-6-docs-e-limpeza/` |

## Como usar este planejamento

1. Leia o `README.md` da fase antes de abrir os arquivos de tarefa.
2. Execute os arquivos na ordem numérica (`01-`, `02-`, ...).
3. Em cada arquivo, siga os passos com checkbox de cima para baixo. Não pule o passo "rodar o teste e ver falhar" — ele prova que o teste testa algo.
4. Ao terminar uma fase, rode o **Definition of Done da fase** (no `README.md` dela) e só então abra a próxima.

## Definition of Done (global — vale para encerrar o projeto)

- [ ] `npx tsc --noEmit` sem erros.
- [ ] `npx vitest run` verde, com cobertura incluindo `src/routes/**` e `src/services/**` (Fase 4).
- [ ] Nenhuma rota de escrita acessível sem a role/permissão correta (Fase 1).
- [ ] `git log` e a árvore de trabalho sem `backups/` nem segredos; segredos rotacionados (Fase 1).
- [ ] Uma única estratégia de deploy documentada e funcional (Fase 5).
- [ ] `README.md` e `.env.example` batem com a realidade; links não quebrados (Fase 6).

---

**Status de escrita deste planejamento:** Fases 0 a 6 detalhadas (TDD, passo a passo), todas com arquivos de tarefa próprios.

**➡️ Estado da EXECUÇÃO:** ver [`PROGRESSO.md`](./PROGRESSO.md) (rastreador vivo). Resumo: **Fases 0–5 ✅** (segurança, tipagem/strict, JWT httpOnly, testes+E2E, deploy Vercel), **Fase 6 quase completa** (deps/docs ✅; prop drilling e datas String→DateTime opcionais). Os objetivos globais do plano foram atingidos.
