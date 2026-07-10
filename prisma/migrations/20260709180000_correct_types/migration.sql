-- ============================================================================
-- FASE 4.1: Correção de tipos — Float → Decimal(12,2) e String → Date
-- ============================================================================
-- Dinheiro: Float (imprecisão de ponto flutuante) → Decimal(12,2) exato.
-- Datas: String ("yyyy-MM-dd") → DATE (tipo nativo do PostgreSQL).
-- ============================================================================

-- Transaction: amount, date
ALTER TABLE "Transaction" ALTER COLUMN "amount" TYPE DECIMAL(12,2) USING "amount"::numeric(12,2);
ALTER TABLE "Transaction" ALTER COLUMN "date" TYPE DATE USING "date"::date;

-- Settings: initialBalance
ALTER TABLE "Settings" ALTER COLUMN "initialBalance" TYPE DECIMAL(12,2) USING "initialBalance"::numeric(12,2);

-- Customer: creditLimit
ALTER TABLE "Customer" ALTER COLUMN "creditLimit" TYPE DECIMAL(12,2) USING "creditLimit"::numeric(12,2);

-- ClientPayment: totalAmount, paidAmount, purchaseDate, dueDate
ALTER TABLE "ClientPayment" ALTER COLUMN "totalAmount" TYPE DECIMAL(12,2) USING "totalAmount"::numeric(12,2);
ALTER TABLE "ClientPayment" ALTER COLUMN "paidAmount" TYPE DECIMAL(12,2) USING "paidAmount"::numeric(12,2);
ALTER TABLE "ClientPayment" ALTER COLUMN "purchaseDate" TYPE DATE USING "purchaseDate"::date;
ALTER TABLE "ClientPayment" ALTER COLUMN "dueDate" TYPE DATE USING "dueDate"::date;

-- InventoryItem: unitPrice, costPrice, salePrice
ALTER TABLE "InventoryItem" ALTER COLUMN "unitPrice" TYPE DECIMAL(12,2) USING "unitPrice"::numeric(12,2);
ALTER TABLE "InventoryItem" ALTER COLUMN "costPrice" TYPE DECIMAL(12,2) USING "costPrice"::numeric(12,2);
ALTER TABLE "InventoryItem" ALTER COLUMN "salePrice" TYPE DECIMAL(12,2) USING "salePrice"::numeric(12,2);

-- ServiceOrder: serviceFee, totalAmount, entryDate
ALTER TABLE "ServiceOrder" ALTER COLUMN "serviceFee" TYPE DECIMAL(12,2) USING "serviceFee"::numeric(12,2);
ALTER TABLE "ServiceOrder" ALTER COLUMN "totalAmount" TYPE DECIMAL(12,2) USING "totalAmount"::numeric(12,2);
ALTER TABLE "ServiceOrder" ALTER COLUMN "entryDate" TYPE DATE USING "entryDate"::date;