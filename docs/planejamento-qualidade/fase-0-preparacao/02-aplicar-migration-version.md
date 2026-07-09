# Fase 0 · Tarefa 02 — Aplicar migration `version` e regenerar Prisma Client

**Goal:** Deixar `npx tsc --noEmit` **verde** e o banco compatível com o código de lock otimista da Fase 1 (anterior), aplicando a migration `20260704120000_add_version_columns` e regenerando o Prisma Client.

**Architecture:** Duas causas do problema, dois passos. (1) O Prisma Client em `node_modules` está desatualizado → `prisma generate` conserta os 11 erros de tipo (os tipos vêm do `schema.prisma`, que já tem `version`). (2) O banco de produção não tem as colunas → `prisma migrate deploy` aplica o DDL. Ambos são necessários: só gerar deixa o `tsc` verde mas o runtime ainda quebra; só migrar não conserta o `tsc`.

**Pré-condição crítica:** é necessário ter `DATABASE_URL` no `.env` apontando para o banco correto. Este projeto usa PostgreSQL (Supabase/Neon/Railway conforme o painel de deploy). **Não prossiga a partir do Step 4 se `migrate status` não conectar.**

## Interfaces

- **Consome:** branch e scripts da Tarefa 01.
- **Produz:** `@prisma/client` regenerado com `version` em todos os models; banco com as colunas `version`; `tsc` verde. Nenhuma assinatura de função muda.

---

- [ ] **Step 1: Conferir o alvo do banco (sem escrever nada)**

Run:
```powershell
npx prisma migrate status
```
Esperado: conecta e lista **2 migrations pendentes** (`0_baseline` e `20260704120000_add_version_columns`) **ou** apenas `20260704120000_add_version_columns` pendente (se o baseline já estiver marcado como aplicado). Se der erro de conexão, o problema é a `DATABASE_URL` — pare e resolva antes.

- [ ] **Step 2: Backup do banco (segurança antes de DDL)**

O repo tem um exportador em `scripts/`. Rode o backup e guarde-o **fora** do git (a purga de `backups/` acontece na Fase 1):

```powershell
node scripts/export-data.mjs
```
> Se o nome do script for outro, liste `scripts/` e use o de export. O objetivo é ter um dump antes do `ALTER TABLE`. Mova o resultado para uma pasta fora do repositório (ex.: `..\inovapro-backups\`).

- [ ] **Step 3: Regenerar o Prisma Client (conserta o `tsc`)**

Run:
```powershell
npx prisma generate
```
Esperado: `Generated Prisma Client ...` sem erro.

- [ ] **Step 4: Verificar que o typecheck ficou VERDE**

Run:
```powershell
npm run typecheck
```
Esperado: **0 erros** (eram 11). Este é o critério central da tarefa. Se ainda houver erros sobre `version`, o `generate` usou um schema/engine errado — confira `prisma.config.ts` e o `provider` em `schema.prisma`.

- [ ] **Step 5: Aplicar a migration no banco**

Run:
```powershell
npx prisma migrate deploy
```
Esperado: aplica `20260704120000_add_version_columns` (e `0_baseline` se pendente). Mensagem final `All migrations have been successfully applied.`

- [ ] **Step 6: Confirmar 0 pendências**

Run:
```powershell
npx prisma migrate status
```
Esperado: `Database schema is up to date!` / nenhuma migration pendente.

- [ ] **Step 7: Smoke test de escrita real (prova que a coluna existe no banco)**

Suba a API em um terminal e, em outro, faça um update que usa `version`. Exemplo com o endpoint de estoque (ajuste atômico), que grava e devolve `version`:

```powershell
# Terminal A
npm run dev:api

# Terminal B — obtenha um token válido primeiro (login) e um id de item existente
$token = (Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/login -ContentType 'application/json' -Body '{"username":"admin","password":"SUA_SENHA"}').token
Invoke-RestMethod -Method Patch -Uri http://localhost:3001/api/inventory/1/stock -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body '{"delta":0}'
```
Esperado: resposta `{ success: true, quantity: <n>, version: <n> }` **sem** erro `column "version" does not exist`. (delta 0 não altera estoque, mas exercita o `updateMany` com `version`.)

- [ ] **Step 8: Rodar a suíte completa**

Run:
```powershell
npm run verify
```
Esperado: `tsc` 0 erros + `Tests 50 passed (50)`.

- [ ] **Step 9: Remover o documento operacional agora obsoleto**

```powershell
git rm docs/PENDENTE-APLICAR-MIGRATIONS.md
```

- [ ] **Step 10: Commit**

```powershell
git add -A
git commit -m @'
fix(prisma): regenera client e aplica migration de version columns; tsc verde

- npx prisma generate: resolve 11 erros de tipo sobre `version`
- migrate deploy: cria colunas `version` no banco (lock otimista funcional)
- remove docs/PENDENTE-APLICAR-MIGRATIONS.md (concluido)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `npm run typecheck` → 0 erros.
- [ ] `npx prisma migrate status` → sem pendências.
- [ ] Smoke test de escrita passou sem erro de coluna.
- [ ] `docs/PENDENTE-APLICAR-MIGRATIONS.md` removido.

## Riscos e mitigação

- **Banco de produção compartilhado:** `migrate deploy` roda contra o banco da `DATABASE_URL`. Confirme no Step 1 que é o banco certo (o doc PENDENTE alerta: os projetos Supabase `reybraztech` e `KRIOU-DOCS` **não** são o do InovaPro).
- **`ADD COLUMN ... DEFAULT 0`** é seguro (não reescreve linhas no Postgres moderno), sem downtime esperado.
- **Rollback:** as colunas têm default; se algo der errado no app, o rollback é reverter o deploy do código — o schema aditivo não quebra a versão anterior.
