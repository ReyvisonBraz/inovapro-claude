-- Enable trigram index support (LIKE/ILIKE '%term%')
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_firstName_lastName_idx" ON "Customer"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "ServiceOrder_entryDate_idx" ON "ServiceOrder"("entryDate");

-- CreateIndex
CREATE INDEX "ServiceOrder_createdBy_entryDate_idx" ON "ServiceOrder"("createdBy", "entryDate");

-- CreateIndex
CREATE INDEX "ServiceOrder_status_entryDate_idx" ON "ServiceOrder"("status", "entryDate");

-- CreateIndex
CREATE INDEX "ServiceOrder_priority_idx" ON "ServiceOrder"("priority");

-- CreateIndex
CREATE INDEX "ServiceOrder_updatedAt_idx" ON "ServiceOrder"("updatedAt");

-- GIN trigram indexes for customer search (ILIKE '%term%')
CREATE INDEX "Customer_firstName_trgm" ON "Customer" USING GIN ("firstName" gin_trgm_ops);
CREATE INDEX "Customer_lastName_trgm" ON "Customer" USING GIN ("lastName" gin_trgm_ops);
CREATE INDEX "Customer_nickname_trgm" ON "Customer" USING GIN ("nickname" gin_trgm_ops);
CREATE INDEX "Customer_companyName_trgm" ON "Customer" USING GIN ("companyName" gin_trgm_ops);
CREATE INDEX "Customer_phone_trgm" ON "Customer" USING GIN ("phone" gin_trgm_ops);

-- GIN trigram indexes for service order search (equipment)
CREATE INDEX "ServiceOrder_equipmentBrand_trgm" ON "ServiceOrder" USING GIN ("equipmentBrand" gin_trgm_ops);
CREATE INDEX "ServiceOrder_equipmentModel_trgm" ON "ServiceOrder" USING GIN ("equipmentModel" gin_trgm_ops);
CREATE INDEX "ServiceOrder_equipmentType_trgm" ON "ServiceOrder" USING GIN ("equipmentType" gin_trgm_ops);
CREATE INDEX "ServiceOrder_equipmentSerial_trgm" ON "ServiceOrder" USING GIN ("equipmentSerial" gin_trgm_ops);
