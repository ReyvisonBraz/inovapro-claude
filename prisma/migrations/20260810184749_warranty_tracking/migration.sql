-- AlterTable
ALTER TABLE "ServiceOrder" ADD COLUMN     "warrantyReturn" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "warrantyDefaultMonths" INTEGER DEFAULT 3;

-- CreateTable
CREATE TABLE "Warranty" (
    "id" SERIAL NOT NULL,
    "serviceOrderId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "warrantyMonths" INTEGER NOT NULL,
    "expiresAt" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Warranty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Warranty_serviceOrderId_idx" ON "Warranty"("serviceOrderId");

-- CreateIndex
CREATE INDEX "Warranty_expiresAt_idx" ON "Warranty"("expiresAt");

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
