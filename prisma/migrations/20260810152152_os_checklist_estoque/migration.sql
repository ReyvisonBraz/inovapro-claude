-- AlterTable
ALTER TABLE "ServiceOrder" ADD COLUMN     "checklistIn" JSONB,
ADD COLUMN     "checklistOut" JSONB;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "checklistTemplate" JSONB DEFAULT '{"entrada":[],"saida":[]}',
ADD COLUMN     "deductStockStatuses" JSONB DEFAULT '["Concluído","Entregue","Pronto"]';
