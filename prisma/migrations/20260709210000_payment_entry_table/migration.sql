-- ============================================================================
-- FASE 4.2a: ClientPayment.paymentHistory (string JSON) → tabela PaymentEntry
-- ============================================================================
-- Cria a tabela PaymentEntry para integridade referencial de registros
-- financeiros. Extrai dados existentes do JSON string paymentHistory. Dropa
-- a coluna antiga.
-- ============================================================================

-- 1. Criar tabela PaymentEntry
CREATE TABLE "PaymentEntry" (
  "id"        SERIAL PRIMARY KEY,
  "paymentId" INTEGER NOT NULL,
  "amount"    DECIMAL(12,2) NOT NULL,
  "date"      TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "createdBy" INTEGER
);

CREATE INDEX "PaymentEntry_paymentId_idx" ON "PaymentEntry" ("paymentId");

ALTER TABLE "PaymentEntry"
  ADD CONSTRAINT "PaymentEntry_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "ClientPayment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Extrair dados existentes do paymentHistory JSON
DO $$
DECLARE
  r RECORD;
  entries JSONB;
  e JSONB;
  entry_date TEXT;
BEGIN
  FOR r IN
    SELECT id, "paymentHistory", "createdBy"
    FROM "ClientPayment"
    WHERE "paymentHistory" IS NOT NULL
      AND "paymentHistory" != '[]'
      AND "paymentHistory" != ''
  LOOP
    BEGIN
      entries := r."paymentHistory"::jsonb;
      IF jsonb_typeof(entries) = 'array' THEN
        FOR e IN SELECT * FROM jsonb_array_elements(entries)
        LOOP
          entry_date := e->>'date';
          INSERT INTO "PaymentEntry" ("paymentId", "amount", "date", "createdBy")
          VALUES (
            r.id,
            COALESCE((e->>'amount')::numeric(12,2), 0),
            CASE
              WHEN entry_date IS NOT NULL AND entry_date ~ '^\d{4}-\d{2}-\d{2}' THEN entry_date::timestamp
              ELSE NOW()
            END,
            r."createdBy"
          );
        END LOOP;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping malformed paymentHistory for payment %: %', r.id, SQLERRM;
    END;
  END LOOP;
END $$;

-- 3. Dropar a coluna paymentHistory
ALTER TABLE "ClientPayment" DROP COLUMN IF EXISTS "paymentHistory";