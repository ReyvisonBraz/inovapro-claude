# Fase 0 — Preparação e Destravamento do Build

**Por que primeiro:** hoje `npx tsc --noEmit` falha com 11 erros porque o Prisma Client gerado não conhece a coluna `version`, e a migration que a cria (`20260704120000_add_version_columns`) nunca foi aplicada no banco. Enquanto isso não for resolvido: (a) o "lint" do projeto está vermelho, então nenhum gate de tipo é confiável; (b) **toda operação de escrita quebra em runtime** (salvar OS, receber pagamento, editar transação, estoque, settings) porque o código já referencia `version`. Nada mais deve ser feito antes disto.

**Contexto do repo:** existe um documento operacional prévio, [../../PENDENTE-APLICAR-MIGRATIONS.md](../../PENDENTE-APLICAR-MIGRATIONS.md), com o passo a passo de banco. A tarefa `02` deste diretório o incorpora e o substitui; ao final, aquele documento deve ser apagado.

## Arquivos desta fase (ordem)

| # | Arquivo | Entrega |
|---|---------|---------|
| 01 | `01-worktree-e-baseline.md` | Branch/worktree isolado + baseline registrado (tsc/tests) + scripts de verificação |
| 02 | `02-aplicar-migration-version.md` | Migration aplicada no banco + Prisma Client regenerado → `tsc` **verde** + smoke test de escrita |

## Definition of Done da Fase 0

- [ ] Trabalho ocorre em branch dedicado (não em `main`).
- [ ] `npx tsc --noEmit` termina **sem erros** (era 11).
- [ ] `npx vitest run` continua verde (5 arquivos / 50 testes).
- [ ] `npx prisma migrate status` reporta **0 migrations pendentes**.
- [ ] Um `PUT`/`PATCH` real (ex.: ajustar estoque) grava sem erro de coluna inexistente.
- [ ] `docs/PENDENTE-APLICAR-MIGRATIONS.md` removido.
