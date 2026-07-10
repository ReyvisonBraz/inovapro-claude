-- ============================================================================
-- FASE 4.3: Índices compostos + onDelete explícito nas relações
-- ============================================================================

-- Índices compostos --------------------------------------------------------

CREATE INDEX IF NOT EXISTS "Transaction_date_type_idx" ON "Transaction" ("date", "type");
CREATE INDEX IF NOT EXISTS "ClientPayment_customerId_status_dueDate_idx" ON "ClientPayment" ("customerId", "status", "dueDate");
CREATE INDEX IF NOT EXISTS "AuditLog_entity_entityId_idx" ON "AuditLog" ("entity", "entityId");
CREATE INDEX IF NOT EXISTS "ServiceOrder_status_createdAt_idx" ON "ServiceOrder" ("status", "createdAt");

-- onDelete explícito -------------------------------------------------------

-- Transaction.customerId → SET NULL (preserva transações sem cliente)
ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_customerId_fkey";
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ClientPayment.customerId → CASCADE (deleta pagamentos com o cliente)
ALTER TABLE "ClientPayment" DROP CONSTRAINT IF EXISTS "ClientPayment_customerId_fkey";
ALTER TABLE "ClientPayment" ADD CONSTRAINT "ClientPayment_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Receipt.paymentId → CASCADE (deleta recibos com o pagamento)
ALTER TABLE "Receipt" DROP CONSTRAINT IF EXISTS "Receipt_paymentId_fkey";
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "ClientPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AuditLog.userId → SET NULL (preserva logs de auditoria)
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_userId_fkey";
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ServiceOrder.customerId → CASCADE (deleta OS com o cliente)
ALTER TABLE "ServiceOrder" DROP CONSTRAINT IF EXISTS "ServiceOrder_customerId_fkey";
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Model.brandId → CASCADE (deleta modelos com a marca)
ALTER TABLE "Model" DROP CONSTRAINT IF EXISTS "Model_brandId_fkey";
ALTER TABLE "Model" ADD CONSTRAINT "Model_brandId_fkey"
  FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;