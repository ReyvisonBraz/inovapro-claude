# Backup e Restore — INOVA PRO

O banco de produção é PostgreSQL gerenciado no **Supabase**. A estratégia usa os
backups gerenciados da plataforma + um **drill de restore** periódico. Regra
operacional: *backup que nunca foi restaurado não é backup*.

## Estratégia de backup

| Camada | O que | Retenção | Responsável |
| --- | --- | --- | --- |
| PITR (point-in-time recovery) | Continuidade (WAL) — recupera até um minuto antes | Depende do plano (Pro+: 7 dias) | Supabase (automático) |
| Backup diário (scheduled) | Snapshot completo | Conforme plano | Supabase (automático) |
| Verificação de restore | Drill real de `pg_restore` | — | Dono (trimestral) |

- Habilitar: Supabase → **Database → Backups** → confirmar **PITR** ativo e
  **Scheduled backups** ligados. Em planos gratuitos, a retenção é curta — isso é
  aceitável agora, mas um plano pago é pré-requisito para SLA real.
- As credenciais de acesso ao projeto (senha do banco) ficam **só** em:
  `DATABASE_URL` da Vercel, secret `PRODUCTION_DATABASE_URL` do GitHub Actions e
  cofre do dono. Nunca em arquivo versionado.

## Drill de restore (trimestral)

Objetivo: provar que conseguimos recuperar o banco de verdade. O drill usa um
Postgres descartável local (nunca toca produção).

1. Baixar o backup:
   ```bash
   # Supabase → Database → Backups → escolher o snapshot → "Restore" gera uma
   # URL assinada; ou exportar via pg_dump contra a conexão direta (porta 5432):
   pg_dump --no-owner --no-acl \
     "postgresql://postgres.<ref>:<SENHA>@aws-1-us-west-2.pooler.supabase.com:5432/postgres" \
     -Fc -f /tmp/inovapro-restore-test.dump
   ```
   ⚠️ Use a **conexão direta (5432)**, não o pooler (6543), para dumps/migrations.
2. Subir um Postgres descartável:
   ```bash
   docker run --rm --name restore-drill -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=test -e POSTGRES_DB=postgres -p 5439:5432 -d postgres:16-alpine
   ```
3. Restaurar:
   ```bash
   pg_restore -d "postgresql://postgres:test@localhost:5439/postgres" \
     --no-owner --no-acl /tmp/inovapro-restore-test.dump
   ```
4. Validar: conferir contagens de tabelas críticas (ex.: `users`, `service_order`,
   `transaction`, `stock_item`) contra um valor conhecido; conferir que
   `_prisma_migrations` bate com a lista de `prisma/migrations/`:
   ```bash
   npx prisma migrate status   # contra a DATABASE_URL do drill
   ```
5. Descartar o container e anotar o resultado.

Checklist do drill (executar e guardar o log):
- [ ] Snapshot/PITR disponível no painel
- [ ] `pg_dump` completa sem erro
- [ ] `pg_restore` completa sem erro
- [ ] Contagens de tabelas críticas conferem
- [ ] `prisma migrate status` limpo no banco restaurado
- [ ] Login de smoke funciona contra o banco restaurado

## Recuperação real (disaster)

1. Provisionar um novo projeto Supabase (ou restaurar dentro do existente se o
   dano for pontual e o PITR alcançar).
2. Restaurar o dump/backup no novo projeto.
3. Apontar `DATABASE_URL` (Vercel) e `PRODUCTION_DATABASE_URL` (GitHub) para o
   novo projeto.
4. Validar: `/api/health` 200, login funcional, dados das tabelas críticas
   presentes, migrations em dia.
5. Ajustar DNS/domínio apenas se o projeto de banco tiver mudado de ref.
