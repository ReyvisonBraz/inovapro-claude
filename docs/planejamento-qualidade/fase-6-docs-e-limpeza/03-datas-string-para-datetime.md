# Fase 6 · Tarefa 03 — Migrar datas `String → DateTime`

**Goal:** Corrigir o modelo de dados: `Transaction.date`, `ClientPayment.purchaseDate`/`dueDate`, `ServiceOrder.entryDate` etc. são `String` no [../../../prisma/schema.prisma](../../../prisma/schema.prisma). Range queries dependem de formato ISO exato e não há validação de banco; ordenação é lexicográfica. `DateTime` dá integridade e consultas corretas.

**Architecture:** Migração cuidadosa: as strings hoje são ISO (`YYYY-MM-DD` ou ISO completo). Convertemos coluna a coluna com `USING to_timestamp/to_date`, atualizamos o schema e ajustamos os pontos de código que montam/comparam essas datas. É uma tarefa de risco médio — faça **uma entidade por vez**, com verificação.

> **Opcional/decisão:** se o custo não compensar agora, é legítimo **manter `String` e documentar** a decisão (os índices da Fase 2 já ajudam). Se seguir, faça por entidade.

## Interfaces

- **Afeta:** schema Prisma, migrations, e os pontos que fazem `new Date().toISOString().split('T')[0]`, comparações `gte/lte` de data, e formatação no front (`date-fns`).

---

- [ ] **Step 1: Auditar formatos existentes (antes de converter)**

No banco, confirme que as colunas de data estão em ISO consistente:
```sql
SELECT DISTINCT length(date) FROM "Transaction" LIMIT 20;
SELECT date FROM "Transaction" ORDER BY id DESC LIMIT 10;
```
Esperado: `YYYY-MM-DD` (len 10) ou ISO completo. Se houver formatos mistos, normalize antes (script de limpeza) — **não** converta com dados sujos.

- [ ] **Step 2: Começar por `Transaction.date` — schema**

Em `schema.prisma`, troque:
```prisma
  date        DateTime @db.Date   // era String (YYYY-MM-DD)
```
> Use `@db.Date` se for só data (sem hora); `DateTime` puro para timestamp. `Transaction.date` é dia → `@db.Date`.

- [ ] **Step 3: Migration com conversão preservando dados**

Crie `prisma/migrations/20260707140000_transaction_date_to_date/migration.sql`:
```sql
ALTER TABLE "Transaction"
  ALTER COLUMN "date" TYPE date USING (
    CASE WHEN "date" ~ '^\d{4}-\d{2}-\d{2}' THEN substring("date" for 10)::date ELSE NULL END
  );
```
> O `substring(... for 10)` cobre tanto `YYYY-MM-DD` quanto ISO completo. Linhas fora do padrão viram `NULL` — por isso o Step 1 (auditoria) é obrigatório.

- [ ] **Step 4: Aplicar + regenerar + tipos**

Run:
```powershell
npx prisma migrate deploy
npx prisma generate
npm run typecheck
```
Esperado: `tsc` agora **acusa** os pontos onde `date` era tratado como string (é o que queremos ver). Ex.: `transaction.service.ts` passa `date` string ao `create`; Zod `TransactionSchema.date` é `string`.

- [ ] **Step 5: Ajustar código ao novo tipo**

- Zod: `date` continua chegando como string do cliente; converta no service (`new Date(date)`) ou no schema (`z.coerce.date()`).
- Services: onde monta `date: new Date().toISOString().split('T')[0]`, passe `new Date()` (o Prisma aceita `Date`).
- Comparações `gte/lte` em `findMany`: passe `Date`, não string.
- Front: a resposta agora traz ISO com hora; ajuste `date-fns` (`parseISO`) onde assumia `YYYY-MM-DD`.

- [ ] **Step 6: Teste de regressão do fluxo financeiro**

Rode a suíte (e a suíte DB-backed da Fase 4, se configurada). Verifique manualmente: criar transação, filtrar por período, relatório mensal (`stats.ts` usa `date` em `aggregate` — confirme que os filtros de mês ainda batem).
```powershell
npm run verify
```

- [ ] **Step 7: Commit da entidade**

```powershell
git add prisma/ src/ 
git commit -m @'
refactor(db): Transaction.date de String para DateTime (@db.Date)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

- [ ] **Step 8: Repetir por entidade**

Aplique os Steps 2–7, um de cada vez, para:
- `ClientPayment.purchaseDate`, `ClientPayment.dueDate`
- `ServiceOrder.entryDate`, `analysisPrediction` (se for data)

> Uma entidade por commit. Nunca converta todas as colunas numa migration só — se algo der errado, o blast radius fica contido.

## Critério de conclusão da tarefa

- [ ] Colunas de data em `DateTime`/`@db.Date` (ou decisão de manter `String` documentada em `docs/`).
- [ ] Filtros por período e relatórios mensais validados.
- [ ] `npm run verify` verde.

## Riscos

- **Dados sujos** (formatos mistos) viram `NULL` na conversão — por isso a auditoria do Step 1. Faça backup antes (a Fase 0 já ensinou o export).
- **Fuso horário:** `@db.Date` evita surpresas de timezone para campos "dia". Para timestamps, padronize UTC.
