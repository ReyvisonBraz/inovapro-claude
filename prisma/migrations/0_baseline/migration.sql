-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Concluído',
    "paymentId" INTEGER,
    "saleId" TEXT,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "customerId" INTEGER,
    "customerName" TEXT,
    "customerPhone" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "appName" TEXT DEFAULT 'Financeiro Pro',
    "appVersion" TEXT DEFAULT 'Versão Empresarial',
    "fiscalYear" TEXT DEFAULT '2024',
    "primaryColor" TEXT DEFAULT '#1152d4',
    "categories" TEXT DEFAULT 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
    "incomeCategories" TEXT DEFAULT 'Salário,Vendas,Serviços,Investimentos,Outros',
    "expenseCategories" TEXT DEFAULT 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
    "profileName" TEXT DEFAULT 'Inova Informática',
    "profileAvatar" TEXT DEFAULT 'https://picsum.photos/seed/inova/100/100',
    "initialBalance" DOUBLE PRECISION DEFAULT 0,
    "showWarnings" INTEGER DEFAULT 1,
    "hiddenColumns" TEXT DEFAULT '[]',
    "settingsPassword" TEXT DEFAULT '1234',
    "receiptLayout" TEXT DEFAULT 'a4',
    "receiptLogo" TEXT,
    "companyCnpj" TEXT,
    "companyAddress" TEXT,
    "pixKey" TEXT,
    "pixQrCode" TEXT,
    "shopWhatsapp" TEXT,
    "whatsappBillingTemplate" TEXT,
    "whatsappOSTemplate" TEXT,
    "sendPulseClientId" TEXT,
    "sendPulseClientSecret" TEXT,
    "sendPulseTemplateId" TEXT,
    "osPrintConfig" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nickname" TEXT,
    "cpf" TEXT,
    "companyName" TEXT,
    "phone" TEXT NOT NULL,
    "observation" TEXT,
    "creditLimit" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPayment" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION DEFAULT 0,
    "purchaseDate" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "installmentsCount" INTEGER DEFAULT 1,
    "type" TEXT DEFAULT 'income',
    "saleId" TEXT,
    "paymentHistory" TEXT DEFAULT '[]',
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ClientPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" SERIAL NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'employee',
    "name" TEXT NOT NULL,
    "permissions" TEXT DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sku" TEXT,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION DEFAULT 0,
    "salePrice" DOUBLE PRECISION DEFAULT 0,
    "quantity" INTEGER DEFAULT 0,
    "minQuantity" INTEGER DEFAULT 5,
    "stockLevel" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceOrder" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "equipmentType" TEXT,
    "equipmentBrand" TEXT,
    "equipmentModel" TEXT,
    "equipmentColor" TEXT,
    "equipmentSerial" TEXT,
    "reportedProblem" TEXT,
    "arrivalPhotoUrl" TEXT,
    "arrivalPhotoBase64" TEXT,
    "arrivalPhotoUrls" TEXT,
    "status" TEXT DEFAULT 'Aguardando Análise',
    "technicalAnalysis" TEXT,
    "servicesPerformed" TEXT,
    "services" JSONB DEFAULT '[]',
    "partsUsed" JSONB DEFAULT '[]',
    "serviceFee" DOUBLE PRECISION DEFAULT 0,
    "totalAmount" DOUBLE PRECISION DEFAULT 0,
    "finalObservations" TEXT,
    "entryDate" TEXT,
    "analysisPrediction" TEXT,
    "customerPassword" TEXT,
    "accessories" TEXT,
    "ramInfo" TEXT,
    "ssdInfo" TEXT,
    "priority" TEXT DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ServiceOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceOrderStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "priority" INTEGER DEFAULT 0,
    "isDefault" INTEGER DEFAULT 0,

    CONSTRAINT "ServiceOrderStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "equipmentType" TEXT,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "EquipmentType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Model_brandId_name_key" ON "Model"("brandId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentType_name_key" ON "EquipmentType"("name");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPayment" ADD CONSTRAINT "ClientPayment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "ClientPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

