# ⚠️ PENDENTE — Aplicar migrations da Fase 1 no banco de produção

> Criado em 2026-07-05. Apague este arquivo depois de concluir tudo.
>
> **Contexto:** a Fase 1 do plano ([plans/2026-07-04-plano-melhorias-geral.md](plans/2026-07-04-plano-melhorias-geral.md))
> foi implementada e testada no código (lock otimista com coluna `version`, operações
> financeiras e de estoque atômicas), mas **as migrations ainda não foram aplicadas no
> banco de produção** porque a máquina onde o trabalho foi feito não tinha a
> `DATABASE_URL` configurada. Este arquivo é o passo a passo para rodar no PC que tem o `.env`.

---

## O que precisa existir antes de começar

- [ ] Arquivo `.env` na raiz do projeto com `DATABASE_URL` apontando para o banco de produção
      (formato: `postgresql://usuario:senha@host:5432/banco`)
- [ ] `npm install` já rodado (o CLI `prisma` agora é dependência do projeto)

> Não sabe onde está a `DATABASE_URL`? Olhe as variáveis de ambiente no painel de onde a
> API roda em produção (Vercel → Settings → Environment Variables, ou Render → Environment).
> O host da URL diz onde o banco está (Railway, Supabase, Neon...).
> Obs.: os 2 projetos Supabase da conta (reybraztech e KRIOU-DOCS) **não** são o banco do InovaPro.

## Passo a passo (na ordem, um de cada vez)

### 1. Conferir que está falando com o banco certo

```bash
npx prisma migrate status
```

Esperado: ele conecta e lista as 2 migrations como **pendentes**
(`0_baseline` e `20260704120000_add_version_columns`).
Se der erro de conexão, o problema é a `DATABASE_URL` — não siga adiante.

- [ ] `migrate status` conectou e mostrou as 2 migrations pendentes

### 2. Fazer backup do banco (segurança)

```bash
pg_dump "$DATABASE_URL" > backups/backup-pre-version-$(date +%Y%m%d).sql
```

(Se não tiver `pg_dump` instalado, um backup pelo painel do provedor também serve.)

- [ ] Backup feito

### 3. Marcar o baseline como já aplicado (UMA VEZ SÓ)

O banco de produção **já tem** todas as tabelas do baseline. Este comando não altera
nada — apenas registra na tabela `_prisma_migrations` que o `0_baseline` já está aplicado,
para o Prisma não tentar recriar as tabelas:

```bash
npx prisma migrate resolve --applied 0_baseline
```

- [ ] Baseline marcado como aplicado

### 4. Aplicar a migration nova (coluna `version`)

```bash
npx prisma migrate deploy
```

Esperado: aplica apenas a `20260704120000_add_version_columns`
(adiciona `version INTEGER NOT NULL DEFAULT 0` em Transaction, Settings, Customer,
ClientPayment, InventoryItem e ServiceOrder). É uma alteração rápida e segura —
só adiciona coluna com default, não mexe em dados existentes.

- [ ] `migrate deploy` rodou sem erro

### 5. Conferir o resultado

```bash
npx prisma migrate status
```

Esperado: `Database schema is up to date!`

- [ ] Status limpo

### 6. Fazer deploy do código novo

O código da Fase 1 (branch/commits locais ainda **não commitados** quando este arquivo
foi criado — confira o `git status`) precisa ir para produção **depois** da migration,
porque ele envia/espera o campo `version`. Ordem segura:

1. Migration aplicada (passos 3–4 acima) ✅
2. Commit + push do código
3. Deploy normal (Vercel/Render/Docker)

> Os deploys futuros aplicam migrations sozinhos: o `Dockerfile` e o `render.yaml`
> agora rodam `npx prisma migrate deploy` na inicialização. Este passo a passo manual
> é só para esta primeira vez (por causa do baseline).

- [ ] Código commitado e deployado

## Se algo der errado

- **Erro P3005 no `migrate deploy`** ("database schema is not empty"): o passo 3 (resolve)
  não foi executado — rode-o e tente de novo.
- **Erro de conexão**: confira a `DATABASE_URL`; se o banco for Supabase e o projeto estiver
  pausado, restaure-o no painel primeiro.
- **Qualquer coisa estranha**: nada foi destruído — a migration só adiciona colunas.
  O backup do passo 2 é a rede de segurança.

## Referências

- Fluxo de migrations documentado em: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) §6.1
- Regras de concorrência (por que a coluna `version` existe): [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) §6.2
- Plano geral com as próximas fases: [plans/2026-07-04-plano-melhorias-geral.md](plans/2026-07-04-plano-melhorias-geral.md)
