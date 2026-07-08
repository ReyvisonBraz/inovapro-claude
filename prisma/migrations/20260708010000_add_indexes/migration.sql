-- Índices em FKs e campos usados em filtro/ordenação/groupBy (evita full scan).

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
