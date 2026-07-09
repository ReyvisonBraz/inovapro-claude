# Baseline — antes da Fase 0

Data: 2026-07-07
Branch: qualidade/fase-0-preparacao

## tsc --noEmit (antes) — FALHA (exit 2)

10 erros, todos sobre a coluna `version` não existir nos tipos do Prisma Client
(client desatualizado em relação ao schema.prisma):

```
src/routes/inventory.ts(91,70): error TS2339: Property 'version' does not exist ...
src/services/client-payment.service.ts(135,52): error TS2322: 'version' does not exist in type 'ClientPaymentWhereInput'
src/services/client-payment.service.ts(167,13): error TS2353: 'version' does not exist ...
src/services/customer.service.ts(74,110): error TS2353: 'version' does not exist ...
src/services/inventory.service.ts(25,9): error TS2353: 'version' does not exist ...
src/services/inventory.service.ts(48,52): error TS2322: 'version' does not exist in type 'InventoryItemWhereInput'
src/services/service-order.service.ts(230,52): error TS2322: 'version' does not exist in type 'ServiceOrderWhereInput'
src/services/transaction.service.ts(106,52): error TS2322: 'version' does not exist in type 'TransactionWhereInput'
src/services/transaction.service.ts(114,9): error TS2353: 'version' does not exist ...
src/services/transaction.service.ts(149,15): error TS2353: 'version' does not exist ...
```

Causa: `npx prisma generate` não foi rodado após adicionar `version` ao schema,
e a migration `20260704120000_add_version_columns` está pendente no banco.

## vitest run (antes) — VERDE (exit 0)

```
Test Files  5 passed (5)
Tests  50 passed (50)
```

## Meta da Fase 0

- tsc: 10 erros → 0 (via `prisma generate`)
- banco: aplicar migration `add_version_columns` (via `migrate deploy`)
- testes: manter 50 verdes
