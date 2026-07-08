-- Rastreio público por token não-adivinhável (fecha IDOR em /api/public/os/:id).

-- 1. coluna nullable para permitir backfill
ALTER TABLE "ServiceOrder" ADD COLUMN "publicToken" TEXT;

-- 2. backfill das OS existentes com UUID aleatório (Postgres 13+ tem gen_random_uuid nativo)
UPDATE "ServiceOrder" SET "publicToken" = gen_random_uuid()::text WHERE "publicToken" IS NULL;

-- 3. unicidade
CREATE UNIQUE INDEX "ServiceOrder_publicToken_key" ON "ServiceOrder"("publicToken");
