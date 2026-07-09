# Fase 2 · Tarefa 03 — Índices no banco (M3)

**Goal:** Criar índices nas foreign keys e nos campos usados em filtro/ordenação/agrupamento. Hoje [../../../prisma/schema.prisma](../../../prisma/schema.prisma) não tem **nenhum** `@@index`, então `groupBy(['status'])`, `orderBy: { dueDate }`, filtros por `type/category/date` e os `aggregate` de `stats.ts` fazem full scan — degradação garantida com o crescimento.

**Architecture:** Adicionamos `@@index` no schema e uma migration `CREATE INDEX` correspondente. Sem TDD (índice não muda comportamento, só desempenho): a verificação é `migrate status` limpo + `EXPLAIN` mostrando uso de índice.

## Índices a criar (justificativa por consulta real)

| Model | Índice | Consulta que se beneficia |
|-------|--------|---------------------------|
| Transaction | `customerId` | join/filtro por cliente; FK |
| Transaction | `paymentId` | `deleteMany({ where: { paymentId } })` e estorno; FK |
| Transaction | `[type, date]` | `aggregate`/`groupBy` de `stats.ts` (filtra type, faixa de date) |
| Transaction | `category` | filtro por categoria em `findMany` |
| ClientPayment | `customerId` | join; FK |
| ClientPayment | `dueDate` | `orderBy: { dueDate: 'asc' }` na listagem |
| ClientPayment | `status` | filtros e recontagens de status |
| ServiceOrder | `customerId` | join; FK |
| ServiceOrder | `status` | `groupBy(['status'])` + filtro |
| ServiceOrder | `createdAt` | `orderBy: { createdAt }` (default) |
| Receipt | `paymentId` | `deleteMany({ where: { paymentId } })`; FK |
| InventoryItem | `category` | filtro produto/serviço |
| AuditLog | `userId` | FK e listagem por usuário |
| AuditLog | `timestamp` | ordenação por data |

---

- [ ] **Step 1: Declarar os índices no schema**

Em `prisma/schema.prisma`, adicione as linhas `@@index(...)` ao final de cada model (dentro das chaves):

```prisma
model Transaction {
  // ...campos...
  @@index([customerId])
  @@index([paymentId])
  @@index([type, date])
  @@index([category])
}

model ClientPayment {
  // ...campos...
  @@index([customerId])
  @@index([dueDate])
  @@index([status])
}

model ServiceOrder {
  // ...campos...
  @@index([customerId])
  @@index([status])
  @@index([createdAt])
}

model Receipt {
  // ...campos...
  @@index([paymentId])
}

model InventoryItem {
  // ...campos...
  @@index([category])
}

model AuditLog {
  // ...campos...
  @@index([userId])
  @@index([timestamp])
}
```

- [ ] **Step 2: Criar a migration**

Crie `prisma/migrations/20260707130000_add_indexes/migration.sql`:

```sql
CREATE INDEX "Transaction_customerId_idx"  ON "Transaction"("customerId");
CREATE INDEX "Transaction_paymentId_idx"   ON "Transaction"("paymentId");
CREATE INDEX "Transaction_type_date_idx"   ON "Transaction"("type", "date");
CREATE INDEX "Transaction_category_idx"    ON "Transaction"("category");

CREATE INDEX "ClientPayment_customerId_idx" ON "ClientPayment"("customerId");
CREATE INDEX "ClientPayment_dueDate_idx"    ON "ClientPayment"("dueDate");
CREATE INDEX "ClientPayment_status_idx"     ON "ClientPayment"("status");

CREATE INDEX "ServiceOrder_customerId_idx" ON "ServiceOrder"("customerId");
CREATE INDEX "ServiceOrder_status_idx"     ON "ServiceOrder"("status");
CREATE INDEX "ServiceOrder_createdAt_idx"  ON "ServiceOrder"("createdAt");

CREATE INDEX "Receipt_paymentId_idx"       ON "Receipt"("paymentId");

CREATE INDEX "InventoryItem_category_idx"  ON "InventoryItem"("category");

CREATE INDEX "AuditLog_userId_idx"    ON "AuditLog"("userId");
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");
```

> Os nomes seguem a convenção que o Prisma geraria (`<Model>_<col>_idx`), para o schema e o banco não divergirem. Confira com `npx prisma migrate diff` se quiser gerar automaticamente em vez de escrever à mão (recomendado — ver Step 3).

- [ ] **Step 3 (alternativa recomendada): gerar a migration pelo Prisma**

Em vez de escrever o SQL à mão, deixe o Prisma gerar após o Step 1:

```powershell
npx prisma migrate dev --name add_indexes --create-only
```
Isso cria a migration a partir do diff do schema. Revise o SQL gerado (deve bater com o Step 2) e siga.

- [ ] **Step 4: Aplicar e regenerar**

Run:
```powershell
npx prisma migrate deploy
npx prisma generate
npm run typecheck
```
Esperado: migração aplicada; `tsc` 0 erros (índices não mudam tipos, mas confirmamos verde).

- [ ] **Step 5: Confirmar 0 pendências**

Run:
```powershell
npx prisma migrate status
```
Esperado: sem pendências.

- [ ] **Step 6: Verificar uso do índice (EXPLAIN)**

Com a API/banco de dev, rode no console do Postgres (ou via `prisma studio`/psql):

```sql
EXPLAIN ANALYZE SELECT * FROM "ClientPayment" ORDER BY "dueDate" ASC LIMIT 20;
EXPLAIN ANALYZE SELECT "status", count(*) FROM "ServiceOrder" GROUP BY "status";
```
Esperado: o plano menciona `Index Scan`/`Index Only Scan` (não `Seq Scan` puro em tabelas grandes). Em tabelas pequenas o Postgres pode preferir Seq Scan — normal; o ganho aparece com volume.

- [ ] **Step 7: Rodar a suíte**

Run:
```powershell
npm run verify
```
Esperado: verde (os testes de concorrência com prisma mockado não são afetados).

- [ ] **Step 8: Commit**

```powershell
git add prisma/
git commit -m @'
perf(db): indices em FKs e campos de filtro/ordenacao/groupBy

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] Schema com `@@index` nos campos listados; migration aplicada.
- [ ] `prisma migrate status` sem pendências.
- [ ] `npm run verify` verde.

## Nota

- Datas ainda são `String` (`Transaction.date`, `ClientPayment.dueDate`). O índice ajuda mesmo assim (ordenação lexicográfica de ISO). A migração `String → DateTime` é tratada na Fase 6 (`03-datas-string-para-datetime.md`) e, quando feita, os índices continuam válidos.
